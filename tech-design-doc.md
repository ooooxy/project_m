
# 项目管理系统 - 前后端分离技术设计文档

## 1. 概述

### 1.1 项目背景

本项目是一个工作流管理系统（Workflow Manager），当前存在以下问题：
- 数据完全硬编码在前端
- 无后端数据库持久化
- 数据依赖 localStorage，刷新后可能丢失
- 无法实现多用户协作

### 1.2 目标

通过引入后端数据库和 RESTful API，实现：
- 数据持久化存储
- 多用户数据共享
- 标准化的 API 接口
- 可扩展的架构设计

### 1.3 技术选型

| 层次 | 技术 | 版本 | 选型理由 |
|------|------|------|----------|
| 前端框架 | React | 18.2.0 | 现有技术栈，生态成熟 |
| 前端语言 | TypeScript | 5.2.2 | 类型安全，减少运行时错误 |
| 状态管理 | Zustand | 4.5.0 | 轻量、高性能状态管理 |
| 后端框架 | Express | ^4.x | 轻量、社区成熟、学习成本低 |
| 数据库 | SQLite | 3.x | 轻量、无需额外服务、文件存储 |
| ORM | Prisma | 5.x | 类型安全、自动生成 CRUD |
| API 文档 | Swagger | - | 自动生成接口文档 |

---

## 2. 架构设计

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        前端层 (Frontend)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ KanbanPage  │  │StoriesPage  │  │Milestones  │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                 │                 │                    │
│         ▼                 ▼                 ▼                    │
│  ┌───────────────────────────────────────────────┐              │
│  │              Custom Hooks Layer               │              │
│  │  useTeam | useMilestones | useStories | useTasks│            │
│  └────────────────────┬──────────────────────────┘              │
│                       │                                         │
│                       ▼                                         │
│  ┌───────────────────────────────────────────────┐              │
│  │                 API Service Layer              │              │
│  │           (Axios 封装 + 拦截器)               │              │
│  └────────────────────┬──────────────────────────┘              │
└───────────────────────┼─────────────────────────────────────────┘
                        │ HTTP/JSON
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                        后端层 (Backend)                         │
│  ┌───────────────────────────────────────────────┐              │
│  │              Express Middleware               │              │
│  │  CORS | BodyParser | ErrorHandler | Logger   │              │
│  └────────────────────┬──────────────────────────┘              │
│                       │                                         │
│                       ▼                                         │
│  ┌───────────────────────────────────────────────┐              │
│  │                   API Routes                   │              │
│  │  /api/team | /api/milestones | /api/stories   │              │
│  │           | /api/tasks | /api/auth            │              │
│  └────────────────────┬──────────────────────────┘              │
│                       │                                         │
│                       ▼                                         │
│  ┌───────────────────────────────────────────────┐              │
│  │                 Service Layer                  │              │
│  │         (业务逻辑 + Prisma 数据访问)           │              │
│  └────────────────────┬──────────────────────────┘              │
│                       │                                         │
│                       ▼                                         │
│  ┌───────────────────────────────────────────────┐              │
│  │              Prisma ORM + SQLite              │              │
│  └───────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 数据流设计

**前端数据流向：**
```
用户操作 → React组件 → Custom Hooks → API Service → HTTP请求 → 后端API
                                                          ↓
响应数据 ← API Service ← Custom Hooks ← React组件 ← UI更新
```

**后端数据流向：**
```
HTTP请求 → Express路由 → Service层 → Prisma → SQLite数据库
                                    ↓
响应数据 ← Service层 ← Express路由 ← HTTP响应
```

---

## 3. 数据库设计

### 3.1 实体关系图 (ERD)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ TeamMember   │       │   Milestone  │       │  UserStory   │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ name         │       │ name         │       │ title        │
│ role         │       │ description  │       │ description  │
│ avatar       │       │ startDate    │       │ milestoneId  │
│ color        │       │ endDate      │       │ priority     │
│ createdAt    │       │ status       │       │ createdAt    │
│ updatedAt    │       │ createdAt    │       │ updatedAt    │
└──────────────┘       │ updatedAt    │       └──────┬───────┘
        │              └──────┬───────┘              │
        │                     │                      │
        │                     │                      │
        │                     │                      ↓
        │                     │              ┌──────────────┐
        │                     │              │     Task     │
        │                     │              ├──────────────┤
        └─────────────────────┼──────────────►│ id (PK)      │
                              │              │ title        │
                              │              │ description  │
                              │              │ userStoryId  │
                              │              │ creatorId    │
                              │              │ assigneeId   │
                              │              │ status       │
                              │              │ type         │
                              │              │ startDate    │
                              │              │ endDate      │
                              │              │ dependsOn    │
                              │              │ createdAt    │
                              │              │ updatedAt    │
                              │              └──────────────┘
                              │
                              ↓
                      ┌──────────────┐
                      │    User      │
                      ├──────────────┤
                      │ id (PK)      │
                      │ name         │
                      │ email        │
                      │ avatar       │
                      │ feishuUserId │
                      │ createdAt    │
                      │ updatedAt    │
                      └──────────────┘
```

### 3.2 数据表设计

#### 3.2.1 TeamMember（团队成员）

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | String | PRIMARY KEY | UUID 主键 |
| name | String | NOT NULL | 成员姓名 |
| role | String | NOT NULL | 角色：uiux/frontend/backend/test |
| avatar | String | NOT NULL | 头像显示名称 |
| color | String | NOT NULL | 头像颜色 |
| createdAt | DateTime | DEFAULT now() | 创建时间 |
| updatedAt | DateTime | @updatedAt | 更新时间 |

#### 3.2.2 Milestone（里程碑）

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | String | PRIMARY KEY | UUID 主键 |
| name | String | NOT NULL | 里程碑名称 |
| description | String | NULL | 描述说明 |
| startDate | String | NOT NULL | 开始日期 (YYYY-MM-DD) |
| endDate | String | NOT NULL | 结束日期 (YYYY-MM-DD) |
| status | String | NOT NULL | 状态：planning/in-progress/completed |
| createdAt | DateTime | DEFAULT now() | 创建时间 |
| updatedAt | DateTime | @updatedAt | 更新时间 |

#### 3.2.3 UserStory（用户故事）

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | String | PRIMARY KEY | UUID 主键 |
| title | String | NOT NULL | 故事标题 |
| description | String | NULL | 描述说明 |
| milestoneId | String | FOREIGN KEY | 关联里程碑 |
| priority | String | NOT NULL | 优先级：low/medium/high |
| createdAt | DateTime | DEFAULT now() | 创建时间 |
| updatedAt | DateTime | @updatedAt | 更新时间 |

#### 3.2.4 Task（任务）

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | String | PRIMARY KEY | UUID 主键 |
| title | String | NOT NULL | 任务标题 |
| description | String | NULL | 描述说明 |
| userStoryId | String | FOREIGN KEY | 关联用户故事 |
| creatorId | String | FOREIGN KEY | 创建者 ID |
| assigneeId | String | FOREIGN KEY | 负责人 ID |
| status | String | NOT NULL | 状态：todo/in-progress/review/done |
| type | String | NOT NULL | 类型：design/dev/test |
| startDate | String | NOT NULL | 开始日期 |
| endDate | String | NOT NULL | 结束日期 |
| dependsOn | String[] | NULL | 依赖任务 ID 列表 |
| createdAt | DateTime | DEFAULT now() | 创建时间 |
| updatedAt | DateTime | @updatedAt | 更新时间 |

#### 3.2.5 User（用户）

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | String | PRIMARY KEY | UUID 主键 |
| name | String | NOT NULL | 用户姓名 |
| email | String | UNIQUE, NOT NULL | 邮箱 |
| avatar | String | NULL | 头像 URL |
| feishuUserId | String | UNIQUE | 飞书用户 ID |
| createdAt | DateTime | DEFAULT now() | 创建时间 |
| updatedAt | DateTime | @updatedAt | 更新时间 |

---

## 4. API 接口设计

### 4.1 接口总览

| 模块 | 基础路径 | 功能 |
|------|----------|------|
| 团队成员 | `/api/team` | CRUD 操作 |
| 里程碑 | `/api/milestones` | CRUD 操作 |
| 用户故事 | `/api/stories` | CRUD 操作 |
| 任务 | `/api/tasks` | CRUD 操作 + 状态更新 |
| 认证 | `/api/auth` | 飞书 OAuth 认证 |
| 健康检查 | `/api/health` | 服务状态检查 |

### 4.2 团队成员 API

#### GET /api/team

**功能**：获取所有团队成员

**请求参数**：无

**成功响应** (200)：
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "role": "uiux|frontend|backend|test",
      "avatar": "string",
      "color": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ]
}
```

#### GET /api/team/:id

**功能**：获取单个团队成员

**路径参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| id | String | 成员 ID |

**成功响应** (200)：
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "role": "string",
    "avatar": "string",
    "color": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

**失败响应** (404)：
```json
{
  "success": false,
  "message": "团队成员不存在"
}
```

#### POST /api/team

**功能**：创建团队成员

**请求体**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | String | 是 | 成员姓名 |
| role | String | 是 | 角色 |
| avatar | String | 是 | 头像显示名称 |
| color | String | 是 | 头像颜色 |

**成功响应** (201)：
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "role": "string",
    "avatar": "string",
    "color": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

#### PUT /api/team/:id

**功能**：更新团队成员

**路径参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| id | String | 成员 ID |

**请求体**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | String | 否 | 成员姓名 |
| role | String | 否 | 角色 |
| avatar | String | 否 | 头像显示名称 |
| color | String | 否 | 头像颜色 |

**成功响应** (200)：
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "role": "string",
    "avatar": "string",
    "color": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

#### DELETE /api/team/:id

**功能**：删除团队成员

**路径参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| id | String | 成员 ID |

**成功响应** (200)：
```json
{
  "success": true,
  "message": "删除成功"
}
```

### 4.3 里程碑 API

#### GET /api/milestones

**功能**：获取所有里程碑

**请求参数**：无

**成功响应** (200)：
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "status": "planning|in-progress|completed",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ]
}
```

#### GET /api/milestones/:id

**功能**：获取单个里程碑

**路径参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| id | String | 里程碑 ID |

**成功响应** (200)：
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "status": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

**失败响应** (404)：
```json
{
  "success": false,
  "message": "里程碑不存在"
}
```

#### POST /api/milestones

**功能**：创建里程碑

**请求体**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | String | 是 | 里程碑名称 |
| description | String | 否 | 描述说明 |
| startDate | String | 是 | 开始日期 |
| endDate | String | 是 | 结束日期 |
| status | String | 否 | 状态，默认 planning |

**成功响应** (201)：
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "status": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

#### PUT /api/milestones/:id

**功能**：更新里程碑

**请求体**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | String | 否 | 里程碑名称 |
| description | String | 否 | 描述说明 |
| startDate | String | 否 | 开始日期 |
| endDate | String | 否 | 结束日期 |
| status | String | 否 | 状态 |

**成功响应** (200)：
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "status": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

#### DELETE /api/milestones/:id

**功能**：删除里程碑

**成功响应** (200)：
```json
{
  "success": true,
  "message": "删除成功"
}
```

### 4.4 用户故事 API

#### GET /api/stories

**功能**：获取所有用户故事

**请求参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| milestoneId | String | 可选，按里程碑筛选 |

**成功响应** (200)：
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "milestoneId": "string",
      "priority": "low|medium|high",
      "createdAt": "datetime",
      "updatedAt": "datetime",
      "milestone": {
        "id": "string",
        "name": "string"
      }
    }
  ]
}
```

#### GET /api/stories/:id

**功能**：获取单个用户故事

**成功响应** (200)：
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "milestoneId": "string",
    "priority": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "milestone": {
      "id": "string",
      "name": "string"
    },
    "tasks": [...]
  }
}
```

#### POST /api/stories

**功能**：创建用户故事

**请求体**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | String | 是 | 故事标题 |
| description | String | 否 | 描述说明 |
| milestoneId | String | 是 | 关联里程碑 ID |
| priority | String | 否 | 优先级，默认 medium |

**成功响应** (201)：
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "milestoneId": "string",
    "priority": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

#### PUT /api/stories/:id

**功能**：更新用户故事

**请求体**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | String | 否 | 故事标题 |
| description | String | 否 | 描述说明 |
| milestoneId | String | 否 | 关联里程碑 ID |
| priority | String | 否 | 优先级 |

**成功响应** (200)：
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "milestoneId": "string",
    "priority": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

#### DELETE /api/stories/:id

**功能**：删除用户故事（级联删除关联任务）

**成功响应** (200)：
```json
{
  "success": true,
  "message": "删除成功"
}
```

### 4.5 任务 API

#### GET /api/tasks

**功能**：获取所有任务

**请求参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| userStoryId | String | 可选，按用户故事筛选 |
| assigneeId | String | 可选，按负责人筛选 |
| status | String | 可选，按状态筛选 |

**成功响应** (200)：
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "userStoryId": "string",
      "creatorId": "string",
      "assigneeId": "string",
      "status": "todo|in-progress|review|done",
      "type": "design|dev|test",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "dependsOn": ["string"],
      "createdAt": "datetime",
      "updatedAt": "datetime",
      "userStory": { "id": "string", "title": "string" },
      "creator": { "id": "string", "name": "string" },
      "assignee": { "id": "string", "name": "string" }
    }
  ]
}
```

#### GET /api/tasks/:id

**功能**：获取单个任务

**成功响应** (200)：
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "userStoryId": "string",
    "creatorId": "string",
    "assigneeId": "string",
    "status": "string",
    "type": "string",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "dependsOn": ["string"],
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

#### POST /api/tasks

**功能**：创建任务

**请求体**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | String | 是 | 任务标题 |
| description | String | 否 | 描述说明 |
| userStoryId | String | 是 | 关联用户故事 ID |
| creatorId | String | 是 | 创建者 ID |
| assigneeId | String | 是 | 负责人 ID |
| status | String | 否 | 状态，默认 todo |
| type | String | 否 | 类型，默认 dev |
| startDate | String | 是 | 开始日期 |
| endDate | String | 是 | 结束日期 |
| dependsOn | String[] | 否 | 依赖任务 ID 列表 |

**成功响应** (201)：
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "userStoryId": "string",
    "creatorId": "string",
    "assigneeId": "string",
    "status": "string",
    "type": "string",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "dependsOn": ["string"],
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

#### PUT /api/tasks/:id

**功能**：更新任务

**请求体**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | String | 否 | 任务标题 |
| description | String | 否 | 描述说明 |
| userStoryId | String | 否 | 关联用户故事 ID |
| assigneeId | String | 否 | 负责人 ID |
| status | String | 否 | 状态 |
| type | String | 否 | 类型 |
| startDate | String | 否 | 开始日期 |
| endDate | String | 否 | 结束日期 |
| dependsOn | String[] | 否 | 依赖任务 ID 列表 |

**成功响应** (200)：
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "userStoryId": "string",
    "creatorId": "string",
    "assigneeId": "string",
    "status": "string",
    "type": "string",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "dependsOn": ["string"],
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

#### PATCH /api/tasks/:id/status

**功能**：更新任务状态（简化接口）

**请求体**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | String | 是 | 新状态 |

**成功响应** (200)：
```json
{
  "success": true,
  "data": {
    "id": "string",
    "status": "string",
    "updatedAt": "datetime"
  }
}
```

#### DELETE /api/tasks/:id

**功能**：删除任务

**成功响应** (200)：
```json
{
  "success": true,
  "message": "删除成功"
}
```

### 4.6 认证 API

#### GET /api/auth/feishu/url

**功能**：获取飞书授权 URL

**成功响应** (200)：
```json
{
  "success": true,
  "authUrl": "string",
  "state": "string"
}
```

#### POST /api/auth/feishu/callback

**功能**：处理飞书回调，获取用户信息

**请求体**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | String | 是 | 授权码 |
| state | String | 是 | 状态码 |

**成功响应** (200)：
```json
{
  "success": true,
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "avatar": "string",
    "feishuUserId": "string"
  }
}
```

**失败响应** (400/500)：
```json
{
  "success": false,
  "message": "登录失败"
}
```

### 4.7 健康检查 API

#### GET /api/health

**功能**：服务健康检查

**成功响应** (200)：
```json
{
  "success": true,
  "message": "服务器运行正常",
  "timestamp": "datetime"
}
```

---

## 5. 前端架构设计

### 5.1 文件结构

```
src/
├── api/                    # API 服务层
│   ├── index.ts           # Axios 封装与拦截器
│   ├── team.ts            # 团队成员 API
│   ├── milestones.ts      # 里程碑 API
│   ├── stories.ts         # 用户故事 API
│   └── tasks.ts           # 任务 API
├── components/             # UI 组件
│   ├── AuthButton.tsx
│   ├── DateHeader.tsx
│   ├── Navigation.tsx
│   ├── TaskBar.tsx
│   └── TaskCard.tsx
├── hooks/                  # 自定义 Hooks
│   ├── useAuth.ts         # 认证 Hook
│   ├── useTeam.ts         # 团队成员 Hook
│   ├── useMilestones.ts   # 里程碑 Hook
│   ├── useStories.ts      # 用户故事 Hook
│   └── useTasks.ts        # 任务 Hook
├── pages/                  # 页面组件
│   ├── KanbanPage.tsx
│   ├── LoginPage.tsx
│   ├── MilestonesPage.tsx
│   ├── StoriesPage.tsx
│   └── TeamPage.tsx
├── store/                  # 状态管理
│   └── useStore.ts        # Zustand Store
├── types/                  # TypeScript 类型
│   └── index.ts
├── utils/                  # 工具函数
│   ├── dateUtils.ts
│   └── feishuAuth.ts
├── App.tsx
├── main.tsx
└── index.css
```

### 5.2 API 服务层设计

#### api/index.ts

**职责**：Axios 实例封装、请求/响应拦截器、统一错误处理

**设计要点**：
- 创建 axios 实例，配置基础 URL 和超时时间
- 请求拦截器：添加认证 token
- 响应拦截器：统一处理响应格式、错误处理
- 导出 axios 实例供其他模块使用

#### api/team.ts

**职责**：团队成员相关 API 调用

**方法列表**：
| 方法名 | 功能 | API 路径 |
|--------|------|----------|
| getTeamMembers | 获取所有成员 | GET /api/team |
| getTeamMember | 获取单个成员 | GET /api/team/:id |
| createTeamMember | 创建成员 | POST /api/team |
| updateTeamMember | 更新成员 | PUT /api/team/:id |
| deleteTeamMember | 删除成员 | DELETE /api/team/:id |

#### api/milestones.ts

**职责**：里程碑相关 API 调用

**方法列表**：
| 方法名 | 功能 | API 路径 |
|--------|------|----------|
| getMilestones | 获取所有里程碑 | GET /api/milestones |
| getMilestone | 获取单个里程碑 | GET /api/milestones/:id |
| createMilestone | 创建里程碑 | POST /api/milestones |
| updateMilestone | 更新里程碑 | PUT /api/milestones/:id |
| deleteMilestone | 删除里程碑 | DELETE /api/milestones/:id |

#### api/stories.ts

**职责**：用户故事相关 API 调用

**方法列表**：
| 方法名 | 功能 | API 路径 |
|--------|------|----------|
| getStories | 获取所有故事 | GET /api/stories |
| getStory | 获取单个故事 | GET /api/stories/:id |
| createStory | 创建故事 | POST /api/stories |
| updateStory | 更新故事 | PUT /api/stories/:id |
| deleteStory | 删除故事 | DELETE /api/stories/:id |

#### api/tasks.ts

**职责**：任务相关 API 调用

**方法列表**：
| 方法名 | 功能 | API 路径 |
|--------|------|----------|
| getTasks | 获取所有任务 | GET /api/tasks |
| getTask | 获取单个任务 | GET /api/tasks/:id |
| createTask | 创建任务 | POST /api/tasks |
| updateTask | 更新任务 | PUT /api/tasks/:id |
| updateTaskStatus | 更新任务状态 | PATCH /api/tasks/:id/status |
| deleteTask | 删除任务 | DELETE /api/tasks/:id |

### 5.3 自定义 Hooks 设计

#### hooks/useTeam.ts

**职责**：团队成员数据管理 Hook

**返回值**：
| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| teamMembers | TeamMember[] | 成员列表 |
| loading | boolean | 加载状态 |
| error | string | 错误信息 |
| fetchTeamMembers | () => Promise | 获取成员列表 |
| createMember | (data) => Promise | 创建成员 |
| updateMember | (id, data) => Promise | 更新成员 |
| deleteMember | (id) => Promise | 删除成员 |

#### hooks/useMilestones.ts

**职责**：里程碑数据管理 Hook

**返回值**：
| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| milestones | Milestone[] | 里程碑列表 |
| loading | boolean | 加载状态 |
| error | string | 错误信息 |
| fetchMilestones | () => Promise | 获取里程碑列表 |
| createMilestone | (data) => Promise | 创建里程碑 |
| updateMilestone | (id, data) => Promise | 更新里程碑 |
| deleteMilestone | (id) => Promise | 删除里程碑 |

#### hooks/useStories.ts

**职责**：用户故事数据管理 Hook

**返回值**：
| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| stories | UserStory[] | 用户故事列表 |
| loading | boolean | 加载状态 |
| error | string | 错误信息 |
| fetchStories | () => Promise | 获取故事列表 |
| createStory | (data) => Promise | 创建故事 |
| updateStory | (id, data) => Promise | 更新故事 |
| deleteStory | (id) => Promise | 删除故事 |

#### hooks/useTasks.ts

**职责**：任务数据管理 Hook

**返回值**：
| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| tasks | Task[] | 任务列表 |
| loading | boolean | 加载状态 |
| error | string | 错误信息 |
| fetchTasks | () => Promise | 获取任务列表 |
| createTask | (data) => Promise | 创建任务 |
| updateTask | (id, data) => Promise | 更新任务 |
| updateTaskStatus | (id, status) => Promise | 更新任务状态 |
| deleteTask | (id) => Promise | 删除任务 |

---

## 6. 部署与集成

### 6.1 环境配置

#### 开发环境 (.env)

```bash
# 后端配置
PORT=3001
DATABASE_URL="file:./dev.db"

# 前端配置
FRONTEND_URL=http://localhost:3000

# 飞书配置
FEISHU_APP_ID=your_app_id
FEISHU_APP_SECRET=your_app_secret
FEISHU_REDIRECT_URI=http://localhost:3001/api/auth/feishu/callback
```

#### 生产环境 (.env.production)

```bash
PORT=3001
DATABASE_URL="file:./prod.db"
FRONTEND_URL=https://your-domain.com
FEISHU_APP_ID=your_app_id
FEISHU_APP_SECRET=your_app_secret
FEISHU_REDIRECT_URI=https://your-domain.com/api/auth/feishu/callback
```

### 6.2 依赖与脚本

#### 后端依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| express | ^4.x | Web 框架 |
| prisma | ^5.x | ORM |
| @prisma/client | ^5.x | Prisma 客户端 |
| cors | ^2.x | 跨域处理 |
| dotenv | ^16.x | 环境变量 |
| axios | ^1.x | HTTP 请求 |

#### 后端脚本

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "prisma:init": "prisma init",
    "prisma:migrate": "prisma migrate dev",
    "prisma:generate": "prisma generate",
    "prisma:studio": "prisma studio"
  }
}
```

---

## 7. 安全考虑

### 7.1 数据验证

- **后端验证**：所有 API 输入参数必须验证
- **类型检查**：使用 TypeScript 进行编译时类型检查
- **SQL 注入防护**：使用 Prisma ORM 自动防护

### 7.2 错误处理

- **统一错误响应格式**：所有错误返回统一格式
- **错误日志记录**：记录错误信息便于排查
- **用户友好提示**：前端显示友好的错误提示

### 7.3 CORS 配置

- 配置允许的源地址
- 设置合适的请求方法和头信息

---

## 8. 测试策略

### 8.1 单元测试

- **测试框架**：Jest
- **测试范围**：API Service、工具函数、自定义 Hooks

### 8.2 集成测试

- **测试框架**：Supertest
- **测试范围**：API 接口测试、数据库操作测试

### 8.3 E2E 测试

- **测试框架**：Cypress
- **测试范围**：关键用户流程测试

---

## 附录：变更记录

| 版本 | 日期 | 作者 | 变更内容 |
|------|------|------|----------|
| 1.0 | 2026-05-09 | 系统 | 初始版本 |

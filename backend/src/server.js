const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

const teamRouter = require('./routes/team');
const storiesRouter = require('./routes/stories');
const tasksRouter = require('./routes/tasks');

app.use('/api/team', teamRouter);
app.use('/api/stories', storiesRouter);
app.use('/api/tasks', tasksRouter);

const getAppAccessToken = async () => {
  try {
    const response = await axios.post(
      'https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal',
      {
        app_id: process.env.FEISHU_APP_ID,
        app_secret: process.env.FEISHU_APP_SECRET,
      }
    );

    if (response.data.code !== 0) {
      throw new Error(`获取 app_access_token 失败: ${response.data.msg}`);
    }

    return response.data.app_access_token;
  } catch (error) {
    console.error('获取 app_access_token 错误:', error.message);
    throw error;
  }
};

const getUserAccessToken = async (code, appAccessToken) => {
  try {
    const response = await axios.post(
      'https://open.feishu.cn/open-apis/authen/v1/access_token',
      {
        grant_type: 'authorization_code',
        code: code,
      },
      {
        headers: {
          'Authorization': `Bearer ${appAccessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.code !== 0) {
      throw new Error(`获取 user_access_token 失败: ${response.data.msg}`);
    }

    return response.data.data.access_token;
  } catch (error) {
    console.error('获取 user_access_token 错误:', error.message);
    throw error;
  }
};

const getUserInfo = async (userAccessToken) => {
  try {
    const response = await axios.get('https://open.feishu.cn/open-apis/authen/v1/user_info', {
      headers: {
        'Authorization': `Bearer ${userAccessToken}`,
      },
    });

    if (response.data.code !== 0) {
      throw new Error(`获取用户信息失败: ${response.data.msg}`);
    }

    return response.data.data;
  } catch (error) {
    console.error('获取用户信息错误:', error.message);
    throw error;
  }
};

app.get('/api/auth/feishu/url', (req, res) => {
  const state = Math.random().toString(36).substring(2, 15);
  
  const params = new URLSearchParams({
    app_id: process.env.FEISHU_APP_ID,
    redirect_uri: process.env.FEISHU_REDIRECT_URI,
    response_type: 'code',
    scope: 'contact:user.id:readonly contact:user.email:readonly contact:user.avatar:readonly',
    state: state,
  });

  const authUrl = `https://open.feishu.cn/open-apis/authen/v1/index?${params.toString()}`;

  res.json({
    success: true,
    authUrl,
    state,
  });
});

app.post('/api/auth/feishu/callback', async (req, res) => {
  const { code, state } = req.body;

  if (!code || !state) {
    return res.status(400).json({
      success: false,
      message: '缺少必要参数',
    });
  }

  try {
    const appAccessToken = await getAppAccessToken();
    const userAccessToken = await getUserAccessToken(code, appAccessToken);
    const userInfo = await getUserInfo(userAccessToken);

    res.json({
      success: true,
      user: {
        id: userInfo.open_id,
        name: userInfo.name,
        email: userInfo.email,
        avatar: userInfo.avatar,
        feishuUserId: userInfo.open_id,
        isAuthenticated: true,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || '登录失败',
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '服务器运行正常',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`飞书应用ID: ${process.env.FEISHU_APP_ID ? '已配置' : '未配置'}`);
});
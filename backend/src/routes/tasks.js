const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  let tasks = db.tasks.getAll();
  const { userStoryId, assigneeId, status } = req.query;
  
  if (userStoryId) {
    tasks = tasks.filter(task => task.userStoryId === userStoryId);
  }
  if (assigneeId) {
    tasks = tasks.filter(task => task.assigneeId === assigneeId);
  }
  if (status) {
    tasks = tasks.filter(task => task.status === status);
  }
  
  const stories = db.stories.getAll();
  const team = db.team.getAll();
  
  const result = tasks.map(task => ({
    ...task,
    userStory: task.userStoryId ? stories.find(s => s.id === task.userStoryId) : undefined,
    creator: task.creatorId ? team.find(m => m.id === task.creatorId) : undefined,
    assignee: task.assigneeId ? team.find(m => m.id === task.assigneeId) : undefined
  }));
  
  res.json({ success: true, data: result });
});

router.get('/:id', (req, res) => {
  const task = db.tasks.getById(req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, message: '任务不存在' });
  }
  res.json({ success: true, data: task });
});

router.post('/', (req, res) => {
  const { title, userStoryId, creatorId, assigneeId, startDate, endDate, description, status = 'todo', type = 'dev', dependsOn = [] } = req.body;
  
  if (!title || !creatorId || !startDate || !endDate) {
    return res.status(400).json({ success: false, message: '缺少必要参数' });
  }
  
  if (userStoryId) {
    const story = db.stories.getById(userStoryId);
    if (!story) {
      return res.status(400).json({ success: false, message: '用户故事不存在' });
    }
  }
  
  const creator = db.team.getById(creatorId);
  if (!creator) {
    return res.status(400).json({ success: false, message: '创建者不存在' });
  }
  
  if (assigneeId) {
    const assignee = db.team.getById(assigneeId);
    if (!assignee) {
      return res.status(400).json({ success: false, message: '负责人不存在' });
    }
  }
  
  const newTask = db.tasks.create({ title, description, userStoryId, creatorId, assigneeId, status, type, startDate, endDate, dependsOn });
  res.status(201).json({ success: true, data: newTask });
});

router.put('/:id', (req, res) => {
  const updated = db.tasks.update(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: '任务不存在' });
  }
  res.json({ success: true, data: updated });
});

router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, message: '缺少状态参数' });
  }
  const updated = db.tasks.update(req.params.id, { status });
  if (!updated) {
    return res.status(404).json({ success: false, message: '任务不存在' });
  }
  res.json({ success: true, data: { id: updated.id, status: updated.status, updatedAt: updated.updatedAt } });
});

router.delete('/:id', (req, res) => {
  const deleted = db.tasks.delete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: '任务不存在' });
  }
  res.json({ success: true, message: '删除成功' });
});

module.exports = router;

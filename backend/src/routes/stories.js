const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const stories = db.stories.getAll();
  res.json({ success: true, data: stories });
});

router.get('/:id', (req, res) => {
  const story = db.stories.getById(req.params.id);
  if (!story) {
    return res.status(404).json({ success: false, message: '用户故事不存在' });
  }
  const tasks = db.tasks.getByStory(req.params.id);
  res.json({ success: true, data: { ...story, tasks } });
});

router.post('/', (req, res) => {
  const { title, priority = 'medium', stage = 'requirements' } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, message: '缺少必要参数' });
  }
  const newStory = db.stories.create({ title, priority, stage });
  res.status(201).json({ success: true, data: newStory });
});

router.put('/:id', (req, res) => {
  const updated = db.stories.update(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: '用户故事不存在' });
  }
  res.json({ success: true, data: updated });
});

router.delete('/:id', (req, res) => {
  const deleted = db.stories.delete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: '用户故事不存在' });
  }
  db.tasks.deleteByStory(req.params.id);
  res.json({ success: true, message: '删除成功' });
});

module.exports = router;

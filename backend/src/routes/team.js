const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const teamMembers = db.team.getAll();
  res.json({ success: true, data: teamMembers });
});

router.get('/:id', (req, res) => {
  const member = db.team.getById(req.params.id);
  if (!member) {
    return res.status(404).json({ success: false, message: '团队成员不存在' });
  }
  res.json({ success: true, data: member });
});

router.post('/', (req, res) => {
  const { name, role, avatar, color } = req.body;
  if (!name || !role || !avatar || !color) {
    return res.status(400).json({ success: false, message: '缺少必要参数' });
  }
  const newMember = db.team.create({ name, role, avatar, color });
  res.status(201).json({ success: true, data: newMember });
});

router.put('/:id', (req, res) => {
  const updated = db.team.update(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: '团队成员不存在' });
  }
  res.json({ success: true, data: updated });
});

router.delete('/:id', (req, res) => {
  const deleted = db.team.delete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: '团队成员不存在' });
  }
  db.tasks.deleteByAssignee(req.params.id);
  res.json({ success: true, message: '删除成功' });
});

module.exports = router;
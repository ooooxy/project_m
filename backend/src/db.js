const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '../data');
const TEAM_FILE = path.join(DB_DIR, 'team.json');
const STORIES_FILE = path.join(DB_DIR, 'stories.json');
const TASKS_FILE = path.join(DB_DIR, 'tasks.json');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

function initFile(filePath, defaultValue) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
  }
}

initFile(TEAM_FILE, []);
initFile(STORIES_FILE, []);
initFile(TASKS_FILE, []);

function readFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

function writeFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

const db = {
  team: {
    getAll: () => readFile(TEAM_FILE),
    getById: (id) => readFile(TEAM_FILE).find(item => item.id === id),
    create: (data) => {
      const items = readFile(TEAM_FILE);
      const newItem = { id: generateId(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      items.push(newItem);
      writeFile(TEAM_FILE, items);
      return newItem;
    },
    update: (id, data) => {
      const items = readFile(TEAM_FILE);
      const index = items.findIndex(item => item.id === id);
      if (index === -1) return null;
      items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() };
      writeFile(TEAM_FILE, items);
      return items[index];
    },
    delete: (id) => {
      const items = readFile(TEAM_FILE);
      const filtered = items.filter(item => item.id !== id);
      writeFile(TEAM_FILE, filtered);
      return items.length !== filtered.length;
    }
  },

  stories: {
    getAll: () => readFile(STORIES_FILE),
    getById: (id) => readFile(STORIES_FILE).find(item => item.id === id),
    create: (data) => {
      const items = readFile(STORIES_FILE);
      const newItem = { id: generateId(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      items.push(newItem);
      writeFile(STORIES_FILE, items);
      return newItem;
    },
    update: (id, data) => {
      const items = readFile(STORIES_FILE);
      const index = items.findIndex(item => item.id === id);
      if (index === -1) return null;
      items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() };
      writeFile(STORIES_FILE, items);
      return items[index];
    },
    delete: (id) => {
      const items = readFile(STORIES_FILE);
      const filtered = items.filter(item => item.id !== id);
      writeFile(STORIES_FILE, filtered);
      return items.length !== filtered.length;
    }
  },

  tasks: {
    getAll: () => readFile(TASKS_FILE),
    getById: (id) => readFile(TASKS_FILE).find(item => item.id === id),
    create: (data) => {
      const items = readFile(TASKS_FILE);
      const newItem = { id: generateId(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      items.push(newItem);
      writeFile(TASKS_FILE, items);
      return newItem;
    },
    update: (id, data) => {
      const items = readFile(TASKS_FILE);
      const index = items.findIndex(item => item.id === id);
      if (index === -1) return null;
      items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() };
      writeFile(TASKS_FILE, items);
      return items[index];
    },
    delete: (id) => {
      const items = readFile(TASKS_FILE);
      const filtered = items.filter(item => item.id !== id);
      writeFile(TASKS_FILE, filtered);
      return items.length !== filtered.length;
    },
    getByStory: (userStoryId) => {
      return readFile(TASKS_FILE).filter(item => item.userStoryId === userStoryId);
    },
    getByAssignee: (assigneeId) => {
      return readFile(TASKS_FILE).filter(item => item.assigneeId === assigneeId);
    },
    getByStatus: (status) => {
      return readFile(TASKS_FILE).filter(item => item.status === status);
    },
    deleteByStory: (userStoryId) => {
      const items = readFile(TASKS_FILE);
      const filtered = items.filter(item => item.userStoryId !== userStoryId);
      writeFile(TASKS_FILE, filtered);
      return items.length !== filtered.length;
    },
    deleteByAssignee: (assigneeId) => {
      const items = readFile(TASKS_FILE);
      const filtered = items.filter(item => item.assigneeId !== assigneeId);
      writeFile(TASKS_FILE, filtered);
      return items.length !== filtered.length;
    }
  }
};

module.exports = db;
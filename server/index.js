const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const port = 5000;

const dbFilePath = './db.json';

app.use(cors());
app.use(express.json());

// Load posts from db.json on startup
let posts = [];
try {
  const data = fs.readFileSync(dbFilePath, 'utf8');
  posts = JSON.parse(data);
} catch (err) {
  console.log('No db.json found, starting with an empty database.');
  posts = [];
}

// Calculate nextId based on existing posts
let nextId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;

// Function to save posts to db.json
const saveData = () => {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(posts, null, 2));
  } catch (err) {
    console.error('Error saving data to db.json:', err);
  }
};

// --- API Endpoints ---

app.get('/api/posts', (req, res) => {
  const sortedPosts = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(sortedPosts);
});

app.get('/api/posts/:id', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (post) {
    res.json(post);
  } else {
    res.status(404).send('Post not found');
  }
});

app.post('/api/posts', (req, res) => {
  const { title, content, answers, nickname } = req.body;
  const newPost = {
    id: nextId++,
    title,
    content,
    answers,
    nickname,
    comments: [],
    createdAt: new Date().toISOString()
  };
  posts.push(newPost);
  saveData();
  res.status(201).json(newPost);
});

app.delete('/api/posts/:id', (req, res) => {
  const { nickname } = req.body;
  if (nickname !== 'root') {
    return res.status(403).send('Permission denied.');
  }
  posts = posts.filter(p => p.id !== parseInt(req.params.id));
  saveData();
  res.status(204).send();
});

app.post('/api/posts/:id/comments', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (post) {
    const { content, nickname } = req.body;
    const newComment = { content, nickname };
    post.comments.push(newComment);
    saveData();
    res.status(201).json(newComment);
  } else {
    res.status(404).send('Post not found');
  }
});

app.delete('/api/posts/:id/comments/:commentIndex', (req, res) => {
  const { nickname } = req.body;
  if (nickname !== 'root') {
    return res.status(403).send('Permission denied.');
  }
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (post) {
    post.comments.splice(req.params.commentIndex, 1);
    saveData();
    res.status(204).send();
  } else {
    res.status(404).send('Post not found');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

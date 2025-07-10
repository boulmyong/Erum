const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
const port = 5000;

const dbFilePath = './db.json';

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) // Append extension
  }
});
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

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

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

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

app.get('/api/posts/user/:nickname', (req, res) => {
  const userPosts = posts.filter(p => p.nickname === req.params.nickname);
  const sortedPosts = [...userPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(sortedPosts);
});

app.post('/api/posts', (req, res) => {
  const { title, content, answers, nickname, imageUrl } = req.body;
  const newPost = {
    id: nextId++,
    title,
    content,
    answers,
    nickname,
    imageUrl, // Add imageUrl to the new post object
    comments: [],
    createdAt: new Date().toISOString()
  };
  posts.push(newPost);
  saveData();
  res.status(201).json(newPost);
});

app.put('/api/posts/:id', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (!post) {
    return res.status(404).send('Post not found');
  }

  const { nickname, title, content, answers, imageUrl } = req.body;
  if (nickname !== 'root' && post.nickname !== nickname) {
    return res.status(403).send('Permission denied.');
  }

  post.title = title || post.title;
  post.content = content || post.content;
  post.answers = answers || post.answers;
  post.imageUrl = imageUrl !== undefined ? imageUrl : post.imageUrl;

  saveData();
  res.json(post);
});

app.delete('/api/posts/:id', (req, res) => {
  const postIndex = posts.findIndex(p => p.id === parseInt(req.params.id));
  if (postIndex === -1) {
    return res.status(404).send('Post not found');
  }

  const post = posts[postIndex];
  const { nickname } = req.body;

  if (nickname !== 'root' && post.nickname !== nickname) {
    return res.status(403).send('Permission denied.');
  }

  posts.splice(postIndex, 1);
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
  const post = posts.find(p => p.id === parseInt(req.params.id));

  if (post) {
    const comment = post.comments[req.params.commentIndex];
    if (!comment) {
      return res.status(404).send('Comment not found');
    }

    if (nickname !== 'root' && comment.nickname !== nickname) {
      return res.status(403).send('Permission denied.');
    }

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

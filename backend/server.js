const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'linkee_jwt_secret_2024';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..'))); // Serve frontend// In-memory storage (use DB in production)
let users = [];
let jobs = [];

// Auth middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Register
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'User exists' });
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { id: Date.now(), email, password: hashedPassword };
  users.push(user);
  
  const token = jwt.sign({ id: user.id, email }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, email } });
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, email: user.email } });
});

// Get jobs
app.get('/api/jobs', (req, res) => {
  res.json(jobs);
});

// Post job (protected)
app.post('/api/jobs', authenticateToken, (req, res) => {
  const job = { 
    id: Date.now(), 
    ...req.body, 
    userId: req.user.id,
    createdAt: new Date().toISOString()
  };
  jobs.unshift(job);
  res.status(201).json(job);
});

// Get user jobs
app.get('/api/jobs/user', authenticateToken, (req, res) => {
  const userJobs = jobs.filter(j => j.userId === req.user.id);
  res.json(userJobs);
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Linkee Backend running on http://localhost:${PORT}`);
});


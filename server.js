require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const adminRoutes = require('./api/admin');
const postRoutes = require('./api/posts');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Static files for specific directories - move these BEFORE routes
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/blog', express.static(path.join(__dirname, 'blog')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use(express.static(path.join(__dirname)));

// API routes
app.use('/api', adminRoutes);
app.use('/api', postRoutes);

// Blog routes
app.get('/blog/:slug', (req, res) => {
    console.log('Serving blog post page for slug:', req.params.slug);
    res.sendFile(path.join(__dirname, 'blog', 'post.html'));
});

app.get('/blog', (req, res) => {
    res.sendFile(path.join(__dirname, 'blog', 'index.html'));
});

// Admin route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
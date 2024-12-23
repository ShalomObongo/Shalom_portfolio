const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const authMiddleware = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');
const fs = require('fs');
const { upload } = require('../config/cloudinary');
const { cloudinary } = require('../config/cloudinary');

// Login route
router.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin || !(await admin.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
            expiresIn: '24h'
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        admin.lastLogin = Date.now();
        await admin.save();

        res.json({ message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Logout route
router.post('/admin/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logout successful' });
});

// Check auth status
router.get('/admin/check-auth', authMiddleware, (req, res) => {
    res.json({ authenticated: true });
});

// Create post
router.post('/admin/posts', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { title, slug, content, excerpt, tags } = req.body;
        
        // Generate a clean slug from either the provided slug or the title
        let cleanSlug = (slug || title).trim().toLowerCase()
            .replace(/[^a-z0-9-\s]/g, '') // Remove special characters except spaces and hyphens
            .replace(/\s+/g, '-')         // Replace spaces with hyphens
            .replace(/-+/g, '-')          // Replace multiple hyphens with single hyphen
            .replace(/^-+|-+$/g, '');     // Remove leading/trailing hyphens

        // Check if slug already exists
        const existingPost = await Post.findOne({ slug: cleanSlug });
        if (existingPost) {
            return res.status(400).json({ message: 'A post with this slug already exists' });
        }

        // Validate required fields
        if (!title || !content || !excerpt || !req.file) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const image = req.file.path; // Cloudinary URL
        const baseUrl = 'https://shalomobongo.tech'; // Your domain

        const post = new Post({
            title,
            slug: cleanSlug,
            content,
            excerpt,
            image,
            tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            readTime: Math.ceil(content.split(' ').length / 200),
            author: "Shalom Obongo",
            date: new Date(),
            // Add the required fields
            metaDescription: excerpt.substring(0, 155) + '...', // Truncate to recommended SEO length
            canonicalUrl: `${baseUrl}/blog/${cleanSlug}`,
            keywords: tags ? tags.split(',').map(tag => tag.trim()) : []
        });

        const savedPost = await post.save();
        console.log('Created post:', savedPost);
        res.json(savedPost);
    } catch (error) {
        console.error('Post creation error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get all posts for admin
router.get('/admin/posts', authMiddleware, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update post
router.put('/admin/posts/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const update = { ...req.body };
        const baseUrl = 'https://shalomobongo.tech';
        
        // Clean the slug
        if (update.slug) {
            update.slug = update.slug.trim().toLowerCase()
                .replace(/[^a-z0-9-]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-+|-+$/g, '');
                
            // Update canonical URL when slug changes
            update.canonicalUrl = `${baseUrl}/blog/${update.slug}`;
        }

        // Handle tags and keywords
        if (update.tags) {
            update.tags = update.tags.split(',').map(tag => tag.trim());
            update.keywords = update.tags; // Update keywords to match tags
        }

        // Update meta description if excerpt changes
        if (update.excerpt) {
            update.metaDescription = update.excerpt.substring(0, 155) + '...';
        }

        // If new image uploaded, update image URL
        if (req.file) {
            // Delete old image if exists
            const oldPost = await Post.findById(req.params.id);
            if (oldPost && oldPost.image) {
                const publicId = oldPost.image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`blog-posts/${publicId}`);
            }
            update.image = req.file.path;
        }

        // Calculate read time if content is updated
        if (update.content) {
            update.readTime = Math.ceil(update.content.split(' ').length / 200);
        }

        const post = await Post.findByIdAndUpdate(
            req.params.id, 
            update,
            { new: true, runValidators: true }
        );

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete post
router.delete('/admin/posts/:id', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Delete image from Cloudinary
        if (post.image) {
            const publicId = post.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`blog-posts/${publicId}`);
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post and associated image deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get single post for editing
router.get('/admin/posts/:id', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add this route for TinyMCE image uploads
router.post('/admin/upload', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }
        
        // Cloudinary already processed the image, just return the URL
        res.json({ url: req.file.path });
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ message: 'Failed to upload image' });
    }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const authMiddleware = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const Analytics = require('../models/Analytics');
const cloudinary = require('cloudinary');

// Get all posts
router.get('/posts', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const posts = await Post.find()
            .sort({ date: -1 })
            .limit(limit)
            .select('title excerpt image date readTime tags slug');
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get posts by tag
router.get('/posts/tag/:tag', async (req, res) => {
    try {
        const posts = await Post.find({ tags: req.params.tag })
            .sort({ date: -1 })
            .select('title excerpt image date readTime tags slug');
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Search posts
router.get('/posts/search/:query', async (req, res) => {
    try {
        const searchRegex = new RegExp(req.params.query, 'i');
        const posts = await Post.find({
            $or: [
                { title: searchRegex },
                { content: searchRegex },
                { excerpt: searchRegex }
            ]
        }).sort({ date: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single post by slug
router.get('/posts/:slug', async (req, res) => {
    try {
        const cleanSlug = req.params.slug.trim().toLowerCase();
        const post = await Post.findOne({ slug: cleanSlug });
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Track analytics
        let analytics = await Analytics.findOne({ postId: post._id });
        if (!analytics) {
            analytics = new Analytics({ postId: post._id });
        }

        // Get visitor info
        const visitorInfo = {
            ip: req.ip,
            userAgent: req.get('User-Agent')
        };

        // Increment views
        await analytics.incrementViews(visitorInfo);
        
        res.json(post);
    } catch (error) {
        console.error('Error:', error);
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

// Update the existing PUT route to handle image updates better
router.put('/admin/posts/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const update = { ...req.body };
        
        // Always update lastModified when post is updated
        update.lastModified = new Date();

        // Clean the slug
        if (update.slug) {
            update.slug = update.slug.trim().toLowerCase()
                .replace(/[^a-z0-9-]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-+|-+$/g, '');
        }

        // Handle tags
        if (update.tags) {
            update.tags = update.tags.split(',').map(tag => tag.trim());
        }

        // Update image only if a new one is uploaded
        if (req.file) {
            // Delete old image from Cloudinary
            const oldPost = await Post.findById(req.params.id);
            if (oldPost && oldPost.image) {
                const publicId = oldPost.image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`blog-posts/${publicId}`);
            }
            update.image = req.file.path; // Cloudinary URL
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

// Add analytics routes
router.get('/admin/analytics', authMiddleware, async (req, res) => {
    try {
        // Get overall statistics
        const totalPosts = await Post.countDocuments();
        const analytics = await Analytics.find().populate('postId');
        
        const totalViews = analytics.reduce((sum, item) => sum + item.views, 0);
        const totalUniqueVisitors = analytics.reduce((sum, item) => sum + item.uniqueVisitors, 0);
        
        // Get top posts
        const topPosts = await Analytics.find()
            .populate('postId', 'title slug')
            .sort({ views: -1 })
            .limit(5);

        // Get views over time
        const viewsOverTime = await Analytics.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$lastUpdated" },
                        month: { $month: "$lastUpdated" },
                        day: { $dayOfMonth: "$lastUpdated" }
                    },
                    totalViews: { $sum: "$views" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ]);

        res.json({
            overview: {
                totalPosts,
                totalViews,
                totalUniqueVisitors
            },
            topPosts,
            viewsOverTime
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add new route for sitemap generation
router.get('/sitemap.xml', async (req, res) => {
    try {
        const posts = await Post.find().select('slug lastModified');
        const baseUrl = 'https://shalomobongo.tech';
        
        let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
        sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        
        // Add blog posts
        posts.forEach(post => {
            sitemap += `  <url>\n`;
            sitemap += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
            sitemap += `    <lastmod>${post.lastModified.toISOString()}</lastmod>\n`;
            sitemap += `    <changefreq>monthly</changefreq>\n`;
            sitemap += `    <priority>0.8</priority>\n`;
            sitemap += `  </url>\n`;
        });
        
        sitemap += '</urlset>';
        
        res.header('Content-Type', 'application/xml');
        res.send(sitemap);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 
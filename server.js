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

// Add this after your middleware setup and before routes
app.get('/api/config/editor', (req, res) => {
    res.json({
        tinymceKey: process.env.TINYMCE_API_KEY
    });
});

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

// Sitemap routes
app.get('/sitemap.xml', async (req, res) => {
    try {
        const baseUrl = 'https://shalomobongo.tech';
        
        let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
        sitemap += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        
        // Reference to main sitemap
        sitemap += '  <sitemap>\n';
        sitemap += `    <loc>${baseUrl}/main-sitemap.xml</loc>\n`;
        sitemap += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
        sitemap += '  </sitemap>\n';
        
        // Reference to blog sitemap
        sitemap += '  <sitemap>\n';
        sitemap += `    <loc>${baseUrl}/blog-sitemap.xml</loc>\n`;
        sitemap += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
        sitemap += '  </sitemap>\n';
        
        sitemap += '</sitemapindex>';
        
        res.header('Content-Type', 'application/xml');
        res.send(sitemap);
    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.status(500).send('Error generating sitemap');
    }
});

// Main sitemap for static pages
app.get('/main-sitemap.xml', (req, res) => {
    const baseUrl = 'https://shalomobongo.tech';
    const pages = [
        { url: '/', priority: '1.0', changefreq: 'monthly' },
        { url: '/blog', priority: '0.8', changefreq: 'daily' }
    ];
    
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    pages.forEach(page => {
        sitemap += '  <url>\n';
        sitemap += `    <loc>${baseUrl}${page.url}</loc>\n`;
        sitemap += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
        sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
        sitemap += `    <priority>${page.priority}</priority>\n`;
        sitemap += '  </url>\n';
    });
    
    sitemap += '</urlset>';
    
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
});

// Blog posts sitemap
app.get('/blog-sitemap.xml', async (req, res) => {
    try {
        const Post = require('./models/Post');
        const baseUrl = 'https://shalomobongo.tech';
        
        const posts = await Post.find()
            .select('slug lastModified')
            .sort({ date: -1 });
        
        let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
        sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        
        posts.forEach(post => {
            sitemap += '  <url>\n';
            sitemap += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
            sitemap += `    <lastmod>${post.lastModified.toISOString()}</lastmod>\n`;
            sitemap += '    <changefreq>weekly</changefreq>\n';
            sitemap += '    <priority>0.7</priority>\n';
            sitemap += '  </url>\n';
        });
        
        sitemap += '</urlset>';
        
        res.header('Content-Type', 'application/xml');
        res.send(sitemap);
    } catch (error) {
        console.error('Error generating blog sitemap:', error);
        res.status(500).send('Error generating blog sitemap');
    }
});

// Error handling for sitemap generation
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    if (req.path.endsWith('.xml')) {
        res.status(500).header('Content-Type', 'application/xml');
        res.send('<?xml version="1.0" encoding="UTF-8"?><error>Internal Server Error</error>');
    } else {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
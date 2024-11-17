require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const adminRoutes = require('./api/admin');
const postRoutes = require('./api/posts');
const https = require('https');
const fs = require('fs');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Static files for specific directories - move these BEFORE routes
app.use('/public', express.static(path.join(__dirname, 'public')));
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
app.get('/blog/:slug', async (req, res) => {
    try {
        console.log('Serving blog post page for slug:', req.params.slug);
        const Post = require('./models/Post');
        const post = await Post.findOne({ slug: req.params.slug });
        
        if (!post) {
            return res.redirect('/blog'); // Redirect to blog index if post not found
        }

        // Read the post.html template
        let html = await fs.promises.readFile(path.join(__dirname, 'blog', 'post.html'), 'utf8');

        // Replace placeholders with actual content
        const replacements = {
            '{{title}}': post.title,
            '{{description}}': post.excerpt || post.metaDescription || `Read ${post.title} by Shalom Obongo`,
            '{{image}}': post.image,
            '{{url}}': `https://shalomobongo.tech/blog/${post.slug}`,
            '{{publishedTime}}': post.date.toISOString(),
            '{{modifiedTime}}': post.lastModified ? post.lastModified.toISOString() : post.date.toISOString(),
            '{{tags}}': post.tags.join(', ')
        };

        Object.entries(replacements).forEach(([placeholder, value]) => {
            html = html.replace(new RegExp(placeholder, 'g'), value || '');
        });

        res.send(html);
    } catch (error) {
        console.error('Error serving blog post:', error);
        res.redirect('/blog');
    }
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

// Add this middleware before your sitemap routes
const sitemapCache = (req, res, next) => {
    res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    next();
};

// Sitemap routes
app.get('/sitemap.xml', sitemapCache, async (req, res) => {
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
app.get('/main-sitemap.xml', sitemapCache, (req, res) => {
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
app.get('/blog-sitemap.xml', sitemapCache, async (req, res) => {
    try {
        const Post = require('./models/Post');
        const baseUrl = 'https://shalomobongo.tech';
        
        const posts = await Post.find()
            .select('slug lastModified date')
            .sort({ date: -1 });
        
        let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
        sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        
        posts.forEach(post => {
            const postAge = (new Date() - new Date(post.date)) / (1000 * 60 * 60 * 24); // age in days
            
            // Determine change frequency based on post age
            let changefreq;
            if (postAge < 7) {
                changefreq = 'daily';
            } else if (postAge < 30) {
                changefreq = 'weekly';
            } else if (postAge < 180) {
                changefreq = 'monthly';
            } else {
                changefreq = 'yearly';
            }

            // Determine priority based on post age
            const priority = Math.max(0.5, 1 - (postAge / 365)).toFixed(1); // Newer posts get higher priority

            sitemap += '  <url>\n';
            sitemap += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
            sitemap += `    <lastmod>${post.lastModified.toISOString()}</lastmod>\n`;
            sitemap += `    <changefreq>${changefreq}</changefreq>\n`;
            sitemap += `    <priority>${priority}</priority>\n`;
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

app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tiny.cloud; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
        "img-src 'self' data: blob: https: *.cloudinary.com;"
    );
    next();
});

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Add security headers
app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// Trust proxy for Render
app.set('trust proxy', 1);

const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes
const pingURL = 'https://shalomobongo.tech';

setInterval(() => {
  https.get(pingURL, (resp) => {
    if (resp.statusCode === 200) {
      console.log('Keep-alive ping successful');
    }
  }).on('error', (err) => {
    console.error('Keep-alive ping failed:', err);
  });
}, PING_INTERVAL);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
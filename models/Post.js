const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    content: {
        type: String,
        required: true
    },
    excerpt: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return v.startsWith('https://res.cloudinary.com/');
            },
            message: props => `${props.value} is not a valid Cloudinary URL!`
        }
    },
    date: {
        type: Date,
        default: Date.now
    },
    readTime: {
        type: Number,
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    author: {
        type: String,
        default: 'Shalom Obongo'
    },
    metaDescription: {
        type: String,
        required: true,
        maxlength: 160 // Google's recommended length
    },
    keywords: [{
        type: String,
        trim: true
    }],
    lastModified: {
        type: Date,
        default: Date.now
    },
    canonicalUrl: {
        type: String,
        required: true
    }
});

// Pre-save middleware to clean the slug
postSchema.pre('save', function(next) {
    if (this.isModified()) {
        this.lastModified = new Date();
    }
    if (this.isModified('slug')) {
        this.slug = this.slug
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    next();
});

module.exports = mongoose.model('Post', postSchema); 
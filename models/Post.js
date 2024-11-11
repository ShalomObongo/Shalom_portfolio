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
        required: true
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
    }
});

// Pre-save middleware to clean the slug
postSchema.pre('save', function(next) {
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
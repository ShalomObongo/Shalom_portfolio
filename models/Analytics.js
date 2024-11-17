const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    uniqueVisitors: {
        type: Number,
        default: 0
    },
    visitors: [{
        ip: String,
        timestamp: Date,
        userAgent: String
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Add method to increment views
analyticsSchema.methods.incrementViews = async function(visitorInfo) {
    this.views += 1;
    
    // Check if this IP has viewed before
    const existingVisitor = this.visitors.find(v => v.ip === visitorInfo.ip);
    if (!existingVisitor) {
        this.uniqueVisitors += 1;
        this.visitors.push({
            ip: visitorInfo.ip,
            timestamp: new Date(),
            userAgent: visitorInfo.userAgent
        });
    }
    
    this.lastUpdated = new Date();
    return this.save();
};

module.exports = mongoose.model('Analytics', analyticsSchema); 
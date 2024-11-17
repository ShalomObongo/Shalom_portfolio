require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const initAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const admin = new Admin({
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD
        });

        await admin.save();
        console.log('Admin account created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Failed to create admin account:', error);
        process.exit(1);
    }
};

initAdmin(); 
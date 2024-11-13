<div align="center">
  <img src="/public/logo.svg" alt="Portfolio Logo" width="120" height="120" style="border-radius: 50%">

  # Shalom Obongo | Portfolio & Blog
  
  🚀 A modern, full-stack portfolio and blog platform built with Node.js and MongoDB
  
  [![Live Demo](https://img.shields.io/badge/Live-Demo-64ffda?style=for-the-badge)](https://shalomobongo.tech)
  [![License](https://img.shields.io/badge/License-MIT-0a192f?style=for-the-badge)](LICENSE)
</div>

## 🌟 Features

### Portfolio
- 🎨 Custom cursor and smooth animations
- 🌓 Dark/Light theme switching
- 📱 Responsive design across all devices
- 🔄 Intersection Observer animations
- 🖼️ Interactive project cards with live previews
- 🚀 Performance optimized with lazy loading
- 🤖 SEO optimized with Schema.org markup
- 📱 Progressive Web App (PWA) support

### Blog System
- 📝 Rich text editor (TinyMCE)
- 🏷️ Tag-based filtering and search
- 🔍 Full-text search functionality
- 📊 Analytics dashboard
- 🔐 Secure admin panel
- 📈 View tracking
- 🖼️ Cloudinary image integration
- 🗺️ Dynamic sitemap generation
- 📊 SEO-optimized blog posts

## 🛠️ Tech Stack

### Frontend
- HTML5 & CSS3
- Vanilla JavaScript
- TinyMCE Editor
- Chart.js
- Font Awesome
- Progressive Web App features

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Multer & Cloudinary
- SEO Optimization

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Git
- Cloudinary account

### Step 1: Clone the Repository
```bash
git clone https://github.com/ShalomObongo/portfolio.git
cd portfolio
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Setup
1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update the .env file with your credentials:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_secure_password
TINYMCE_API_KEY=your_tiny_mce_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Step 4: Initialize Admin Account
```bash
npm run init-admin
```

### Step 5: Start the Server
```bash
npm start
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
portfolio/
├── admin/ # Admin dashboard
│ ├── index.html # Admin interface
│ ├── admin.js # Admin functionality
│ └── admin.css # Admin styles
├── api/ # Backend API routes
│ ├── admin.js # Admin endpoints
│ ├── posts.js # Blog endpoints
│ └── auth.js # Authentication
├── blog/ # Blog system
│ ├── index.html # Blog listing
│ ├── post.html # Post template
│ ├── blog.js # Blog functionality
│ ├── post.js # Post rendering
│ └── blog.css # Blog styles
├── public/ # Static assets
│ ├── uploads/ # User uploads
│ ├── ProfilePic.png # Profile image
│ ├── logo.svg # Site logo
│ └── icons/ # PWA icons
├── models/ # MongoDB schemas
│ ├── Post.js # Blog post model
│ └── Admin.js # Admin model
├── config/ # Configuration
│ └── db.js # Database config
├── scripts/ # Utility scripts
│ └── init-admin.js # Admin setup
├── .env # Environment vars
├── server.js # Express server
├── index.html # Main portfolio
├── main.css # Global styles
├── index.js # Main JavaScript
└── site.webmanifest # PWA manifest
```

## 🔧 Configuration

### TinyMCE Editor
1. Get your API key from [TinyMCE](https://www.tiny.cloud/)
2. Update the script source in admin/index.html:
```html
<script src="https://cdn.tiny.cloud/1/YOUR_API_KEY/tinymce/6/tinymce.min.js"></script>
```

### MongoDB
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Update MONGODB_URI in .env

### Cloudinary
1. Create an account at [Cloudinary](https://cloudinary.com/)
2. Get your cloud name, API key, and API secret
3. Update CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- XSS protection
- CSRF protection
- Secure cookie usage
- File upload validation
- Rate limiting

## 📱 Mobile Optimization

The site is fully responsive with:
- Mobile-first design
- Touch-friendly navigation
- Optimized images
- Adaptive layouts
- Performance optimization

## 🚀 Deployment

### Option 1: Traditional Hosting
1. Set up a Node.js environment
2. Clone the repository
3. Install dependencies
4. Set up environment variables
5. Start with PM2 or similar process manager

### Option 2: Docker
Coming soon...

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
```bash
git checkout -b feature/AmazingFeature
```
3. Commit your changes
```bash
git commit -m 'Add some AmazingFeature'
```
4. Push to the branch
```bash
git push origin feature/AmazingFeature
```
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TinyMCE](https://www.tiny.cloud/) for the rich text editor
- [Cloudinary](https://cloudinary.com/) for image hosting
- [Font Awesome](https://fontawesome.com/) for icons
- [MongoDB](https://www.mongodb.com/) for database
- [Express.js](https://expressjs.com/) for server framework

---

<div align="center">
  <p>
    <a href="https://shalomobongo.tech">Website</a> •
    <a href="https://github.com/ShalomObongo">GitHub</a> •
    <a href="https://www.linkedin.com/in/shalom-obongo">LinkedIn</a> •
    <a href="mailto:shalomobongo@yahoo.com">Email</a>
  </p>
  
  Made with 🧠 by Shalom Obongo
</div>


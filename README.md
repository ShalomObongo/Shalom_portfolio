<div align="center">
  <img src="/public/logo.svg" alt="Portfolio Logo" width="150" height="150" style="border-radius: 50%; box-shadow: 0 0 20px rgba(100, 255, 218, 0.3);">

  <h1>✨ Shalom Obongo | Portfolio & Blog ✨</h1>
  
  <p align="center">
    <strong>A modern, full-stack portfolio and blog platform crafted with Node.js and MongoDB</strong>
  </p>

  <p align="center">
    <a href="https://shalomobongo.tech" target="_blank">
      <img src="https://img.shields.io/badge/LIVE-DEMO-64ffda?style=for-the-badge&logoColor=white" alt="Live Demo" />
    </a>
    <a href="LICENSE">
      <img src="https://img.shields.io/badge/LICENSE-Apache-0a192f?style=for-the-badge" alt="License" />
    </a>
    <a href="https://nodejs.org">
      <img src="https://img.shields.io/badge/NODE-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    </a>
    <a href="https://www.mongodb.com">
      <img src="https://img.shields.io/badge/MONGODB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    </a>
  </p>

  <p align="center">
    <a href="#-features">Features</a> •
    <a href="#%EF%B8%8F-tech-stack">Tech Stack</a> •
    <a href="#-installation">Installation</a> •
    <a href="#-configuration">Configuration</a> •
    <a href="#-deployment">Deployment</a>
  </p>

  <br/>

  <img src="preview.gif" alt="Portfolio Preview" style="border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);" />
</div>

<br/>

## ✨ Features

<div align="center">

| Portfolio | Blog System |
|-----------|-------------|
| 🎨 Custom cursor & smooth animations | 📝 Rich text editor (TinyMCE) |
| 🌓 Dark/Light theme switching | 🏷️ Tag-based filtering & search |
| 📱 Responsive design | 🔍 Full-text search functionality |
| 🔄 Intersection Observer animations | 📊 Analytics dashboard |
| 🖼️ Interactive project cards | 🔐 Secure admin panel |
| 🚀 Performance optimized | 📈 View tracking |
| 🎯 SEO optimized | 🔍 Meta tag debugging (dev mode) | Cloudinary Integration
| 📱 PWA support | 🗺️ Dynamic sitemap |
| 🎯 Dynamic previews | 📊 SEO optimization |
| 🌐 Multi-language | 📱 Social sharing |
| 📊 GitHub integration | 📈 Advanced analytics |
| 🔄 Real-time updates | 🔍 Related posts |
| 🎨 Custom themes | 📝 Draft system |

</div>

### Development Features

- 🔍 **Meta Tag Debugging**: Press `Shift + M` in development mode to view all meta tags, helping you optimize for social media sharing
- 🎯 **SEO Tools**: Built-in tools for managing meta descriptions, Open Graph tags, and Twitter Cards
- 📱 **Social Preview**: Debug panel shows how your content will appear when shared on social media

## 🛠️ Tech Stack

<div align="center">

### 🎨 Frontend
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TinyMCE](https://img.shields.io/badge/TinyMCE-18A303?style=for-the-badge&logo=tinymce&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chart.js&logoColor=white)

### ⚙️ Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

### 🔧 DevOps & Tools
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

</div>

## 📦 Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14+)
- MongoDB
- Git
- Cloudinary account

<details>
<summary>📥 Step-by-Step Installation Guide</summary>

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/ShalomObongo/Shalom_portfolio
cd portfolio
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Environment Setup
```bash
cp .env.example .env
```

Update `.env` with your credentials:
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

### 4️⃣ Initialize Admin Account
```bash
npm run init-admin
```

### 5️⃣ Start the Server
```bash
npm start
```

Visit `http://localhost:3000` 🚀

</details>

## 📁 Project Structure

<details>
<summary>View Project Tree</summary>

```
portfolio/
├── 📁 admin/          # Admin dashboard
├── 📁 api/            # Backend API routes
├── 📁 blog/           # Blog system
├── 📁 public/         # Static assets
├── 📁 models/         # MongoDB schemas
├── 📁 config/         # Configuration
├── 📁 scripts/        # Utility scripts
├── 📄 .env            # Environment vars
├── 📄 server.js       # Express server
├── 📄 index.html      # Main portfolio
├── 📄 main.css        # Global styles
└── 📄 index.js        # Main JavaScript
```

</details>

## 🔒 Security Features

<div align="center">

| Authentication & Authorization | Data Protection | Infrastructure |
|------------------------------|-----------------|----------------|
| 🔑 JWT Authentication | 🛡️ XSS Protection | 🚫 Rate Limiting |
| 🔒 Password Hashing | 🔰 CSRF Protection | 📡 CORS Config |
| 👤 Role-Based Access | 🔍 Input Validation | 🛡️ Helmet.js |
| 🍪 Secure Cookies | 📝 Sanitization | 🔄 Regular Audits |

</div>

## 🚀 Deployment

<details>
<summary>Deployment Options</summary>

### 🌐 Traditional Hosting
1. Set up Node.js environment
2. Clone and configure
3. Start with PM2

### ☁️ Cloud Platforms
- AWS Elastic Beanstalk
- Google Cloud Run
- Heroku
- Digital Ocean
- Render

### 🐳 Docker (Coming Soon)
Stay tuned for containerized deployment!

</details>

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🗺️ Roadmap

- [ ] 🤖 AI-powered content suggestions
- [ ] 📊 Advanced analytics dashboard
- [ ] 🌐 Multi-language support
- [ ] 👥 Real-time collaboration
- [ ] 🔍 Enhanced SEO features

## 📄 License

This project is licensed under the Apache License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>
    <a href="https://shalomobongo.tech">
      <img src="https://img.shields.io/badge/Website-64ffda?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Website"/>
    </a>
    <a href="https://github.com/ShalomObongo">
      <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
    </a>
    <a href="https://www.linkedin.com/in/shalom-obongo">
      <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/>
    </a>
    <a href="mailto:shalomobongo@yahoo.com">
      <img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email"/>
    </a>
  </p>
  
  <p>Made by <strong>Shalom Obongo</strong></p>
  
  <img src="[https://forthebadge.com/images/badges/built-with-love.svg](https://img.shields.io/badge/Built_with_Futuristic_Tech-64ffda?style=for-the-badge&logo=rocket)" alt="Built with Love"/>
</div>

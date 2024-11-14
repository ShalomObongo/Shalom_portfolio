// Custom cursor
const cursor = document.querySelector('.cursor');
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (!isMobile) {
    document.addEventListener('mousemove', (e) => {
        requestAnimationFrame(() => {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
        });
    });

    // Cursor effects for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .blog-post');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-expanded');
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-expanded');
        });
    });
} else {
    // Hide cursor on mobile devices
    cursor.style.display = 'none';
}

// Theme toggle functionality
const createThemeToggle = () => {
    const themeToggle = document.querySelector('.theme-toggle');
    
    // Check if there's a saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        themeToggle.innerHTML = isLight 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
        // Save theme preference
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
};

// Mobile navigation functionality
const setupMobileNav = () => {
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mobileDropdown = document.querySelector('.mobile-dropdown');

    if (!mobileNavToggle || !mobileDropdown) return;

    mobileNavToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileDropdown.classList.toggle('active');
        mobileNavToggle.innerHTML = mobileDropdown.classList.contains('active')
            ? '<i class="fas fa-times"></i>'
            : '<i class="fas fa-bars"></i>';
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-right') && mobileDropdown.classList.contains('active')) {
            mobileDropdown.classList.remove('active');
            mobileNavToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });

    // Close dropdown when clicking a link
    document.querySelectorAll('.mobile-dropdown a').forEach(link => {
        link.addEventListener('click', () => {
            mobileDropdown.classList.remove('active');
            mobileNavToggle.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
};

// Initialize theme toggle and mobile nav
document.addEventListener('DOMContentLoaded', () => {
    createThemeToggle();
    setupMobileNav();
});

class BlogSystem {
    constructor() {
        this.posts = [];
        this.init();
    }

    async init() {
        try {
            await this.fetchPosts();
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize blog system:', error);
        }
    }

    async fetchPosts() {
        try {
            console.log('Fetching posts...');
            const response = await fetch('/api/posts');
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const posts = await response.json();
            console.log('Fetched posts:', posts);
            
            if (!Array.isArray(posts)) {
                throw new Error('Expected posts array, got: ' + typeof posts);
            }
            
            this.posts = posts;
            this.renderPosts(this.posts);
        } catch (error) {
            console.error('Error fetching posts:', error);
            this.posts = [];
            // Show error message to user
            const postsContainer = document.querySelector('.posts-grid');
            if (postsContainer) {
                postsContainer.innerHTML = '<div class="error-message">Failed to load blog posts. Please try again later.</div>';
            }
        }
    }

    setupEventListeners() {
        // Search functionality
        document.getElementById('searchPosts').addEventListener('input', (e) => {
            this.filterPosts(e.target.value);
        });

        // Tag filtering
        document.querySelector('.tag-filters').addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-filter')) {
                const tag = e.target.dataset.tag;
                this.toggleFilter(tag);
                this.filterPosts();
            }
        });
    }

    toggleFilter(tag) {
        if (this.activeFilters.has(tag)) {
            this.activeFilters.delete(tag);
        } else {
            this.activeFilters.add(tag);
        }
        
        document.querySelector(`[data-tag="${tag}"]`).classList.toggle('active');
    }

    filterPosts(searchTerm = '') {
        const filtered = this.posts.filter(post => {
            const matchesSearch = searchTerm ? 
                post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
                : true;

            const matchesTags = this.activeFilters.size === 0 || 
                post.tags.some(tag => this.activeFilters.has(tag));

            return matchesSearch && matchesTags;
        });

        this.renderPosts(filtered);
    }

    getResponsiveImageUrl(url, width) {
        if (!url || !url.includes('cloudinary.com')) return url;
        
        try {
            // Extract the version and file name
            const matches = url.match(/\/v\d+\/(.+)$/);
            if (!matches) return url;
            
            const fileName = matches[1];
            const baseUrl = url.split('/upload/')[0];
            
            // Construct transformed URL
            return `${baseUrl}/upload/w_${width},c_scale/${fileName}`;
        } catch (error) {
            console.error('Error transforming URL:', error);
            return url;
        }
    }

    renderPosts(posts) {
        if (!Array.isArray(posts)) {
            console.error('renderPosts received invalid posts:', posts);
            return;
        }

        const postsContainer = document.querySelector('.posts-grid');
        if (!postsContainer) {
            console.error('Posts container not found');
            return;
        }

        postsContainer.innerHTML = posts.map(post => `
            <article class="blog-post-card">
                <div class="post-image-container">
                    <img src="${this.getResponsiveImageUrl(post.image, 400)}" 
                         srcset="${this.getResponsiveImageUrl(post.image, 400)} 400w,
                                 ${this.getResponsiveImageUrl(post.image, 800)} 800w"
                         sizes="(max-width: 400px) 400px, 800px"
                         alt="${post.title}"
                         loading="lazy"
                         onerror="this.src='/public/default-post.jpg'">
                    <div class="post-meta-overlay">
                        <span class="read-time">
                            <i class="fas fa-clock"></i> ${post.readTime} min read
                        </span>
                    </div>
                </div>
                <div class="post-content">
                    <div class="post-tags">
                        ${post.tags.map(tag => `
                            <span class="post-tag">${tag}</span>
                        `).join('')}
                    </div>
                    <h2 class="post-title">${post.title}</h2>
                    <p class="post-excerpt">${post.excerpt}</p>
                    <div class="post-footer">
                        <div class="post-meta">
                            <span class="post-date">
                                <i class="fas fa-calendar"></i>
                                ${new Date(post.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                        <a href="/blog/${post.slug}" class="read-more">
                            Read More <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </article>
        `).join('');
    }

    renderTags() {
        const tags = new Set();
        this.posts.forEach(post => post.tags.forEach(tag => tags.add(tag)));

        const tagFilters = document.querySelector('.tag-filters');
        tagFilters.innerHTML = Array.from(tags).map(tag => `
            <button class="tag-filter" data-tag="${tag}">${tag}</button>
        `).join('');
    }

    renderPagination(totalPosts) {
        const totalPages = Math.ceil(totalPosts / this.postsPerPage);
        const pagination = document.querySelector('.pagination');

        pagination.innerHTML = `
            <button ${this.currentPage === 1 ? 'disabled' : ''} 
                onclick="blogSystem.changePage(${this.currentPage - 1})">
                Previous
            </button>
            ${Array.from({length: totalPages}, (_, i) => i + 1).map(page => `
                <button class="${page === this.currentPage ? 'active' : ''}"
                    onclick="blogSystem.changePage(${page})">
                    ${page}
                </button>
            `).join('')}
            <button ${this.currentPage === totalPages ? 'disabled' : ''} 
                onclick="blogSystem.changePage(${this.currentPage + 1})">
                Next
            </button>
        `;
    }

    changePage(page) {
        this.currentPage = page;
        this.renderPosts();
    }
}

// Initialize the blog system when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.blogSystem = new BlogSystem();
}); 
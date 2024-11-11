class BlogSystem {
    constructor() {
        this.posts = [];
        this.currentPage = 1;
        this.postsPerPage = 9;
        this.activeFilters = new Set();
        
        this.init();
    }

    async init() {
        await this.fetchPosts();
        this.setupEventListeners();
        this.renderPosts();
        this.renderTags();
    }

    async fetchPosts() {
        try {
            const response = await fetch('/api/posts');
            this.posts = await response.json();
        } catch (error) {
            console.error('Error fetching posts:', error);
            this.posts = [];
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

    renderPosts(posts = this.posts) {
        const grid = document.querySelector('.posts-grid');
        const start = (this.currentPage - 1) * this.postsPerPage;
        const paginatedPosts = posts.slice(start, start + this.postsPerPage);

        grid.innerHTML = paginatedPosts.map(post => `
            <article class="blog-post">
                <div class="post-image">
                    <img src="${post.image}" alt="${post.title}">
                </div>
                <div class="post-content">
                    <div class="post-meta">
                        <span>${new Date(post.date).toLocaleDateString()}</span>
                        <span>${post.readTime} min read</span>
                    </div>
                    <h2>${post.title}</h2>
                    <p>${post.excerpt}</p>
                    <div class="post-tags">
                        ${post.tags.map(tag => `
                            <span class="post-tag">${tag}</span>
                        `).join('')}
                    </div>
                    <a href="/blog/${post.slug}" class="read-more">Read More</a>
                </div>
            </article>
        `).join('');

        this.renderPagination(posts.length);
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

const blogSystem = new BlogSystem(); 
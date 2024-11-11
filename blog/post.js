// Add error boundary
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ', msg, '\nURL: ', url, '\nLine: ', lineNo, '\nColumn: ', columnNo, '\nError object: ', error);
    return false;
};

class BlogPost {
    constructor() {
        // Add try-catch to constructor
        try {
            this.init();
            this.initCursor(); // Add cursor initialization
        } catch (error) {
            console.error('Error in BlogPost constructor:', error);
        }
    }

    // Add cursor functionality
    initCursor() {
        const cursor = document.querySelector('.cursor');
        if (!cursor) return;

        // Only initialize on non-touch devices
        if (window.matchMedia("(pointer: fine)").matches) {
            document.addEventListener('mousemove', (e) => {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            });

            // Add cursor expansion on interactive elements
            const interactiveElements = document.querySelectorAll('a, button, .blog-post-content img');
            interactiveElements.forEach(el => {
                el.addEventListener('mouseenter', () => cursor.classList.add('cursor-expanded'));
                el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-expanded'));
            });

            // Hide cursor when it leaves the window
            document.addEventListener('mouseleave', () => {
                cursor.style.display = 'none';
            });

            document.addEventListener('mouseenter', () => {
                cursor.style.display = 'block';
            });
        } else {
            // Hide cursor on touch devices
            cursor.style.display = 'none';
        }
    }

    async init() {
        try {
            const slug = this.getSlugFromUrl();
            if (!slug) {
                window.location.href = '/blog';
                return;
            }
            console.log('Initializing with slug:', slug);
            await Promise.all([
                this.loadPost(slug),
                this.loadRecentPosts()
            ]);
        } catch (error) {
            console.error('Error initializing blog post:', error);
            window.location.href = '/blog';
        }
    }

    getSlugFromUrl() {
        const path = window.location.pathname;
        const matches = path.match(/\/blog\/([^\/]+)/);
        console.log('Path:', path, 'Matches:', matches);
        return matches ? matches[1].trim().toLowerCase() : null;
    }

    async loadPost(slug) {
        try {
            console.log('Fetching post with slug:', slug);
            const cleanSlug = slug.trim().toLowerCase();
            const url = `/api/posts/${encodeURIComponent(cleanSlug)}`;
            console.log('Making request to:', url);
            
            const response = await fetch(url);
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const post = await response.json();
            console.log('Received post data:', post);
            
            if (!post) {
                throw new Error('Post not found');
            }
            
            this.renderPost(post);
            this.updateMetaTags(post);
        } catch (error) {
            console.error('Error loading post:', error);
            throw error;
        }
    }

    renderPost(post) {
        if (!post) {
            console.error('No post data to render');
            return;
        }

        // Update page title
        document.title = `${post.title} | Shalom Obongo`;
        
        // Update post header
        document.getElementById('postTitle').textContent = post.title;
        document.getElementById('postDate').textContent = new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('readTime').textContent = `${post.readTime} min read`;

        // Update post tags
        const tagsHtml = post.tags.map(tag => `
            <span class="post-tag">${tag}</span>
        `).join('');
        document.getElementById('postTags').innerHTML = tagsHtml;

        // Update featured image
        const postImage = document.getElementById('postImage');
        postImage.src = post.image;
        postImage.alt = post.title;

        // Update post content
        document.getElementById('postContent').innerHTML = post.content;
    }

    async loadRecentPosts() {
        try {
            const response = await fetch('/api/posts?limit=5');
            if (!response.ok) {
                throw new Error('Failed to fetch recent posts');
            }
            const posts = await response.json();
            this.renderRecentPosts(posts.filter(p => p.slug !== this.getSlugFromUrl()));
        } catch (error) {
            console.error('Error loading recent posts:', error);
        }
    }

    renderRecentPosts(posts) {
        const recentPostsContainer = document.getElementById('recentPosts');
        recentPostsContainer.innerHTML = posts.slice(0, 4).map(post => `
            <a href="/blog/${post.slug}" class="recent-post-item">
                <img src="${post.image}" alt="${post.title}">
                <div class="recent-post-content">
                    <h4>${post.title}</h4>
                    <span>${new Date(post.date).toLocaleDateString()}</span>
                </div>
            </a>
        `).join('');
    }

    updateMetaTags(post) {
        const metaTags = {
            'description': post.excerpt,
            'og:title': `${post.title} | Shalom Obongo`,
            'og:description': post.excerpt,
            'og:image': post.image,
            'twitter:title': `${post.title} | Shalom Obongo`,
            'twitter:description': post.excerpt,
            'twitter:image': post.image
        };

        Object.entries(metaTags).forEach(([name, content]) => {
            let tag = document.querySelector(`meta[property="${name}"]`);
            if (!tag) {
                tag = document.createElement('meta');
                tag.setAttribute(name.includes(':') ? 'property' : 'name', name);
                document.head.appendChild(tag);
            }
            tag.setAttribute('content', content);
        });
    }
}

// Initialize with error handling
try {
    console.log('Initializing BlogPost class');
    const blogPost = new BlogPost();
} catch (error) {
    console.error('Failed to initialize BlogPost:', error);
}
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
            this.initProgressBar();
            this.initShareButtons();
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

    initProgressBar() {
        const progressBar = document.querySelector('.progress-bar');
        if (!progressBar) return;

        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + '%';
        });
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
            await this.loadAdjacentPosts(post.date);
        } catch (error) {
            console.error('Error loading post:', error);
            throw error;
        }
    }

    getResponsiveImageUrl(url, width) {
        console.log('Original URL:', url);
        if (!url || !url.includes('cloudinary.com')) return url;
        
        try {
            // Extract the version and file name
            const matches = url.match(/\/v\d+\/(.+)$/);
            if (!matches) return url;
            
            const fileName = matches[1];
            const baseUrl = url.split('/upload/')[0];
            
            // Construct transformed URL
            const transformedUrl = `${baseUrl}/upload/w_${width},c_scale/${fileName}`;
            console.log('Transformed URL:', transformedUrl);
            return transformedUrl;
        } catch (error) {
            console.error('Error transforming URL:', error);
            return url;
        }
    }

    renderPost(post) {
        if (!post) {
            console.error('No post data to render');
            return;
        }

        // Update page title with keywords
        document.title = `${post.title} - Blog | Shalom Obongo`;
        
        // Update meta tags with enhanced social preview
        const metaTags = {
            'description': post.metaDescription,
            'keywords': post.keywords.join(', '),
            'author': post.author,
            'og:title': post.title,
            'og:description': post.metaDescription,
            'og:image': this.getResponsiveImageUrl(post.image, 1200),
            'og:image:width': '1200',
            'og:image:height': '630',
            'og:url': `https://shalomobongo.tech/blog/${post.slug}`,
            'og:type': 'article',
            'article:published_time': post.date,
            'article:modified_time': post.lastModified,
            'article:author': post.author,
            'article:tag': post.tags.join(','),
            'twitter:card': 'summary_large_image',
            'twitter:title': post.title,
            'twitter:description': post.metaDescription,
            'twitter:image': this.getResponsiveImageUrl(post.image, 1200),
            'twitter:creator': '@ShalomObongo'
        };

        // Update schema.org JSON-LD with enhanced data
        const schemaData = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "image": {
                "@type": "ImageObject",
                "url": this.getResponsiveImageUrl(post.image, 1200),
                "width": 1200,
                "height": 630
            },
            "datePublished": post.date,
            "dateModified": post.lastModified,
            "author": {
                "@type": "Person",
                "name": post.author,
                "url": "https://shalomobongo.tech",
                "image": {
                    "@type": "ImageObject",
                    "url": "https://shalomobongo.tech/public/ProfilePic.png"
                }
            },
            "publisher": {
                "@type": "Organization",
                "name": "Shalom Obongo",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://shalomobongo.tech/public/logo.svg"
                }
            },
            "description": post.metaDescription,
            "keywords": post.keywords.join(', '),
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `https://shalomobongo.tech/blog/${post.slug}`
            },
            "articleSection": post.category,
            "wordCount": post.content.split(' ').length,
            "commentCount": post.comments?.length || 0,
            "inLanguage": "en-US",
            "potentialAction": {
                "@type": "ReadAction",
                "target": [`https://shalomobongo.tech/blog/${post.slug}`]
            },
            "author": {
                "@type": "Person",
                "name": post.author,
                "url": "https://shalomobongo.tech",
                "image": {
                    "@type": "ImageObject",
                    "url": "https://shalomobongo.tech/public/ProfilePic.png"
                }
            }
        };

        // Update meta tags
        Object.entries(metaTags).forEach(([name, content]) => {
            let tag = document.querySelector(`meta[property="${name}"]`) || 
                     document.querySelector(`meta[name="${name}"]`);
            if (!tag) {
                tag = document.createElement('meta');
                tag.setAttribute(name.includes(':') ? 'property' : 'name', name);
                document.head.appendChild(tag);
            }
            tag.setAttribute('content', content);
        });

        // Update JSON-LD script
        let scriptTag = document.querySelector('script[type="application/ld+json"]');
        if (!scriptTag) {
            scriptTag = document.createElement('script');
            scriptTag.type = 'application/ld+json';
            document.head.appendChild(scriptTag);
        }
        scriptTag.textContent = JSON.stringify(schemaData);

        // Update canonical URL
        let canonicalTag = document.querySelector('link[rel="canonical"]');
        if (!canonicalTag) {
            canonicalTag = document.createElement('link');
            canonicalTag.rel = 'canonical';
            document.head.appendChild(canonicalTag);
        }
        canonicalTag.href = post.canonicalUrl;

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

        // Update featured image with responsive Cloudinary URL
        const postImage = document.getElementById('postImage');
        if (post.image) {
            const largeUrl = this.getResponsiveImageUrl(post.image, 1200);
            const mediumUrl = this.getResponsiveImageUrl(post.image, 800);
            
            postImage.srcset = `${mediumUrl} 800w, ${largeUrl} 1200w`;
            postImage.sizes = "(max-width: 800px) 800px, 1200px";
            postImage.src = largeUrl;
            postImage.alt = post.title;
        } else {
            postImage.src = '/public/default-post.jpg';
            postImage.alt = 'Default post image';
        }

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
        const recentPosts = document.getElementById('recentPosts');
        recentPosts.innerHTML = posts.map(post => `
            <a href="/blog/${post.slug}" class="recent-post">
                <img src="${this.getResponsiveImageUrl(post.image, 100)}" 
                     alt="${post.title}"
                     loading="lazy">
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

    initShareButtons() {
        const shareButtons = document.querySelectorAll('.share-button');
        shareButtons.forEach(button => {
            button.addEventListener('click', () => {
                const platform = button.dataset.platform;
                if (platform === 'copy') {
                    this.copyLink();
                } else {
                    this.sharePost(platform);
                }
            });
        });
    }

    sharePost(platform) {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        
        const shareUrls = {
            twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`
        };
        
        if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
    }

    async copyLink() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            const button = document.querySelector('.share-button[data-platform="copy"]');
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            button.style.backgroundColor = 'rgba(100, 255, 218, 0.2)';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.backgroundColor = '';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    }

    async loadAdjacentPosts(currentDate) {
        try {
            const response = await fetch(`/api/posts/adjacent?date=${currentDate}`);
            const { prev, next } = await response.json();
            
            const prevPost = document.querySelector('.prev-post');
            const nextPost = document.querySelector('.next-post');
            
            if (prev) {
                prevPost.style.display = 'block';
                prevPost.href = `/blog/${prev.slug}`;
                prevPost.querySelector('h4').textContent = prev.title;
            }
            
            if (next) {
                nextPost.style.display = 'block';
                nextPost.href = `/blog/${next.slug}`;
                nextPost.querySelector('h4').textContent = next.title;
            }
        } catch (error) {
            console.error('Error loading adjacent posts:', error);
        }
    }
}

// Initialize with error handling
try {
    console.log('Initializing BlogPost class');
    const blogPost = new BlogPost();
} catch (error) {
    console.error('Failed to initialize BlogPost:', error);
}
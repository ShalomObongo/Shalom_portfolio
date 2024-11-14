class AdminPanel {
    constructor() {
        this.init();
        this.currentEditId = null;
    }

    async init() {
        this.setupEventListeners();
        this.checkAuth();
        await this.loadTinyMCE();
    }

    setupEventListeners() {
        document.getElementById('adminLoginForm').addEventListener('submit', this.handleLogin.bind(this));
        document.getElementById('logoutBtn').addEventListener('click', this.handleLogout.bind(this));
        document.querySelector('.admin-menu').addEventListener('click', this.handleNavigation.bind(this));
        document.getElementById('newPostForm').addEventListener('submit', this.handlePostSubmit.bind(this));
    }

    async checkAuth() {
        try {
            const response = await fetch('/api/admin/check-auth', {
                credentials: 'include'
            });
            
            if (response.ok) {
                this.showDashboard();
                this.loadPosts();
            } else {
                this.showLoginForm();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.showLoginForm();
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            if (response.ok) {
                this.showDashboard();
                this.loadPosts();
            } else {
                const data = await response.json();
                alert(data.message);
            }
        } catch (error) {
            console.error('Login failed:', error);
            alert('Login failed. Please try again.');
        }
    }

    async handleLogout() {
        try {
            await fetch('/api/admin/logout', {
                method: 'POST',
                credentials: 'include'
            });
            this.showLoginForm();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    handleNavigation(e) {
        const menuItem = e.target.closest('li');
        if (menuItem) {
            const section = menuItem.dataset.section;
            this.showSection(section);
            
            document.querySelectorAll('.admin-menu li').forEach(li => {
                li.classList.remove('active');
            });
            menuItem.classList.add('active');
        }
    }

    async handlePostSubmit(e) {
        e.preventDefault();
        
        // Get TinyMCE content first
        const content = tinymce.get('content').getContent();
        if (!content) {
            alert('Content is required');
            return;
        }

        const form = e.target;
        const formData = new FormData(form);
        
        // Set the content in formData
        formData.set('content', content);
        
        const isEdit = !!this.currentEditId;
        
        try {
            const url = isEdit 
                ? `/api/admin/posts/${this.currentEditId}`
                : '/api/admin/posts';
                
            const method = isEdit ? 'PUT' : 'POST';
            
            // Validate required fields before submission
            const title = formData.get('title');
            const excerpt = formData.get('excerpt');
            const image = formData.get('image');
            
            if (!title || !excerpt || (!isEdit && !image)) {
                alert('Please fill in all required fields');
                return;
            }

            const response = await fetch(url, {
                method: method,
                body: formData,
                credentials: 'include'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to save post');
            }

            alert(isEdit ? 'Post updated successfully!' : 'Post created successfully!');
            this.resetForm();
            this.loadPosts();
            this.showSection('posts');
        } catch (error) {
            console.error('Failed to save post:', error);
            alert(error.message);
        }
    }

    async editPost(postId) {
        try {
            const response = await fetch(`/api/admin/posts/${postId}`, {
                credentials: 'include'
            });
            const post = await response.json();
            
            this.currentEditId = postId;
            this.populateForm(post);
            this.showSection('new-post');
            
            // Update section title
            document.querySelector('#new-post h3').textContent = 'Edit Post';
            document.querySelector('#new-post button[type="submit"]').textContent = 'Update Post';
        } catch (error) {
            console.error('Failed to load post for editing:', error);
            alert('Failed to load post for editing.');
        }
    }

    async deletePost(postId) {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            const response = await fetch(`/api/admin/posts/${postId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                alert('Post deleted successfully!');
                this.loadPosts();
            } else {
                const data = await response.json();
                alert(data.message);
            }
        } catch (error) {
            console.error('Failed to delete post:', error);
            alert('Failed to delete post. Please try again.');
        }
    }

    populateForm(post) {
        const form = document.getElementById('newPostForm');
        form.title.value = post.title;
        form.slug.value = post.slug;
        form.tags.value = post.tags.join(', ');
        form.excerpt.value = post.excerpt;
        
        // Set TinyMCE content
        tinymce.get('content').setContent(post.content);

        // Show current image preview with proper URL handling
        const imagePreview = form.querySelector('.image-preview');
        if (post.image) {
            // Use the full Cloudinary URL
            imagePreview.innerHTML = `
                <img src="${post.image}" alt="Current featured image">
                <p class="image-note">Upload new image to change</p>
            `;
            
            // Make image upload optional for editing
            form.querySelector('#postImage').removeAttribute('required');
        } else {
            imagePreview.innerHTML = '';
            form.querySelector('#postImage').setAttribute('required', '');
        }
    }

    resetForm() {
        const form = document.getElementById('newPostForm');
        form.reset();
        tinymce.get('content').setContent('');
        form.querySelector('.image-preview').innerHTML = '';
        this.currentEditId = null;
        
        // Reset form title and button
        document.querySelector('#new-post h3').textContent = 'Create New Post';
        document.querySelector('#new-post button[type="submit"]').textContent = 'Publish Post';
        
        // Make image required for new posts
        form.querySelector('#postImage').setAttribute('required', '');
    }

    showLoginForm() {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');
    }

    showDashboard() {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
    }

    showSection(section) {
        document.querySelectorAll('.admin-section').forEach(s => {
            s.classList.add('hidden');
        });
        document.getElementById(section).classList.remove('hidden');

        // Load section-specific data
        if (section === 'overview') {
            this.loadOverview();
        } else if (section === 'analytics') {
            this.loadAnalytics();
        }
    }

    async loadPosts() {
        try {
            const response = await fetch('/api/admin/posts', {
                credentials: 'include'
            });
            const posts = await response.json();
            this.renderPosts(posts);
        } catch (error) {
            console.error('Failed to load posts:', error);
        }
    }

    renderPosts(posts) {
        const table = document.querySelector('.posts-table');
        table.innerHTML = `
            <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Actions</th>
            </tr>
            ${posts.map(post => `
                <tr>
                    <td>${post.title}</td>
                    <td>${new Date(post.date).toLocaleDateString()}</td>
                    <td class="action-buttons">
                        <button onclick="adminPanel.editPost('${post._id}')" class="edit-btn">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="adminPanel.deletePost('${post._id}')" class="delete-btn">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                        <a href="/blog/${post.slug}" target="_blank" class="view-btn">
                            <i class="fas fa-external-link-alt"></i> View
                        </a>
                    </td>
                </tr>
            `).join('')}
        `;
    }

    initTinyMCE() {
        tinymce.init({
            selector: '#content',
            plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
            toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
            skin: 'oxide-dark',
            content_css: 'dark',
            setup: function(editor) {
                editor.on('change', function() {
                    editor.save(); // This triggers the change event on the textarea
                });
            },
            init_instance_callback: function(editor) {
                editor.setContent(editor.getContent()); // Ensure content is initialized
            }
        });
    }

    async loadAnalytics() {
        try {
            const response = await fetch('/api/admin/analytics', {
                credentials: 'include'
            });
            const data = await response.json();
            this.renderAnalytics(data);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        }
    }

    renderAnalytics(data) {
        // Update overview cards
        document.getElementById('totalViews').textContent = data.overview.totalViews.toLocaleString();
        document.getElementById('totalPosts').textContent = data.overview.totalPosts.toLocaleString();
        document.getElementById('uniqueVisitors').textContent = data.overview.totalUniqueVisitors.toLocaleString();

        // Render top posts
        const topPostsList = document.getElementById('topPosts');
        topPostsList.innerHTML = data.topPosts.map(post => `
            <div class="top-post-item">
                <h4>${post.postId.title}</h4>
                <div class="post-stats">
                    <span><i class="fas fa-eye"></i> ${post.views}</span>
                    <span><i class="fas fa-user"></i> ${post.uniqueVisitors}</span>
                </div>
            </div>
        `).join('');

        // Render views chart
        this.renderViewsChart(data.viewsOverTime);
    }

    renderViewsChart(viewsData) {
        const ctx = document.getElementById('viewsChart').getContext('2d');
        
        // Format data for Chart.js
        const labels = viewsData.map(item => 
            `${item._id.year}-${item._id.month}-${item._id.day}`
        );
        const views = viewsData.map(item => item.totalViews);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Views',
                    data: views,
                    borderColor: '#64ffda',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    async loadTinyMCE() {
        try {
            const response = await fetch('/api/config/editor');
            const config = await response.json();
            
            const script = document.getElementById('tinymce-script');
            script.src = `https://cdn.tiny.cloud/1/${config.tinymceKey}/tinymce/6/tinymce.min.js`;
            script.referrerPolicy = "origin";
            
            // Initialize TinyMCE after script loads
            script.onload = () => this.initTinyMCE();
        } catch (error) {
            console.error('Failed to load TinyMCE:', error);
        }
    }

    async submitPost(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        // Get content from TinyMCE
        formData.set('content', tinymce.get('content').getContent());
        
        try {
            const url = this.currentEditId 
                ? `/api/admin/posts/${this.currentEditId}`
                : '/api/admin/posts';
                
            const method = this.currentEditId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                credentials: 'include',
                body: formData // FormData automatically sets correct Content-Type
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save post');
            }

            alert(this.currentEditId ? 'Post updated successfully!' : 'Post created successfully!');
            this.resetForm();
            this.loadPosts();
            this.showSection('posts');
        } catch (error) {
            console.error('Failed to save post:', error);
            alert(error.message);
        }
    }

    async loadOverview() {
        try {
            const [postsResponse, analyticsResponse] = await Promise.all([
                fetch('/api/admin/posts', { credentials: 'include' }),
                fetch('/api/admin/analytics', { credentials: 'include' })
            ]);

            const posts = await postsResponse.json();
            const analytics = await analyticsResponse.json();

            this.renderOverview(posts, analytics);
        } catch (error) {
            console.error('Failed to load overview data:', error);
        }
    }

    renderOverview(posts, analytics) {
        // Update quick stats
        document.getElementById('overviewTotalPosts').textContent = posts.length;
        document.getElementById('overviewTotalViews').textContent = analytics.overview.totalViews.toLocaleString();
        
        // Get and format latest post date
        const latestPost = posts[0];
        document.getElementById('overviewLatestPost').textContent = 
            latestPost ? new Date(latestPost.date).toLocaleDateString() : 'No posts yet';

        // Render recent posts (last 5)
        const recentPostsList = document.getElementById('recentPosts');
        recentPostsList.innerHTML = posts.slice(0, 5).map(post => `
            <div class="recent-post-item">
                <div class="recent-post-info">
                    <h5>${post.title}</h5>
                    <span class="post-date">${new Date(post.date).toLocaleDateString()}</span>
                </div>
                <div class="action-buttons">
                    <button onclick="adminPanel.editPost('${post._id}')" class="edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <a href="/blog/${post.slug}" target="_blank" class="view-btn">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            </div>
        `).join('');
    }
}

const adminPanel = new AdminPanel(); 
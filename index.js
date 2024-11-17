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
    const interactiveElements = document.querySelectorAll('a, button, .project-card');
    
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

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Glitch effect for main heading
const glitchText = document.querySelector('.glitch-text');
let glitchInterval;

const startGlitch = () => {
    const originalText = glitchText.textContent;
    const glitchChars = '!<>-_\\/[]{}—=+*^?#________';
    
    let iterations = 0;
    
    clearInterval(glitchInterval);
    
    glitchInterval = setInterval(() => {
        glitchText.textContent = originalText
            .split('')
            .map((letter, index) => {
                if(index < iterations) {
                    return originalText[index];
                }
                return glitchChars[Math.floor(Math.random() * glitchChars.length)];
            })
            .join('');
        
        if(iterations >= originalText.length) {
            clearInterval(glitchInterval);
        }
        
        iterations += 1/3;
    }, 30);
};

// Trigger glitch effect on hover
glitchText.addEventListener('mouseenter', startGlitch);

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Add parallax effect to profile picture
window.addEventListener('scroll', () => {
    const profilePic = document.querySelector('.profile-pic');
    const scrolled = window.pageYOffset;
    profilePic.style.transform = `translateY(${scrolled * 0.1}px)`;
});

// Revert to the original iframe setup
function setupIframes() {
    const iframes = document.querySelectorAll('.preview-container iframe');
    
    iframes.forEach(iframe => {
        // Wait for iframe to load
        iframe.onload = function() {
            const scale = 0.25;
            const containerWidth = iframe.parentElement.offsetWidth;
            const iframeWidth = 1440; // Original iframe width
            
            // Calculate the centered position
            const leftPosition = (containerWidth - (iframeWidth * scale)) / 2;
            iframe.style.left = `${leftPosition/scale}px`;
        };
    });
}

// Call the function when the page loads
window.addEventListener('load', setupIframes);
// Also call it when window is resized
window.addEventListener('resize', setupIframes);

// Add after the existing code
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

createThemeToggle();

// Add to JavaScript
// Progress bar
const progressBar = document.querySelector('.progress-bar');

window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + '%';
});

// Add mobile navigation functionality
const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
const mobileDropdown = document.querySelector('.mobile-dropdown');

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

// Add Back to Top functionality
const backToTop = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 500) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Add page loader functionality
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.querySelector('.page-loader');
    
    // Start fading out immediately if coming from blog
    if (document.referrer.includes('/blog')) {
        loader.classList.add('fade-out');
    } else {
        // Normal load behavior for other cases
        setTimeout(() => {
            loader.classList.add('fade-out');
        }, 300);
    }
});

// Enhanced contact form with floating labels
const form = document.querySelector('#contact-form');
const inputs = form.querySelectorAll('input, textarea');

inputs.forEach(input => {
    const wrapper = document.createElement('div');
    wrapper.className = 'input-wrapper';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    
    const label = document.createElement('span');
    label.className = 'floating-label';
    label.textContent = input.placeholder;
    wrapper.appendChild(label);
    
    input.placeholder = '';
});

// Add floating label styles
const style = document.createElement('style');
style.textContent = `
    .input-wrapper {
        position: relative;
        margin-bottom: 1.5rem;
    }

    .floating-label {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text);
        transition: all 0.3s ease;
        pointer-events: none;
    }

    textarea + .floating-label {
        top: 1rem;
        transform: none;
    }

    input:focus + .floating-label,
    textarea:focus + .floating-label,
    input:not(:placeholder-shown) + .floating-label,
    textarea:not(:placeholder-shown) + .floating-label {
        top: -0.5rem;
        left: 0.5rem;
        font-size: 0.8rem;
        color: var(--secondary);
        background: var(--primary);
        padding: 0 0.5rem;
    }
`;
document.head.appendChild(style);

// Add popup HTML to the body
const popup = document.createElement('div');
popup.className = 'popup';
popup.innerHTML = `
    <div class="popup-content">
        <h3>Thank you!</h3>
        <p>Your message has been sent successfully.</p>
    </div>
    <button class="popup-close">Close</button>
`;
document.body.appendChild(popup);

// Handle form submission
const closePopup = document.querySelector('.popup-close');

form.addEventListener('submit', function(e) {
    // Don't prevent default - let the form submit
    const formData = new FormData(this);
    
    // Show popup after a delay
    setTimeout(() => {
        popup.classList.add('show');
        form.reset();
    }, 1000);
});

closePopup.addEventListener('click', () => {
    popup.classList.remove('show');
});

// Close popup when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.closest('.popup') === null && popup.classList.contains('show')) {
        popup.classList.remove('show');
    }
});

const animateElements = (elements, animation) => {
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = animation;
        el.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease';
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });
};

// Apply animations to different sections
animateElements(document.querySelectorAll('.project-card'), 'translateY(50px)');
animateElements(document.querySelectorAll('.experience-card'), 'translateX(-50px)');
animateElements(document.querySelectorAll('.education-card'), 'translateX(50px)');
animateElements(document.querySelectorAll('.cert-card'), 'translateY(30px)');

// Active section highlighting
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-menu a');

const options = {
    // Adjust these values for more responsive highlighting
    threshold: [0.2, 0.5, 0.8],
    rootMargin: '-10% 0px -90% 0px'
};

const updateActiveLink = (sectionId) => {
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
};

// Create a map to store section positions
const sectionPositions = new Map();

// Update section positions on load and resize
const updateSectionPositions = () => {
    sections.forEach(section => {
        sectionPositions.set(
            section.id,
            section.offsetTop - (window.innerHeight * 0.3)
        );
    });
};

window.addEventListener('load', updateSectionPositions);
window.addEventListener('resize', updateSectionPositions);

// Scroll event handler for real-time updates
window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    
    // Find the current section
    for (const [sectionId, position] of sectionPositions) {
        if (scrollPosition >= position) {
            updateActiveLink(sectionId);
        }
    }
});

// Keep the Intersection Observer for backup and smooth transitions
const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            updateActiveLink(entry.target.getAttribute('id'));
        }
    });
}, options);

sections.forEach(section => {
    navObserver.observe(section);
});

// Update active link on click (keep this part unchanged)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        navLinks.forEach(link => link.classList.remove('active'));
        this.classList.add('active');
        
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
        
        if (mobileNavMenu.classList.contains('active')) {
            mobileNavMenu.classList.remove('active');
            mobileNavToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
});

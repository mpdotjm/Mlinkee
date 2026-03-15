// Auth system - Linkee keys (single declaration after migration)
let currentUser = JSON.parse(localStorage.getItem('linkeeCurrentUser')) || null;
let users = JSON.parse(localStorage.getItem('linkeeUsers')) || [];
let postedJobs = JSON.parse(localStorage.getItem('linkeePostedJobs')) || [];

// Sample service data
const services = [
    {
        id: 1,
        name: 'Emergency Plumbing',
        category: 'plumbing',
        description: 'Fix leaks, unclog drains, water heater repair',
        price: '$50-150',
        icon: 'fas fa-wrench'
    },
    {
        id: 2,
        name: 'Electrical Wiring',
        category: 'electrical',
        description: 'Outlet installation, lighting, panel upgrades',
        price: '$75-200',
        icon: 'fas fa-plug'
    },
    {
        id: 3,
        name: 'Cabinet Installation',
        category: 'carpentry',
        description: 'Custom cabinets, furniture assembly, repairs',
        price: '$40-120',
        icon: 'fas fa-hammer'
    },
    {
        id: 4,
        name: 'Deep House Cleaning',
        category: 'cleaning',
        description: 'Full home cleaning, move-out, post-construction',
        price: '$30-80/hr',
        icon: 'fas fa-broom'
    },
    {
        id: 5,
        name: 'AC Repair',
        category: 'electrical',
        description: 'Air conditioning service and maintenance',
        price: '$100-300',
        icon: 'fas fa-fan'
    },
    {
        id: 6,
        name: 'Painting Services',
        category: 'carpentry',
        description: 'Interior/exterior painting, wallpaper removal',
        price: '$25-60/hr',
        icon: 'fas fa-paint-roller'
    }
];



// Single declarations above - storage migration handled in migrateStorage()


// Page detection & DOM elements - initialize once
let servicesGrid, searchInput, categoryFilter, clearFilterBtn, jobForm, postedJobsEl, allJobsEl, jobProtection, loginLinks;
loginLinks = document.querySelectorAll('.login-link');

document.addEventListener('DOMContentLoaded', function() {
    // Load navbar first
    const navbarScript = document.createElement('script');
    navbarScript.src = 'navbar.js';
    navbarScript.onload = initPage;
    document.head.appendChild(navbarScript);
});

// Initialize based on current page
function initPage() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    
// Common navbar setup
    setupNavbar();
    checkLoginStatus();
    
    if (path === 'services.html' || path.includes('index')) {
        initServices();
    } else if (path === 'post-job.html') {
        initPostJob();
    } else if (path === 'jobs.html') {
        initJobs();
    }
    
    migrateStorage(); // Migrate old LocalLinks data
}

function migrateStorage() {
    // One-time migration from locallinks to linkee keys
    if (localStorage.getItem('locallinksCurrentUser')) {
        localStorage.setItem('linkeeCurrentUser', localStorage.getItem('locallinksCurrentUser'));
        localStorage.removeItem('locallinksCurrentUser');
    }
    if (localStorage.getItem('locallinksUsers')) {
        localStorage.setItem('linkeeUsers', localStorage.getItem('locallinksUsers'));
        localStorage.removeItem('locallinksUsers');
    }
    if (localStorage.getItem('postedJobs')) {
        localStorage.setItem('linkeePostedJobs', localStorage.getItem('postedJobs'));
        localStorage.removeItem('postedJobs');
    }
    currentUser = JSON.parse(localStorage.getItem('linkeeCurrentUser')) || null;
    users = JSON.parse(localStorage.getItem('linkeeUsers')) || [];
    postedJobs = JSON.parse(localStorage.getItem('linkeePostedJobs')) || [];
}

function checkLoginStatus() {
    // No redeclaration - load currentUser
    if (!currentUser) {
        currentUser = JSON.parse(localStorage.getItem('linkeeCurrentUser')) || null;
    }
    
    // Update all login links
    loginLinks.forEach(link => {
        if (!currentUser) {
            link.href = 'login.html';
            link.textContent = 'Login';
            link.style.display = 'inline-block';
        } else {
            link.href = '#';
            link.textContent = 'Logout';
            link.onclick = logout;
        }
    });
    
    if (!currentUser) {
        const protectedSections = document.querySelectorAll('[data-protected]');
        protectedSections.forEach(section => {
            if (!section.querySelector('.login-prompt')) {
                section.innerHTML = '<div class="login-prompt" style="min-height: 400px; padding: 4rem 2rem; background: white; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.1);"><h3>Login Required</h3><p><a href="login.html" class="login-link btn btn-primary">Login to Continue</a></p></div>';
            }
        });
    }
}

function logout() {
    localStorage.removeItem('linkeeCurrentUser');
    window.location.reload();
}

function setupEventListeners() {
    // Navbar mobile
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Login link if exists


    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Search and filter
    searchInput.addEventListener('input', filterServices);
    categoryFilter.addEventListener('change', filterServices);
    clearFilterBtn.addEventListener('click', clearFilters);

    // Job form
    jobForm.addEventListener('submit', handleJobSubmit);

    // Contact modal
    contactModalBtn.addEventListener('click', openModal);
    closeModal.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === contactModal) closeModal();
    });
    contactForm.addEventListener('submit', handleContactSubmit);
}

function renderServices(serviceList) {
    servicesGrid.innerHTML = serviceList.map(service => `
        <div class="service-card" data-category="${service.category}">
            <div class="service-icon">
                <i class="${service.icon}"></i>
            </div>
            <h3>${service.name}</h3>
            <p>${service.description}</p>
            <div class="service-price">${service.price}</div>
            <button class="btn btn-secondary" onclick="hirePro('${service.id}')">Hire Pro</button>
        </div>
    `).join('');
}

function filterServices() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    
    const filtered = services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm) ||
                             service.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || service.category === category;
        return matchesSearch && matchesCategory;
    });
    
    renderServices(filtered);
    
    // Hide/show clear button
    clearFilterBtn.style.display = (searchTerm || category) ? 'block' : 'none';
}

function clearFilters() {
    searchInput.value = '';
    categoryFilter.value = '';
    renderServices(services);
    clearFilterBtn.style.display = 'none';
}

function handleJobSubmit(e) {
    e.preventDefault();
    
    const job = {
        id: Date.now(),
        title: document.getElementById('jobTitle').value,
        category: document.getElementById('jobCategory').value,
        description: document.getElementById('jobDescription').value,
        budget: document.getElementById('budget').value,
        location: document.getElementById('location').value,
        date: new Date().toLocaleDateString()
    };
    
    postedJobs.unshift(job);
    localStorage.setItem('linkeePostedJobs', JSON.stringify(postedJobs));
    renderPostedJobs();
    jobForm.reset();
    
    // Scroll to posted jobs
    postedJobsEl.scrollIntoView({ behavior: 'smooth' });
    
    alert('Job posted successfully! Pros will contact you soon.');
}

function renderPostedJobs() {
    if (postedJobs.length === 0) {
        postedJobsEl.innerHTML = '<h3>Your Posted Jobs</h3><p>No jobs posted yet. Post your first job above!</p>';
        return;
    }
    
    postedJobsEl.innerHTML = `
        <h3>Your Posted Jobs (${postedJobs.length})</h3>
        ${postedJobs.map(job => `
            <div class="job-item">
                <div>
                    <h4>${job.title}</h4>
                    <p>${job.category} • $${job.budget} • ${job.location}</p>
                    <small>Posted: ${job.date}</small>
                </div>
                <div>
                    <button class="btn btn-primary" onclick="editJob(${job.id})">Edit</button>
                    <button class="btn" style="background:#ff6b6b;color:white;" onclick="deleteJob(${job.id})">Delete</button>
                </div>
            </div>
        `).join('')}
    `;
}

function hirePro(serviceId) {
    const service = services.find(s => s.id == serviceId);
    alert(`Great choice! Contacting ${service.name} professionals in your area.`);
}

function editJob(jobId) {
    const job = postedJobs.find(j => j.id === jobId);
    if (job) {
        // Simple edit - repopulate form
        document.getElementById('jobTitle').value = job.title;
        document.getElementById('jobCategory').value = job.category;
        document.getElementById('jobDescription').value = job.description;
        document.getElementById('budget').value = job.budget;
        document.getElementById('location').value = job.location;
        deleteJob(jobId);
    }
}

function deleteJob(jobId) {
    if (confirm('Delete this job?')) {
        postedJobs = postedJobs.filter(j => j.id !== jobId);
        localStorage.setItem('linkeePostedJobs', JSON.stringify(postedJobs));
        renderPostedJobs();
    }
}

function openModal() {
    contactModal.style.display = 'block';
}

function closeModal() {
    contactModal.style.display = 'none';
}

function handleContactSubmit(e) {
    e.preventDefault();
    alert('Thank you for your message! We\'ll get back to you soon.');
    contactForm.reset();
    closeModal();
}

function updateTodo() {
    // Mark steps as complete in TODO.md - will be updated manually
    console.log('Steps 1-4 complete. Testing next.');
}

// Animate on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.service-card, .post-job, .services h2').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

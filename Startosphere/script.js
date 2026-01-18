// Startosphere - Minimal JavaScript for Interactivity

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function () {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function () {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function (event) {
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            const isClickInsideMenu = mobileMenu.contains(event.target);
            const isClickOnButton = mobileMenuBtn.contains(event.target);

            if (!isClickInsideMenu && !isClickOnButton) {
                mobileMenu.classList.add('hidden');
            }
        }
    });
});

// Browse Page - Filter and Search Functionality
if (document.getElementById('providers-grid')) {
    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.getElementById('search-input');
    const sortFilter = document.getElementById('sort-filter');
    const providersGrid = document.getElementById('providers-grid');
    const providerCards = Array.from(document.querySelectorAll('.provider-card'));

    // Filter by category
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function () {
            filterProviders();
        });
    }

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            filterProviders();
        });
    }

    // Sort functionality
    if (sortFilter) {
        sortFilter.addEventListener('change', function () {
            sortProviders();
        });
    }

    function filterProviders() {
        const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

        providerCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            const cardText = card.textContent.toLowerCase();

            const matchesCategory = selectedCategory === 'all' || cardCategory === selectedCategory;
            const matchesSearch = searchTerm === '' || cardText.includes(searchTerm);

            if (matchesCategory && matchesSearch) {
                card.style.display = 'block';
                // Add fade-in animation
                card.style.animation = 'fade-in 0.5s ease-out';
            } else {
                card.style.display = 'none';
            }
        });
    }

    function sortProviders() {
        const sortValue = sortFilter.value;
        let sortedCards = [...providerCards];

        if (sortValue === 'name') {
            sortedCards.sort((a, b) => {
                const nameA = a.querySelector('h3').textContent;
                const nameB = b.querySelector('h3').textContent;
                return nameA.localeCompare(nameB);
            });
        } else if (sortValue === 'newest') {
            // Reverse the original order for "newest"
            sortedCards.reverse();
        }
        // 'featured' keeps the original order

        // Clear and re-append cards in sorted order
        providersGrid.innerHTML = '';
        sortedCards.forEach(card => {
            providersGrid.appendChild(card);
        });
    }

    // Check URL parameters for category filter
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam && categoryFilter) {
        categoryFilter.value = categoryParam;
        filterProviders();
    }
}

// Submit Form Handling
if (document.getElementById('submit-form')) {
    const submitForm = document.getElementById('submit-form');
    const successMessage = document.getElementById('success-message');

    submitForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(submitForm);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        // Show loading state
        const submitBtn = submitForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = 'Sending...';
        submitBtn.disabled = true;

        // Prepare parameters for EmailJS
        const templateParams = {
            company_name: data['company-name'],
            category: data['category'],
            description: data['description'],
            location: data['location'],
            years_experience: data['years-experience'],
            contact_name: data['contact-name'],
            email: data['email'],
            phone: data['phone'],
            website: data['website'] || '',
            services: data['services'],
            specialties: data['specialties'],
            clients_served: data['clients-served'],
            additional_info: data['additional-info'],
            // Create a JSON string block for the Admin Portal
            admin_data_block: JSON.stringify(data)
        };

        // Send via EmailJS (Silent Submission)
        // REPLACE WITH YOUR SERVICE ID and TEMPLATE ID
        emailjs.send(service_g66pmd8, template_on3xoda, templateParams)
            .then(function () {
                console.log('SUCCESS!');
                // Show success message
                submitForm.style.display = 'none';
                successMessage.classList.remove('hidden');

                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, function (error) {
                console.log('FAILED...', error);
                alert('Submission failed. Please try again or contact us directly.');
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            });
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading animation to buttons on click
document.querySelectorAll('button[type="submit"]').forEach(button => {
    button.addEventListener('click', function () {
        if (this.form && this.form.checkValidity()) {
            this.classList.add('loading');
            setTimeout(() => {
                this.classList.remove('loading');
            }, 2000);
        }
    });
});

// Intersection Observer for fade-in animations on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards and sections
document.querySelectorAll('.glass-card, .category-card, .provider-card, .feature-card').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(element);
});

// Add hover effect sound (optional - commented out by default)
/*
const hoverSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUBELTKXh8bllHAU2jdXvz3wqBSl+zPDajkAKE1y06+qnVRQLRp/g8r5sIQUrgs/y2Ik2CBhkuezooVARCkyp4fG5ZRwFNo3V789+KgUpfsz');
document.querySelectorAll('.provider-card, .category-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        hoverSound.currentTime = 0;
        hoverSound.play().catch(() => {});
    });
});
*/

// Console welcome message
console.log('%c🚀 Welcome to Startosphere! ', 'background: #2C3E50; color: white; font-size: 16px; padding: 10px; border-radius: 5px;');
console.log('%cConnecting startups with the services they need to succeed.', 'color: #3B82F6; font-size: 12px;');





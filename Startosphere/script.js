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
// Browse Page - Dynamic Data Loading and Filtering
if (document.getElementById('providers-grid')) {
    const providersGrid = document.getElementById('providers-grid');
    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.getElementById('search-input');
    const sortFilter = document.getElementById('sort-filter');

    let allProviders = [];

    // Load Providers from Global Variable (providers.js)
    if (typeof providersData !== 'undefined') {
        allProviders = providersData;
        applyFilters();
    } else {
        console.error('providersData is undefined. Make sure providers.js is included.');
        providersGrid.innerHTML = '<p class="col-span-full text-center text-gray-500">No providers found. (Database file missing)</p>';
    }

    function renderProviders(providers) {
        providersGrid.innerHTML = '';

        if (providers.length === 0) {
            providersGrid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-12 text-xl">No providers match your search.</p>';
            return;
        }

        providers.forEach(provider => {
            // Determine Color and Label
            const colorMap = {
                'accounting': 'green',
                'legal': 'blue',
                'it': 'purple',
                'marketing': 'pink',
                'fundraising': 'yellow',
                'hr': 'orange',
                'estate_ancillary': 'indigo'
            };
            const color = colorMap[provider.category] || 'blue';
            const categoryLabel = (provider.category === 'estate_ancillary') ? 'Real Estate & Ancillary' : provider.category.charAt(0).toUpperCase() + provider.category.slice(1);

            // Initials
            const initials = provider.initials || provider['company-name'].substring(0, 2).toUpperCase();

            // Logo Logic
            let logoHtml = '';
            if (provider.logo) {
                logoHtml = `<img src="${provider.logo}" alt="${provider['company-name']}" class="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-md">`;
            } else {
                logoHtml = `<div class="w-16 h-16 bg-gradient-to-br from-${color}-400 to-${color}-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-${color}-500/30">
                        ${initials}
                    </div>`;
            }

            // Safe JSON for attribute
            const safeProfileJson = JSON.stringify(provider).replace(/'/g, "&#39;");

            const card = document.createElement('div');
            card.className = 'provider-card glass-card p-6 rounded-2xl hover:transform hover:scale-105 transition-all cursor-pointer animate-fade-in group';
            card.setAttribute('data-category', provider.category);
            card.setAttribute('data-profile', safeProfileJson);
            card.onclick = function () { viewProfile(this); };

            card.innerHTML = `
                <div class="flex items-start justify-between mb-4">
                    ${logoHtml}
                    <span class="px-3 py-1 bg-${color}-500/20 text-${color}-600 rounded-full text-sm font-semibold border border-${color}-200">${categoryLabel}</span>
                </div>
                <h3 class="text-2xl font-bold text-navy-900 mb-2">${provider['company-name']}</h3>
                <p class="text-gray-600 mb-4 line-clamp-2">${provider.description}</p>
                <div class="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                    </svg>
                    ${provider.location}
                </div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1">
                        <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        <span class="text-navy-900 font-semibold">${provider.rating || '5.0'}</span>
                        <span class="text-gray-500">(${provider.reviews || 0} reviews)</span>
                    </div>
                </div>
            `;
            providersGrid.appendChild(card);
        });
    }

    // Unified Filter Function
    function applyFilters() {
        const category = categoryFilter ? categoryFilter.value : 'all';
        const search = searchInput ? searchInput.value.toLowerCase() : '';
        const sort = sortFilter ? sortFilter.value : 'featured';

        // 1. Filter
        let filtered = allProviders.filter(p => {
            const matchesCat = category === 'all' || p.category === category;
            const matchesSearch = p['company-name'].toLowerCase().includes(search) ||
                p.description.toLowerCase().includes(search);
            return matchesCat && matchesSearch;
        });

        // 2. Sort
        if (sort === 'name') {
            filtered.sort((a, b) => a['company-name'].localeCompare(b['company-name']));
        } else if (sort === 'newest') {
            // Assuming the array order is roughly 'recency' if no date field, simply reverse dynamic list
            // Or better, just reverse the array if we assume append-only
            // Since we manipulate array, let's just reverse for now or sorting by ID? 
            // Let's assume standard push order = newest last, so reverse means newest first.
            // Create a copy to not mutate original if we needed that (but filtered is already new)
            filtered.reverse();
        }

        renderProviders(filtered);
    }

    // Event Listeners
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (sortFilter) sortFilter.addEventListener('change', applyFilters);

    // Initial URL Params check
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam && categoryFilter) {
        categoryFilter.value = categoryParam;
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

        // Handle File Upload (Logo) - Upload to backend
        const fileInput = document.getElementById('logo');
        const file = fileInput.files[0];

        // Function to upload logo to backend
        const uploadLogo = async (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const apiUrl = '/api/upload-logo';

                        const response = await fetch(apiUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                image: e.target.result,
                                filename: file.name
                            })
                        });

                        const data = await response.json();

                        if (data.success && data.url) {
                            resolve(data.url);
                        } else {
                            reject(new Error(data.error || 'Upload failed'));
                        }
                    } catch (error) {
                        reject(error);
                    }
                };
                reader.onerror = () => reject(new Error('File read error'));
                reader.readAsDataURL(file);
            });
        };

        // Function to send data
        const sendData = (logoUrl = '') => {
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
                logo_url: logoUrl || 'No Logo',
                admin_data_block: JSON.stringify({ ...data, logo: logoUrl })
            };

            // Send via EmailJS
            emailjs.send('service_g66pmd8', 'template_on3xoda', templateParams)
                .then(function () {
                    console.log('SUCCESS!');
                    submitForm.style.display = 'none';
                    successMessage.classList.remove('hidden');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }, function (error) {
                    console.log('FAILED...', error);
                    alert('Submission failed. Please try again.');
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                });
        };

        // Handle file upload
        if (file) {
            if (file.size > 5000000) {
                alert('File is too large. Please upload a logo smaller than 5MB.');
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
                return;
            }

            submitBtn.innerText = 'Uploading logo...';
            uploadLogo(file)
                .then(logoUrl => {
                    submitBtn.innerText = 'Sending...';
                    sendData(logoUrl);
                })
                .catch(error => {
                    console.error('Logo upload failed:', error);
                    if (confirm('Logo upload failed: ' + error.message + '\n\nSubmit without logo?')) {
                        sendData('');
                    } else {
                        submitBtn.innerText = originalBtnText;
                        submitBtn.disabled = false;
                    }
                });
        } else {
            sendData('');
        }
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
// View Profile Functionality
function viewProfile(card) {
    const profileData = card.getAttribute('data-profile');
    if (profileData) {
        localStorage.setItem('current_profile', profileData);
        window.location.href = 'profile.html';
    } else {
        // Fallback for legacy or test cards
        alert('Profile details not available for this legacy entry.');
    }
}

// Profile Page Population
if (window.location.pathname.includes('profile.html')) {
    document.addEventListener('DOMContentLoaded', function () {
        const dataStr = localStorage.getItem('current_profile');
        if (dataStr) {
            try {
                const data = JSON.parse(dataStr);

                // Helper to safely set text
                const setText = (id, text) => {
                    const el = document.getElementById(id);
                    if (el) el.textContent = text || '';
                };

                setText('profile-name', data['company-name']);
                setText('profile-category', data['category']);
                setText('profile-desc', data['description']);
                setText('profile-location', data['location']);
                setText('profile-email', data['email']);
                setText('profile-phone', data['phone']);
                setText('profile-website', data['website']);

                // Handle "Specialties" (assuming comma-separated string or array)
                const specialtiesContainer = document.getElementById('profile-specialties');
                if (specialtiesContainer && data['specialties']) {
                    const specs = data['specialties'].split(',').map(s => s.trim());
                    specialtiesContainer.innerHTML = specs.map(s =>
                        `<span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">${s}</span>`
                    ).join('');
                }

                // Handle Initials or Logo
                const initialsContainer = document.getElementById('profile-initials');
                if (data['logo']) {
                    // Replace initials div with image
                    initialsContainer.className = 'w-32 h-32 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-lg border-4 border-white';
                    initialsContainer.innerHTML = `<img src="${data['logo']}" class="w-full h-full object-cover">`;
                } else {
                    // Default Initials
                    const initials = data['company-name'] ? data['company-name'].split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
                    setText('profile-initials', initials);
                    // Reset class just in case
                    initialsContainer.className = 'w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-5xl font-bold font-inter';
                }

            } catch (e) {
                console.error("Error parsing profile data", e);
            }
        }
    });
}

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





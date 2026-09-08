document.addEventListener("DOMContentLoaded", function() {
    // --- Theme Toggle (Dark/Light Mode) ---
    const themeToggleBtns = document.querySelectorAll('#theme-toggle, #theme-toggle-mobile');
    const body = document.documentElement;
    
    // Check local storage for theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        updateThemeIcons(true);
    }

    themeToggleBtns.forEach(btn => {
        if (!btn) return;
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Theme toggle clicked");
            const isDark = body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateThemeIcons(isDark);
        });
    });

    function updateThemeIcons(isDark) {
        themeToggleBtns.forEach(btn => {
            if (!btn) return;
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = isDark ? 'ri-sun-line' : 'ri-moon-line';
            }
        });
    }

        // --- FAQ Accordion ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                if (otherItem.querySelector('.faq-answer')) {
                    otherItem.querySelector('.faq-answer').style.maxHeight = null;
                }
            });
            
            // Open clicked if it wasn't active
            if (!isActive) {
                item.classList.add('active');
                const answer = item.querySelector('.faq-answer');
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });

    // --- Form Handling ---
    const contactForm = document.getElementById('modernContactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Loading State
            submitBtn.innerHTML = '<i class="ri-loader-4-line animate-spin"></i> Memproses...';
            submitBtn.disabled = true;

            const name = document.getElementById('name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const car = document.getElementById('car').value.trim();

            setTimeout(() => {
                // Formatting WhatsApp Message
                const message = `Halo Mas Rizki, saya ${name}. Saya berencana untuk mengambil mobil ${car}. Nomor saya: ${phone}. Mohon bantuan simulasi kreditnya ya.`;
                const waLink = `https://wa.me/6282328936019?text=${encodeURIComponent(message)}`;
                
                // Reset State
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                contactForm.reset();

                // Redirect to WhatsApp
                window.open(waLink, '_blank');
            }, 1000);
        });
    }

    // --- Scroll Reveal Animations ---
    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealElements = document.querySelectorAll('.feature-card, .step-card, .profil-grid, .contact-form-wrapper, .hero-content, .gallery-item, .faq-item');
    
    // Initial state for reveal elements
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    });

    const revealObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => revealObserver.observe(el));

    // --- Dynamic Nav Styling on Scroll ---
    const nav = document.querySelector('.floating-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Testimonial Carousel Drag-to-Scroll & Dots Logic
    const track = document.querySelector('.carousel-track');
    const dotsContainer = document.querySelector('.carousel-dots');

    if (track && dotsContainer) {
        const cards = track.querySelectorAll('.testi-card');
        
        // Generate dots based on number of cards
        cards.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('carousel-dot');
            if (index === 0) dot.classList.add('active');
            
            // Dot click event
            dot.addEventListener('click', () => {
                const cardWidth = cards[0].offsetWidth;
                const gap = 32;
                track.scrollTo({
                    left: (cardWidth + gap) * index,
                    behavior: 'smooth'
                });
            });
            
            dotsContainer.appendChild(dot);
        });

        const dots = document.querySelectorAll('.carousel-dot');

        // Sync active dot with scroll position
        track.addEventListener('scroll', () => {
            const scrollPos = track.scrollLeft;
            const cardWidth = cards[0].offsetWidth;
            const gap = 32;
            const currentIndex = Math.round(scrollPos / (cardWidth + gap));
            
            dots.forEach(d => d.classList.remove('active'));
            if (dots[currentIndex]) {
                dots[currentIndex].classList.add('active');
            }
        });

        // Drag-to-Scroll
        let isDown = false;
        let startX;
        let scrollLeft;

        track.addEventListener('mousedown', (e) => {
            isDown = true;
            track.classList.add('active');
            startX = e.pageX - track.offsetLeft;
            scrollLeft = track.scrollLeft;
            track.style.scrollBehavior = 'auto';
            track.style.scrollSnapType = 'none';
        });
        
        track.addEventListener('mouseleave', () => {
            if (!isDown) return;
            isDown = false;
            track.classList.remove('active');
            track.style.scrollBehavior = 'smooth';
            track.style.scrollSnapType = 'x mandatory';
        });
        
        track.addEventListener('mouseup', () => {
            isDown = false;
            track.classList.remove('active');
            track.style.scrollBehavior = 'smooth';
            track.style.scrollSnapType = 'x mandatory';
        });
        
        track.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - track.offsetLeft;
            const walk = (x - startX) * 1.5;
            track.scrollLeft = scrollLeft - walk;
        });
    }
});


// --- SUPABASE DYNAMIC CONTENT FETCHER ---
async function fetchGlobalSettings() {
    if (typeof sbClient === 'undefined') return;
    
    const { data, error } = await sbClient.from('settings').select('*');
    if (data) {
        let settings = {};
        data.forEach(item => settings[item.key] = item.value);

                // Update WhatsApp Links & Text
        if (settings.whatsapp) {
            const cleanWa = settings.whatsapp.replace(/[^0-9]/g, '');
            const waLinks = document.querySelectorAll('a[href^="https://wa.me"]');
            waLinks.forEach(link => {
                link.href = "https://wa.me/" + cleanWa;
            });
            
            // Format for display (e.g., 62812... -> 0812...)
            let displayWa = cleanWa;
            if (displayWa.startsWith('62')) {
                displayWa = '0' + displayWa.substring(2);
            }
            
            const profileText = document.getElementById('profile-phone-text');
            if (profileText) {
                // Add hyphens for readability if possible
                let formattedWa = displayWa;
                if (displayWa.length >= 10) {
                    formattedWa = displayWa.substring(0,4) + '-' + displayWa.substring(4,8) + '-' + displayWa.substring(8);
                }
                profileText.innerText = formattedWa;
            }
        }

        // Update Email Links
        if (settings.email) {
            const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
            emailLinks.forEach(link => {
                link.href = "mailto:" + settings.email;
                // If it contains text that looks like the email, update it
                if (link.innerText.includes('@')) {
                    link.innerHTML = `<i class="ri-mail-fill"></i> ` + settings.email;
                }
            });
        }

        // Update Instagram Links
        if (settings.instagram) {
            const igLinks = document.querySelectorAll('a[aria-label="Instagram"]');
            igLinks.forEach(link => link.href = settings.instagram);
        }

        // Update Facebook Links
        if (settings.facebook) {
            const fbLinks = document.querySelectorAll('a[aria-label="Facebook"]');
            fbLinks.forEach(link => link.href = settings.facebook);
        }

        // Update Hero & Parallax Images
        if (settings.hero_image_url) {
            const heroImg = document.querySelector('.hero-main-image');
            if (heroImg) heroImg.src = settings.hero_image_url;
            
            const ctaSection = document.querySelector('.cta-section');
            if (ctaSection) {
                ctaSection.style.backgroundImage = 'linear-gradient(to right, rgba(15, 23, 42, 0.95), rgba(37, 99, 235, 0.85)), url(' + settings.hero_image_url + ')';
            }
        }
    }
}


// --- SUPABASE DYNAMIC FAQ FETCHER ---
async function fetchGlobalFaq() {
    if (typeof sbClient === 'undefined') return;
    
    const { data, error } = await sbClient.from('faq').select('*').order('order_num', { ascending: true }).order('created_at', { ascending: true });
    if (data && data.length > 0) {
        const faqList = document.querySelector('.faq-list');
        if (!faqList) return;
        
        // Remove old hardcoded FAQs, keep only the bottom help section if exists
        const helpSection = Array.from(faqList.children).filter(el => el.tagName === 'H4' || el.tagName === 'A');
        faqList.innerHTML = '';
        
        data.forEach(item => {
            const div = document.createElement('div');
            div.className = 'faq-item';
            // Initial reveal state so they animate in
            div.style.opacity = '0';
            div.style.transform = 'translateY(30px)';
            div.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            
            div.innerHTML = '<button class="faq-question"><span>' + item.question + '</span><i class="ri-arrow-down-s-line"></i></button><div class="faq-answer"><p>' + item.answer + '</p></div>';
            
            // Re-attach click logic
            const btn = div.querySelector('.faq-question');
            btn.addEventListener('click', () => {
                const isActive = div.classList.contains('active');
                
                // Close all
                document.querySelectorAll('.faq-item').forEach(other => {
                    other.classList.remove('active');
                    const ans = other.querySelector('.faq-answer');
                    if (ans) ans.style.maxHeight = null;
                });
                
                // Open clicked
                if (!isActive) {
                    div.classList.add('active');
                    const answer = div.querySelector('.faq-answer');
                    answer.style.maxHeight = answer.scrollHeight + "px";
                }
            });
            
            faqList.appendChild(div);
            // Manually trigger reveal animation after a slight delay
            setTimeout(() => {
                div.style.opacity = '1';
                div.style.transform = 'translateY(0)';
            }, 100);
        });
        
        // Restore help links
        helpSection.forEach(el => faqList.appendChild(el));
    }
}

// Panggil fungsi setelah halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    fetchGlobalSettings();
    fetchGlobalFaq();
    fetchGlobalTestimoni();
    fetchGlobalGaleri();
    fetchGlobalBrands();
});









// --- SUPABASE DYNAMIC TESTIMONI FETCHER ---
async function fetchGlobalTestimoni() {
    if (typeof sbClient === 'undefined') return;
    
    const { data, error } = await sbClient.from('testimonials').select('*').order('created_at', { ascending: false });
    if (data && data.length > 0) {
        const track = document.querySelector('.carousel-track');
        if (!track) return;
        
        track.innerHTML = ''; // Clear old hardcoded testimonials
        
        data.forEach(item => {
            const photoUrl = item.photo_url ? item.photo_url : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(item.client_name) + '&background=0a3a82&color=fff&size=128';
            
            const div = document.createElement('div');
            div.className = 'testi-card';
            const ratingCount = item.rating || 5;
            let starsHtml = '';
            for(let i=0; i<ratingCount; i++) { starsHtml += '<i class="ri-star-fill"></i>'; }
            
            div.innerHTML = '<div class="testi-photo"><img src="' + photoUrl + '" alt="' + item.client_name + '"><div class="testi-rating">' + starsHtml + '</div></div><div class="testi-content"><i class="ri-double-quotes-l quote-icon"></i><p class="testi-text">"' + item.quote + '"</p><div class="testi-divider"></div><div class="testi-author"><h4>' + item.client_name + '</h4><span>' + item.car_info + '</span></div></div>';
            track.appendChild(div);
        });

        // RE-INIT CAROUSEL DOTS & DRAG
        const dotsContainer = document.querySelector('.carousel-dots');
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            const cards = track.querySelectorAll('.testi-card');
            
            cards.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.classList.add('carousel-dot');
                if (index === 0) dot.classList.add('active');
                
                dot.addEventListener('click', () => {
                    const scrollAmount = track.offsetWidth;
                    track.scrollTo({ left: scrollAmount * index, behavior: 'smooth' });
                });
                dotsContainer.appendChild(dot);
            });

            track.addEventListener('scroll', () => {
                const scrollPosition = track.scrollLeft;
                const cardWidth = track.offsetWidth;
                const activeIndex = Math.round(scrollPosition / cardWidth);
                const dots = dotsContainer.querySelectorAll('.carousel-dot');
                dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === activeIndex);
                });
            });
        }
    }
}


// --- SUPABASE DYNAMIC GALERI FETCHER ---
async function fetchGlobalGaleri() {
    if (typeof sbClient === 'undefined') return;
    
    const { data, error } = await sbClient.from('gallery').select('*').order('created_at', { ascending: false });
    if (data && data.length > 0) {
        // Target 1: Landing Page (gallery-grid)
        const grid1 = document.querySelector('.gallery-grid');
        if (grid1) {
            grid1.innerHTML = ''; // Hapus galeri statis lama
            
            data.forEach(item => {
                const div = document.createElement('div');
                div.className = 'gallery-item';
                div.style.opacity = '0';
                div.style.transform = 'translateY(30px)';
                div.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                
                const img = document.createElement('img');
                img.src = item.image_url;
                img.alt = item.title;
                
                const overlay = document.createElement('div');
                overlay.className = 'gallery-overlay';
                
                const h4 = document.createElement('h4');
                h4.innerText = item.title;
                
                let tagsHtml = '';
                
                if(item.year) tagsHtml += '<span class="gallery-info-badge"><i class="ri-calendar-line"></i> ' + item.year + '</span>';
                if(item.transmission) tagsHtml += '<span class="gallery-info-badge"><i class="ri-settings-4-line"></i> ' + item.transmission + '</span>';
                if(item.fuel_type) tagsHtml += '<span class="gallery-info-badge"><i class="ri-gas-station-line"></i> ' + item.fuel_type + '</span>';
                
                const tagsContainer = document.createElement('div');
                tagsContainer.className = 'gallery-tags-container';
                tagsContainer.innerHTML = tagsHtml;
                
                overlay.appendChild(h4);
                if (tagsHtml !== '') {
                    overlay.appendChild(tagsContainer);
                }
                
                div.appendChild(img);
                div.appendChild(overlay);
                grid1.appendChild(div);
                
                setTimeout(() => {
                    div.style.opacity = '1';
                    div.style.transform = 'translateY(0)';
                }, 100);
            });
        }
        
        // Target 2: Halaman Galeri (car-grid)
        const grid2 = document.querySelector('.catalog-grid');
        if (grid2) {
            grid2.innerHTML = '';
            
            data.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = 'car-card';
                
                // Fetch whatsapp number from settings if available (or use fallback)
                // We'll just construct the WA link and the global fetchSettings will update the phone number later if we use the right selector!
                // Actually, fetchGlobalSettings updates a[href^="https://wa.me"] so it will auto-update!
                
                                const dataStr = encodeURIComponent(JSON.stringify(item));
                
                let tagsHtml = '';
                if(item.year) tagsHtml += '<span class="tag"><i class="ri-calendar-line"></i> ' + item.year + '</span>';
                if(item.transmission) tagsHtml += '<span class="tag"><i class="ri-settings-4-line"></i> ' + item.transmission + '</span>';
                if(item.fuel_type) tagsHtml += '<span class="tag"><i class="ri-gas-station-line"></i> ' + item.fuel_type + '</span>';
                if(!tagsHtml) tagsHtml = '<span class="tag"><i class="ri-checkbox-circle-fill text-primary"></i> Tersedia via MUF</span>';
                
                div.innerHTML = '<div class="car-img-wrapper" style="cursor:pointer;"><img src="' + item.image_url + '"></div>' + 
                                '<div class="car-info">' + 
                                    '<h3 class="car-title" style="cursor:pointer;"></h3>' + 
                                    '<div style="color: var(--primary); font-weight: 700; margin-bottom: 12px;" class="car-price-display"></div>' +
                                    '<div class="car-tags">' + tagsHtml + '</div>' + 
                                    '<div class="car-action">' + 
                                        '<button class="btn btn-primary" style="width: 100%; justify-content: center;"><i class="ri-file-info-line"></i> Lihat Detail</button>' + 
                                    '</div>' + 
                                '</div>';
                                
                // Set text safely
                div.querySelector('img').alt = item.title;
                div.querySelector('.car-title').innerText = item.title;
                div.querySelector('.car-price-display').innerText = item.price || '';
                
                // Attach event listeners safely
                const openModalHandler = () => {
                    if (typeof openCarModal === 'function') {
                        openCarModal(item);
                    } else if (window.openCarModal) {
                        window.openCarModal(item);
                    }
                };
                
                div.querySelector('.car-img-wrapper').onclick = openModalHandler;
                div.querySelector('.car-title').onclick = openModalHandler;
                div.querySelector('button').onclick = openModalHandler;
                
                grid2.appendChild(div);
            });
        }
    }
}





// --- SUPABASE DYNAMIC BRAND FETCHER ---
async function fetchGlobalBrands() {
    if (typeof sbClient === 'undefined') return;
    
    const { data, error } = await sbClient.from('brands').select('*').order('created_at', { ascending: true });
    if (data && data.length > 0) {
        const track = document.querySelector('.brand-marquee-track');
        if (!track) return;
        
        track.innerHTML = ''; // Hapus brand statis lama
        
        // Loop 4 kali (Set 1 sampai Set 4) untuk efek infinite marquee
        for (let i = 1; i <= 4; i++) {
            // comment as Set indicator (optional)
            track.appendChild(document.createComment(' Set ' + i + ' '));
            
            data.forEach(item => {
                const img = document.createElement('img');
                img.src = item.logo_url;
                img.alt = item.name;
                track.appendChild(img);
            });
        }
    }
}














// Hamburger Menu Logic
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const themeToggleMobileMenu = document.getElementById('theme-toggle-mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileMenu.classList.contains('active')) {
                icon.classList.remove('ri-menu-3-line');
                icon.classList.add('ri-close-line');
            } else {
                icon.classList.remove('ri-close-line');
                icon.classList.add('ri-menu-3-line');
            }
        });
        
        // Close menu when clicking a link
        const mobileLinks = mobileMenu.querySelectorAll('.mobile-nav-links a, .mobile-nav-bottom a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                mobileMenuBtn.querySelector('i').classList.replace('ri-close-line', 'ri-menu-3-line');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (mobileMenu.classList.contains('active') && !mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenu.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon.classList.contains('ri-close-line')) {
                    icon.classList.replace('ri-close-line', 'ri-menu-3-line');
                }
            }
        });
    }
    
    // Theme toggle in mobile menu
    if (themeToggleMobileMenu) {
                themeToggleMobileMenu.addEventListener('click', () => {
            const body = document.documentElement;
            const isDark = body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            
            // Update icons
            const iconClass = isDark ? 'ri-sun-line' : 'ri-moon-line';
            themeToggleMobileMenu.querySelector('i').className = iconClass;
            
            const mainIcon = document.querySelector('#theme-toggle i');
            if (mainIcon) mainIcon.className = iconClass;
        });
    }
});



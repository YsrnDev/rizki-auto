document.addEventListener("DOMContentLoaded", function() {
    // --- Theme Toggle (Dark/Light Mode) ---
    const themeToggleBtns = document.querySelectorAll('#theme-toggle, #theme-toggle-mobile');
    const body = document.body;
    
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
    const nav = document.querySelector('.nav-container');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
});

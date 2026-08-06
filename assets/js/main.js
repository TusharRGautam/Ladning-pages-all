/**
 * Main JavaScript — Landing Page Interactions
 * Handles: Header scroll, mobile menu, form validation, API submission, smooth scroll
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    initHeaderScroll();
    initMobileMenu();
    initSmoothScroll();
    initLeadForm();
    initFaqAccordion();
    initScrollSpy();
    initOfferScrollPopup();
    initPricingTabs();
    initDownloadButtons();
    initVirtualTourPopup();
});

/* ============================================================
   PRICING TABS SWITCHER
   ============================================================ */
function initPricingTabs() {
    const tabs = document.querySelectorAll('.pricing-tab');
    if (!tabs.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show matching panel, hide others
            const target = tab.dataset.tab;
            document.querySelectorAll('.pricing-layout').forEach(panel => {
                if (panel.id === 'tab-' + target) {
                    panel.classList.remove('hidden');
                } else {
                    panel.classList.add('hidden');
                }
            });

            // Re-init lucide icons for newly shown panel
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    });
}


/* ============================================================
   HEADER SCROLL EFFECT
   ============================================================ */
function initHeaderScroll() {
    const header = document.getElementById('siteHeader');
    if (!header) return;

    let lastScroll = 0;
    const scrollThreshold = 10;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    }, { passive: true });
}

/* ============================================================
   MOBILE MENU
   ============================================================ */
function initMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const menu = document.getElementById('mobileMenu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        const isOpen = menu.classList.contains('open');
        menu.classList.toggle('open');
        toggle.classList.toggle('active');
        toggle.setAttribute('aria-expanded', !isOpen);
        document.body.classList.toggle('mobile-menu-open', !isOpen);
        document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    // Close menu on link click
    const mobileLinks = menu.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('open');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('mobile-menu-open');
            document.body.style.overflow = '';
        });
    });
}

/* ============================================================
   SMOOTH SCROLL FOR NAV LINKS
   ============================================================ */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();

            const headerHeight = document.getElementById('siteHeader')?.offsetHeight || 72;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Update active state
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

/* ============================================================
   LEAD FORM — VALIDATION & SUBMISSION
   ============================================================ */
function initLeadForm() {
    const form = document.getElementById('leadForm');
    if (!form) return;

    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('emailAddress');
    const phoneInput = document.getElementById('phoneNumber');
    const submitBtn = document.getElementById('btnSubmit');
    const formSuccess = document.getElementById('formSuccess');

    // Allow only numeric input in phone field
    phoneInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    });

    // Real-time validation clear on input
    fullNameInput.addEventListener('input', () => clearFieldError('nameError', fullNameInput));
    emailInput.addEventListener('input', () => clearFieldError('emailError', emailInput));
    phoneInput.addEventListener('input', () => clearFieldError('phoneError', phoneInput));

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate
        let isValid = true;

        // Name validation
        const name = fullNameInput.value.trim();
        if (!name || name.length < 2) {
            showFieldError('nameError', 'Please enter your full name', fullNameInput);
            isValid = false;
        }

        // Email validation (optional but must be valid if provided)
        const email = emailInput.value.trim();
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showFieldError('emailError', 'Please enter a valid email address', emailInput);
            isValid = false;
        }

        // Phone validation (Indian mobile: starts with 6-9, exactly 10 digits)
        const phone = phoneInput.value.trim();
        if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
            showFieldError('phoneError', 'Please enter a valid 10-digit mobile number', phoneInput);
            isValid = false;
        }

        if (!isValid) return;

        // Prepare lead data
        const leadData = {
            name: name,
            email: email || 'N/A',
            phone: cleanPhoneNumber(phone),
            source: 'Hero Form',
            page: window.location.href,
            timestamp: new Date().toISOString()
        };

        // Show loading state
        submitBtn.classList.add('loading');

        try {
            // Submit to API
            await submitLeadToAPI(leadData);

            // Show success
            formSuccess.classList.add('show');
            form.style.display = 'none';

        } catch (error) {
            console.error('API submission failed:', error);
            alert('Failed to submit. Please check your connection and try again.');
        } finally {
            submitBtn.classList.remove('loading');
        }
    });

    // Callback buttons trigger
    document.querySelectorAll('#btnCallback, .btn-callback').forEach(btn => {
        btn.addEventListener('click', () => {
            const formSection = document.getElementById('leadFormCard');
            if (formSection) {
                formSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Flash the form
                formSection.style.animation = 'none';
                formSection.offsetHeight; // trigger reflow
                formSection.style.animation = 'formFlash 0.6s ease';
            }
        });
    });

    // Price Sheet button trigger
    document.querySelectorAll('#btnPriceSheet, .btn-price-sheet').forEach(btn => {
        btn.addEventListener('click', () => {
            const formSection = document.getElementById('leadFormCard');
            if (formSection) {
                formSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });
}

/* ============================================================
   PHONE CLEANING UTILITY
   ============================================================ */
function cleanPhoneNumber(phone, defaultCountryCode = '+91') {
    // 1. Remove all non-numeric and non-plus characters
    let cleaned = phone.replace(/[^0-9\+]/g, '');
    // 2. Remove multiple '+' and keep only one at the start
    cleaned = cleaned.replace(/\++/g, '+');
    // 3. Prepend default country code if missing
    if (!cleaned.startsWith('+')) {
        if (cleaned.startsWith('91') && cleaned.length === 12) {
            cleaned = '+' + cleaned;
        } else {
            cleaned = defaultCountryCode + cleaned;
        }
    }
    return cleaned;
}

/* ============================================================
   API SUBMISSION
   ============================================================ */
async function submitLeadToAPI(leadData) {
    try {
        // Save lead locally in localStorage for backup/leads.html dashboard access
        const existingLeads = JSON.parse(localStorage.getItem('captured_leads') || '[]');
        
        existingLeads.push({
            name: leadData.name,
            phone: leadData.phone,
            email: leadData.email || 'N/A',
            source: leadData.source || 'Website Form',
            timestamp: leadData.timestamp || new Date().toISOString()
        });
        
        localStorage.setItem('captured_leads', JSON.stringify(existingLeads));
        console.log('Lead successfully saved locally:', leadData);
        return true;
    } catch (error) {
        console.error('Failed to save lead locally:', error);
        throw error;
    }
}



/* ============================================================
   FORM ERROR HELPERS
   ============================================================ */
function showFieldError(errorId, message, inputEl) {
    const errorSpan = document.getElementById(errorId);
    if (errorSpan) {
        errorSpan.textContent = message;
        errorSpan.classList.add('visible');
    }
    if (inputEl) {
        inputEl.closest('.input-wrapper')?.classList.add('error');
    }
}

function clearFieldError(errorId, inputEl) {
    const errorSpan = document.getElementById(errorId);
    if (errorSpan) {
        errorSpan.textContent = '';
        errorSpan.classList.remove('visible');
    }
    if (inputEl) {
        inputEl.closest('.input-wrapper')?.classList.remove('error');
    }
}

/* ============================================================
   CSS ANIMATION INJECTION (for form flash effect)
   ============================================================ */
const style = document.createElement('style');
style.textContent = `
    @keyframes formFlash {
        0%, 100% { box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        50% { box-shadow: 0 20px 60px rgba(212,168,83,0.4), 0 0 0 3px rgba(212,168,83,0.3); }
    }
`;
document.head.appendChild(style);

/* ============================================================
   FLOOR PLAN TABS
   ============================================================ */
function initFloorPlanTabs() {
    const tabs = document.querySelectorAll('.fp-tab');
    if (!tabs.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.tab;

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show target panel
            document.querySelectorAll('.fp-panel').forEach(panel => {
                panel.classList.remove('active');
            });
            const targetPanel = document.getElementById('fp-' + targetId);
            if (targetPanel) {
                targetPanel.classList.add('active');
                // Re-init icons inside the panel
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        });
    });
}

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
function initFaqAccordion() {
    const questions = document.querySelectorAll('.faq-question');
    if (!questions.length) return;

    questions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.closest('.faq-item');
            const isOpen = item.classList.contains('open');

            // Close all others
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

            // Toggle current
            if (!isOpen) {
                item.classList.add('open');
                question.setAttribute('aria-expanded', 'true');
            } else {
                question.setAttribute('aria-expanded', 'false');
            }
        });
    });
}

/* ============================================================
   CTA BUTTONS — Trigger Modal Popup with custom context
   ============================================================ */


/* ============================================================
   SCROLL SPY — Update Active Nav Link
   ============================================================ */
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        rootMargin: '-40% 0px -60% 0px',
        threshold: 0
    });

    sections.forEach(section => observer.observe(section));
}

/* ============================================================
   SCROLL OFFER POPUP — fires after scrolling 40% of page
   and again every 3 sections scrolled past
   ============================================================ */
function initOfferScrollPopup() {
    const popup = document.getElementById('offerPopup');
    const closeBtn = document.getElementById('offerPopupClose');
    const form = document.getElementById('offerPopupForm');
    const successEl = document.getElementById('offerSuccess');

    if (!popup) return;

    // Sections to watch (popup triggers when user passes each)
    const triggerSections = ['#pricing', '#plans', '#amenities', '#connectivity'];
    let triggeredSections = new Set();
    let popupSubmitted = false;

    // Close handlers
    closeBtn.addEventListener('click', () => popup.classList.remove('open'));
    popup.addEventListener('click', (e) => { if (e.target === popup) popup.classList.remove('open'); });

    // Initialise Lucide inside popup
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Form submit
    const phoneInput = document.getElementById('offerPhone');
    const nameInput  = document.getElementById('offerName');

    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name  = nameInput.value.trim();
            const email = document.getElementById('offerEmail').value.trim();
            const phone = phoneInput.value.trim();

            let valid = true;

            if (!name || name.length < 2) {
                showFieldError('offerNameError', 'Please enter your name', nameInput);
                valid = false;
            }
            if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
                showFieldError('offerPhoneError', 'Please enter a valid 10-digit mobile number', phoneInput);
                valid = false;
            }

            if (!valid) return;

            const leadData = {
                name, email: email || 'N/A', phone: cleanPhoneNumber(phone),
                source: 'Scroll Popup - Best Offers',
                page: window.location.href,
                timestamp: new Date().toISOString()
            };

            try {
                await submitLeadToAPI(leadData);
                form.style.display = 'none';
                successEl.classList.add('show');
                popupSubmitted = true;
                setTimeout(() => popup.classList.remove('open'), 3000);
            } catch (error) {
                console.error('API submission failed:', error);
                alert('Failed to submit. Please check your connection and try again.');
            }
        });
    }

    // Flag to ensure chatbot opens together ONLY on the very first scroll trigger
    let chatbotAutoOpenedOnScroll = false;

    // Expose globally so download buttons trigger ONLY the offer popup
    window.openOfferPopup = function openOfferPopup() {
        if (popupSubmitted) return;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        popup.classList.add('open');
    };

    // IntersectionObserver: triggers on each key section
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = '#' + entry.target.id;
            if (entry.isIntersecting && !triggeredSections.has(id)) {
                triggeredSections.add(id);
                // Open popup after 1st, 3rd, 5th section triggers
                if ([...triggeredSections].length % 2 === 1) {
                    setTimeout(() => {
                        window.openOfferPopup();
                        // Open chatbot ONLY ONCE on the initial scroll trigger
                        if (!chatbotAutoOpenedOnScroll) {
                            chatbotAutoOpenedOnScroll = true;
                            if (typeof window.openChatbot === 'function') {
                                window.openChatbot();
                            }
                        }
                    }, 800);
                }
            }
        });
    }, { threshold: 0.35 });

    triggerSections.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) observer.observe(el);
    });
}

/* ============================================================
   DOWNLOAD BUTTONS — Open "Register Here" offer popup on click
   ============================================================ */
function initDownloadButtons() {
    // All download / action button selectors
    const downloadSelectors = [
        '.btn-amenities-download',   // Download Amenities (top & bottom)
        '.btn-gallery-download',     // Download Gallery (top & bottom)
        '.btn-brochure-download',    // Download Brochure (hero, welcome, section, floating)
        '.floating-brochure-btn',    // Floating bottom-left brochure button
        '.btn-fp-download',          // Floor Plan PDF downloads
        '.masterplan-download-btn',  // Master Plan download
        '.btn-price-sheet',          // Header & mobile Price Sheet
        '#btnPriceSheet',            // Header Price Sheet (by id)
        '.btn-table-cta',            // Pricing table EOI CTA
        '.btn-price-breakup',        // Pricing table Price Breakup
        '.btn-download-costing',     // Download Costing Details
        '.btn-get-directions',       // Get Directions (location section)
        '.btn-location-cta',         // Location map CTA
        '.btn-callback',             // Instant Callback
        '#btnCallback'               // Instant Callback (by id)
    ];

    const selector = downloadSelectors.join(', ');

    document.querySelectorAll(selector).forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof window.openOfferPopup === 'function') {
                window.openOfferPopup();
            }
        });
    });
}

/* ============================================================
   VIRTUAL TOUR — Open existing offer popup on play click
   ============================================================ */
function initVirtualTourPopup() {
    const playBtn = document.getElementById('vtPlayBtn');
    const bannerWrapper = document.getElementById('vtBannerWrapper');

    function openVT() {
        if (typeof window.openOfferPopup === 'function') {
            window.openOfferPopup();
        }
    }

    if (playBtn) playBtn.addEventListener('click', (e) => { e.stopPropagation(); openVT(); });
    if (bannerWrapper) bannerWrapper.addEventListener('click', openVT);
}

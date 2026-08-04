// Interactive Script for Real Estate Landing Page
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    }

    // 2. Smooth Navigation Scroll & Active Link Switching
    const navLinks = document.querySelectorAll('.nav-link, a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#brochure') {
                e.preventDefault();
                showPopupModal();
                return;
            }
            if (href && href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    const headerOffset = 74;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }

            // Update active link styling
            if (this.classList.contains('nav-link')) {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }

            // Close mobile menu on click
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                if (mobileToggle) {
                    const icon = mobileToggle.querySelector('i');
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            }
        });
    });

    // 3. Scroll Header Shadow Effect
    const siteHeader = document.getElementById('siteHeader');
    window.addEventListener('scroll', () => {
        if (siteHeader) {
            if (window.scrollY > 20) {
                siteHeader.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            } else {
                siteHeader.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.06)';
            }
        }
    });

    // 4. Scrollspy: Highlight active header link based on current scroll position
    const sections = document.querySelectorAll('section[id]');
    const headerNavLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        const headerOffset = 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerOffset;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        if (scrollPosition < 120) {
            currentSectionId = 'home';
        }

        if (currentSectionId) {
            headerNavLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });

    // 5. Global Listener: Open Lead Popup Modal for all Download & Inquiry buttons across the page
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button, a, .floor-plan-card, .gallery-card, .virtual-tour-card, .location-map-card');
        if (btn) {
            const text = (btn.innerText || '').toLowerCase();
            const href = btn.getAttribute('href') || '';
            const onclickAttr = btn.getAttribute('onclick') || '';

            // Ignore phone call links, external pages, mobile toggle, or modal buttons
            if (href.startsWith('tel:') || href.includes('.html') || btn.classList.contains('btn-back-home') || btn.classList.contains('mobile-menu-toggle') || btn.classList.contains('popup-close-btn') || btn.classList.contains('btn-popup-submit')) {
                return;
            }

            if (text.includes('download') || text.includes('brochure') || text.includes('price') || text.includes('breakup') || text.includes('eoi') || text.includes('directions') || text.includes('virtual') || text.includes('chat') || text.includes('enquire') || text.includes('inquiry') || onclickAttr.includes('openModal') || href === '#brochure') {
                e.preventDefault();
                showPopupModal();
            }
        }
    });

    // 6. Initialize Auto Lead Popup Modal
    initPopupModal();
});

/* ==========================================
   POPUP MODAL LOGIC (Scroll & Intermittent)
   ========================================== */
let hasPopupShown = false;

function initPopupModal() {
    // Inject popup HTML into DOM if not present
    if (!document.getElementById('leadPopupOverlay')) {
        const popupHTML = `
        <div id="leadPopupOverlay" class="lead-popup-overlay">
            <div class="lead-popup-modal">
                <button class="popup-close-btn" onclick="closePopupModal()">&times;</button>
                <div class="popup-modal-grid">
                    <!-- Left Promise Column -->
                    <div class="popup-left-panel">
                        <div class="popup-logo-space">
                            <div class="logo-placeholder">
                                <span class="placeholder-badge">[LOGO PLACEHOLDER]</span>
                            </div>
                        </div>
                        <h3 class="popup-promise-title">We Promise</h3>
                        <div class="popup-promise-list">
                            <div class="promise-item">
                                <div class="promise-icon-box"><i class="fa-solid fa-headset"></i></div>
                                <div class="promise-text">Instant Call Back</div>
                            </div>
                            <div class="promise-item">
                                <div class="promise-icon-box"><i class="fa-solid fa-car"></i></div>
                                <div class="promise-text">Free Site Visit</div>
                            </div>
                            <div class="promise-item">
                                <div class="promise-icon-box"><i class="fa-solid fa-indian-rupee-sign"></i></div>
                                <div class="promise-text">Unmatched Price</div>
                            </div>
                        </div>
                    </div>
                    <!-- Right Lead Form Column -->
                    <div class="popup-right-panel">
                        <h3 class="popup-form-title">Register Here And Avail The <span class="highlight-red">Best Offers!!</span></h3>
                        <form class="popup-lead-form" onsubmit="handlePopupSubmit(event)">
                            <input type="text" class="popup-input-field" placeholder="Name" required>
                            <input type="email" class="popup-input-field" placeholder="Email Address(Optional)">
                            <div class="popup-phone-row">
                                <select class="popup-country-select">
                                    <option>India (+91)</option>
                                </select>
                                <input type="tel" class="popup-input-field popup-phone-input" placeholder="Phone number" required>
                            </div>
                            <button type="submit" class="btn-popup-submit">Get Instant Call Back</button>
                        </form>
                    </div>
                </div>
                <!-- Bottom Phone Call Strip -->
                <div class="popup-bottom-bar">
                    <a href="tel:+91XXXXXXXXXX" class="popup-phone-link">
                        <i class="fa-solid fa-phone"></i> +91 XXXXXXXXXX
                    </a>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', popupHTML);
    }

    // Trigger 1: Show after 4 seconds on page load
    setTimeout(() => {
        if (!hasPopupShown) {
            showPopupModal();
        }
    }, 4000);

    // Trigger 2: Show on scroll down (>= 250px)
    window.addEventListener('scroll', handleScrollTrigger);

    // Trigger 3: Intermittent repeat popup every 45 seconds
    setInterval(() => {
        const overlay = document.getElementById('leadPopupOverlay');
        if (overlay && !overlay.classList.contains('active')) {
            showPopupModal();
        }
    }, 45000);

    // Close on overlay backdrop click
    const overlay = document.getElementById('leadPopupOverlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closePopupModal();
            }
        });
    }
}

function handleScrollTrigger() {
    if (!hasPopupShown && window.scrollY >= 250) {
        showPopupModal();
        window.removeEventListener('scroll', handleScrollTrigger);
    }
}

const defaultPopupFormHTML = `
    <h3 class="popup-form-title">Register Here And Avail The <span class="highlight-red">Best Offers!!</span></h3>
    <form class="popup-lead-form" onsubmit="handlePopupSubmit(event)">
        <input type="text" class="popup-input-field" placeholder="Name" required>
        <input type="email" class="popup-input-field" placeholder="Email Address(Optional)">
        <div class="popup-phone-row">
            <select class="popup-country-select">
                <option>India (+91)</option>
            </select>
            <input type="tel" class="popup-input-field popup-phone-input" placeholder="Phone number" required>
        </div>
        <button type="submit" class="btn-popup-submit">Get Instant Call Back</button>
    </form>`;

function showPopupModal() {
    const overlay = document.getElementById('leadPopupOverlay');
    const rightPanel = document.querySelector('.popup-right-panel');
    
    // Reset right panel to form state if needed
    if (rightPanel && rightPanel.querySelector('.popup-success-content')) {
        rightPanel.innerHTML = defaultPopupFormHTML;
    }

    if (overlay) {
        overlay.classList.add('active');
        hasPopupShown = true;
    }
}

function closePopupModal() {
    const overlay = document.getElementById('leadPopupOverlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

function openModal(type) {
    showPopupModal();
}

// Popup Form Submit Handler
function handlePopupSubmit(event) {
    event.preventDefault();
    const rightPanel = document.querySelector('.popup-right-panel');
    if (rightPanel) {
        rightPanel.innerHTML = `
            <div class="popup-success-content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px 10px; animation: fadeInSuccess 0.4s ease forwards;">
                <div style="width: 58px; height: 58px; border-radius: 50%; background-color: #f0fdf4; border: 2px solid #bbf7d0; display: flex; align-items: center; justify-content: center; margin-bottom: 14px;">
                    <i class="fa-solid fa-circle-check" style="font-size: 34px; color: #16a34a;"></i>
                </div>
                <h3 style="font-size: 19px; font-weight: 800; color: #0f172a; margin-bottom: 8px; letter-spacing: -0.2px;">Registered Successfully!</h3>
                <p style="font-size: 13px; line-height: 1.6; color: #475569; margin: 0;">Thank you for your interest. Our expert sales team will get back to you shortly.</p>
            </div>
        `;
    }
    setTimeout(() => {
        closePopupModal();
    }, 4000);
}

// Read More Toggle Handler
function toggleReadMore(element) {
    if (element.innerText === 'Read more') {
        element.innerText = 'Read less';
    } else {
        element.innerText = 'Read more';
    }
}

// Sticky Sidebar Lead Form Submit Handler
function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formTitle = document.querySelector('.hero-right-form .form-title');
    const titleUnderline = document.querySelector('.hero-right-form .title-underline');
    const successBox = document.getElementById('sidebarSuccessMsg');
    
    if (form) {
        form.style.display = 'none';
    }
    if (formTitle) formTitle.style.display = 'none';
    if (titleUnderline) titleUnderline.style.display = 'none';
    
    if (successBox) {
        successBox.style.display = 'flex';
    }
}

// Amenities Slide Animation Helper
function slideAmenities(direction) {
    const grid = document.querySelector('.amenities-grid');
    if (grid) {
        grid.style.transition = 'transform 0.3s ease';
        if (direction === 'right') {
            grid.style.transform = 'translateX(-10px)';
            setTimeout(() => grid.style.transform = 'translateX(0)', 300);
        } else {
            grid.style.transform = 'translateX(10px)';
            setTimeout(() => grid.style.transform = 'translateX(0)', 300);
        }
    }
}

/* ==========================================
   PRIYA SHARMA CHATBOT WIDGET
   ========================================== */
(function initChatbot() {
    const popup       = document.getElementById('chatbotPopup');
    const avatar      = document.getElementById('chatbotAvatar');
    const closeBtn    = document.getElementById('chatbotPopupClose');
    const openBtn     = document.getElementById('chatbotOpenBtn');
    const greeting    = document.getElementById('chatbotGreeting');

    const chatWindow   = document.getElementById('chatbotWindow');
    const cwCloseBtn   = document.getElementById('cwCloseBtn');
    const cwMessages   = document.getElementById('cwMessages');
    const cwQuickReplies = document.getElementById('cwQuickReplies');
    const cwContactForm = document.getElementById('cwContactForm');
    const cwThankyou   = document.getElementById('cwThankyou');
    const cwInputArea  = document.getElementById('cwInputArea');
    const cwUserText   = document.getElementById('cwUserText');
    const cwSendBtn    = document.getElementById('cwSendBtn');

    const cwNameInput  = document.getElementById('cwName');
    const cwPhoneInput = document.getElementById('cwPhone');
    const cwSubmitBtn  = document.getElementById('cwSubmitBtn');

    if (!popup || !avatar || !greeting || !chatWindow) return;

    // Cycling teaser messages shown in the small popup bubble
    const messages = [
        '"Hey, I\'m Priya Sharma!"',
        '"Looking for your dream home? 🏠"',
        '"Get exclusive launch pricing! 💰"',
        '"Book a free site visit today! 📅"',
        '"Let me help you choose the best unit!"',
    ];
    let msgIndex = 0;
    let msgInterval = null;

    function cycleMessage() {
        greeting.style.opacity = '0';
        setTimeout(() => {
            msgIndex = (msgIndex + 1) % messages.length;
            greeting.textContent = messages[msgIndex];
            greeting.style.opacity = '1';
        }, 350);
    }

    function startCycling() {
        if (msgInterval) return;
        msgInterval = setInterval(cycleMessage, 4500);
    }

    function stopCycling() {
        clearInterval(msgInterval);
        msgInterval = null;
    }

    // Teaser Popup functions
    function showTeaserPopup() {
        if (chatWindow.style.display === 'flex') return;
        popup.style.display = 'block';
        popup.classList.remove('hidden');
        startCycling();
    }

    function hideTeaserPopup() {
        popup.classList.add('hidden');
        stopCycling();
        setTimeout(() => {
            popup.style.display = 'none';
            popup.classList.remove('hidden');
        }, 320);
    }

    // Predefined Q&A answers
    const chatbotDatabase = {
        'pricing': {
            reply: 'Our luxury residences start from ₹ XX.XX Cr* onwards. Exclusive bookings benefits include flexible 20:80 Payment plans and special launch spot discounts.'
        },
        'brochure': {
            reply: 'The official e-brochure contains complete layout designs, high-res views of specifications, and amenity detail mappings.'
        },
        'quote': {
            reply: 'Sure! I will connect you with a financial officer to calculate exact stamp duty, registration charges, tax rules, and ongoing floor rise premiums.'
        },
        'site_visit': {
            reply: 'Excellent choice! We offer free premium air-conditioned cab pickup and drop service from anywhere in the city for a guided site tour.'
        },
        'whatsapp': {
            reply: 'I can instantly send all pricing charts, carpet area calculations, layouts, and site maps to your WhatsApp number.'
        },
        'callback': {
            reply: 'Our dedicated sales team is ready to answer any questions about the builder, RERA approvals, or booking schedules.'
        }
    };

    // Chat Window Helpers
    function getCurrentTime() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // 12 instead of 0
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${minutes} ${ampm}`;
    }

    function appendMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `cw-msg ${sender}`;
        
        msgDiv.innerHTML = `
            <div class="cw-msg-text">${text}</div>
            <div class="cw-msg-time">${getCurrentTime()}</div>
        `;
        cwMessages.appendChild(msgDiv);
        cwMessages.scrollTop = cwMessages.scrollHeight;
    }

    function showTypingIndicator() {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'cw-msg bot cw-msg-typing';
        msgDiv.innerHTML = `
            <div class="cw-msg-text">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        cwMessages.appendChild(msgDiv);
        cwMessages.scrollTop = cwMessages.scrollHeight;
        return msgDiv;
    }

    // Load Quick Reply Chips
    function loadQuickReplies() {
        cwQuickReplies.innerHTML = '';
        cwQuickReplies.style.display = 'flex';
        
        const options = [
            { text: 'Pricing & Floor Plans 💸', key: 'pricing' },
            { text: 'Download Brochure ⬇️', key: 'brochure' },
            { text: 'Get The Best Quote 💰', key: 'quote' },
            { text: 'Site Visit Or Virtual Tour 🚁', key: 'site_visit' },
            { text: 'Pricing on Whatsapp ✅', key: 'whatsapp' },
            { text: 'Get A Call Back 📞', key: 'callback' }
        ];

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'cw-reply-chip';
            btn.innerHTML = `${opt.text} <i class="fa-solid fa-chevron-right"></i>`;
            btn.addEventListener('click', () => handleOptionSelection(opt.text, opt.key));
            cwQuickReplies.appendChild(btn);
        });
    }

    // Handle Predefined Option Selection
    function handleOptionSelection(text, key) {
        // Hide Quick Replies
        cwQuickReplies.style.display = 'none';

        // Append user's selection message
        appendMessage('user', text);

        // Show bot typing indicator
        const typing = showTypingIndicator();

        setTimeout(() => {
            // Remove typing indicator and show answer
            typing.remove();
            const data = chatbotDatabase[key];
            appendMessage('bot', data.reply);

            // Show typing indicator again to prompt for lead info
            const typing2 = showTypingIndicator();

            setTimeout(() => {
                typing2.remove();
                appendMessage('bot', 'Please provide your name and mobile number below to proceed.');
                // Show Contact Form
                cwContactForm.style.display = 'flex';
            }, 1000);

        }, 1200);
    }

    // Initialize full chat session
    let isChatInitialized = false;

    function openChatWindow() {
        hideTeaserPopup();
        chatWindow.style.display = 'flex';

        if (!isChatInitialized) {
            isChatInitialized = true;
            // Clear message log
            cwMessages.innerHTML = '';
            cwContactForm.style.display = 'none';
            cwThankyou.style.display = 'none';
            cwInputArea.style.display = 'flex';

            // Show initial welcome message
            const typing = showTypingIndicator();
            setTimeout(() => {
                typing.remove();
                appendMessage('bot', "Hey, I'm Priya Sharma ! How can I help you understand this project?");
                loadQuickReplies();
            }, 800);
        }
    }

    function closeChatWindow() {
        chatWindow.style.display = 'none';
        // Reset state so next open starts fresh if finished or keeps chat history
    }

    // Toggle Chat Window or Teaser on main avatar click
    avatar.addEventListener('click', () => {
        if (chatWindow.style.display === 'flex') {
            closeChatWindow();
        } else {
            openChatWindow();
        }
    });

    // Close button on Chat Window header
    if (cwCloseBtn) {
        cwCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeChatWindow();
        });
    }

    // Teaser popup trigger buttons
    if (openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openChatWindow();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            hideTeaserPopup();
        });
    }

    // Handle Write a Reply Custom Text
    function handleCustomTextSubmit() {
        const text = cwUserText.value.trim();
        if (!text) return;

        cwUserText.value = '';
        appendMessage('user', text);
        
        // Hide Quick Replies if they are currently visible
        cwQuickReplies.style.display = 'none';

        const typing = showTypingIndicator();
        setTimeout(() => {
            typing.remove();
            appendMessage('bot', 'Sure! I can help you with that. Please enter your contact details below so I can share all details.');
            
            // Show Contact Form
            cwContactForm.style.display = 'flex';
        }, 1200);
    }

    if (cwSendBtn) {
        cwSendBtn.addEventListener('click', handleCustomTextSubmit);
    }

    if (cwUserText) {
        cwUserText.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleCustomTextSubmit();
            }
        });
    }

    // Handle Contact Form Submission inside Chat
    if (cwSubmitBtn) {
        cwSubmitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const name = cwNameInput.value.trim();
            const phone = cwPhoneInput.value.trim();

            if (!name || !phone) {
                alert('Please fill out all required fields.');
                return;
            }

            // Hide Contact Form
            cwContactForm.style.display = 'none';

            // Show typing indicator before thank you
            const typing = showTypingIndicator();

            setTimeout(() => {
                typing.remove();
                
                // Hide custom input area
                cwInputArea.style.display = 'none';
                
                // Show Thank You Panel
                cwThankyou.style.display = 'block';
                cwMessages.scrollTop = cwMessages.scrollHeight;

                // Log lead data to console/localStorage for integration
                const leadData = {
                    name: name,
                    phone: phone,
                    source: 'Priya Sharma Chatbot',
                    timestamp: new Date().toISOString()
                };
                console.log('New Lead Captured from Chatbot:', leadData);
                
                // Store in local storage
                let chatbotLeads = JSON.parse(localStorage.getItem('chatbot_leads') || '[]');
                chatbotLeads.push(leadData);
                localStorage.setItem('chatbot_leads', JSON.stringify(chatbotLeads));

            }, 1000);
        });
    }

    // Auto-show teaser popup after 3 seconds on page load
    popup.style.display = 'none';
    setTimeout(showTeaserPopup, 3000);

})();


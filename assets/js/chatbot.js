/**
 * Automated Real Estate Chatbot — Mahindra Sanctum
 * Agent: Priya Shetty | Auto-opens 3 seconds after page load
 */

document.addEventListener('DOMContentLoaded', () => {
    initChatbot();
});

function initChatbot() {

    /* ============================================================
       1. BUILD & INJECT CHATBOT HTML
       ============================================================ */
    const chatbotHTML = `
        <div class="chatbot-widget" id="chatbotWidget">

            <!-- Intro greeting bubble (shown before opening) -->
            <div class="chatbot-greeting-bubble" id="chatGreeting">
                <span class="greeting-text">“Hey, I'm Shreya Shetty!“ <strong>How can I help you?</strong></span>
                <div class="greeting-btn-row">
                    <button class="greeting-cta-btn" id="greetingOpenBtn">Let's Chat</button>
                </div>
                <button class="greeting-dismiss" id="greetingDismiss">✕</button>
            </div>

            <!-- Chatbot Toggle Bubble Container -->
            <div class="chatbot-toggle-bubble" id="chatbotBubble" title="Chat with Shreya">
                <img src="img/priya_shetty.webp" alt="Shreya Shetty" class="priya-bubble-img">
                <span class="chat-toggle-close-icon">✕</span>
            </div>
            <span class="chatbot-notification-dot" id="chatNotification"></span>

            <!-- Chat Window -->
            <div class="chatbot-window" id="chatbotWindow">
                <!-- Header -->
                <div class="chat-header">
                    <div class="chat-header-info">
                        <img src="img/priya_shetty.webp" alt="Shreya Shetty" class="chatbot-avatar-img">
                        <div class="chat-header-title">
                            <h4>Shreya Shetty</h4>
                            <span class="chat-status">
                                <span class="chat-status-dot"></span>
                                Online
                            </span>
                        </div>
                    </div>
                    <button class="btn-chat-close" id="chatCloseBtn" aria-label="Close Chat">
                        ✕
                    </button>
                </div>

                <!-- Chat Body (Messages) -->
                <div class="chat-body" id="chatBody"></div>

                <!-- Quick Options Area -->
                <div class="chat-options" id="chatOptions"></div>

                <!-- Chat Input Form -->
                <form class="chat-input-form" id="chatInputForm" style="display: none;">
                    <div class="chat-input-wrapper">
                        <select class="chat-country-select" id="chatCountrySelect" style="display: none;">
                            <option value="+91">🇮🇳 +91</option>
                            <option value="+63">🇵🇭 +63</option>
                            <option value="+61">🇦🇺 +61</option>
                            <option value="+1">🇺🇸 +1</option>
                            <option value="+971">🇦🇪 +971</option>
                            <option value="+44">🇬🇧 +44</option>
                            <option value="+974">🇶🇦 +974</option>
                            <option value="+966">🇸🇦 +966</option>
                        </select>
                        <input type="text" class="chat-input" id="chatInput" placeholder="Type your response here..." required autocomplete="off">
                    </div>
                    <button type="submit" class="btn-chat-send" aria-label="Send">
                        <i data-lucide="send"></i>
                    </button>
                </form>
            </div>
        </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = chatbotHTML;
    document.body.appendChild(wrapper.firstElementChild);

    // Inject Lucide icons after DOM append
    if (typeof lucide !== 'undefined') lucide.createIcons();

    /* ============================================================
       2. ELEMENT REFERENCES
       ============================================================ */
    const bubble       = document.getElementById('chatbotBubble');
    const windowEl     = document.getElementById('chatbotWindow');
    const closeBtn     = document.getElementById('chatCloseBtn');
    const chatBody     = document.getElementById('chatBody');
    const chatOptions  = document.getElementById('chatOptions');
    const chatInputForm = document.getElementById('chatInputForm');
    const chatInput    = document.getElementById('chatInput');
    const notification = document.getElementById('chatNotification');
    const greeting     = document.getElementById('chatGreeting');
    const greetingOpen = document.getElementById('greetingOpenBtn');
    const greetingDismiss = document.getElementById('greetingDismiss');

    /* ============================================================
       3. STATE
       ============================================================ */
    let currentStep = 'welcome';
    let leadData = { name: '', phone: '', email: 'N/A', source: 'Chatbot', page: window.location.href, timestamp: '' };
    let lastUserSelection = '';
    let greetingShown = false;

    /* ============================================================
       4. AUTO-OPEN CHAT WINDOW AFTER 3 SECONDS
       ============================================================ */
    setTimeout(() => {
        if (!windowEl.classList.contains('open')) {
            showGreeting();
        }
    }, 3000);

    function showGreeting() {
        greetingShown = true;
        greeting.classList.add('visible');
        notification.style.display = 'none';
    }


    /* ============================================================
       5. GREETING POPUP CONTROLS
       ============================================================ */
    greetingOpen.addEventListener('click', () => {
        greeting.classList.remove('visible');
        openChatWindow();
    });

    greetingDismiss.addEventListener('click', () => {
        greeting.classList.remove('visible');
    });

    // Dynamic numeric restriction on phone field & placeholder toggle on country code select
    chatInput.addEventListener('input', (e) => {
        if (currentStep === 'get_phone') {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        }
    });

    const countrySelect = document.getElementById('chatCountrySelect');
    if (countrySelect) {
        countrySelect.addEventListener('change', () => {
            if (countrySelect.value === '+91') {
                chatInput.placeholder = "Mobile Number (e.g. 9876543210)";
                chatInput.maxLength = 10;
                chatInput.value = chatInput.value.slice(0, 10);
            } else {
                chatInput.placeholder = "Mobile Number";
                chatInput.maxLength = 12;
            }
            chatInput.focus();
        });
    }

    /* ============================================================
       6. BUBBLE CLICK — TOGGLE WINDOW
       ============================================================ */
    bubble.addEventListener('click', () => {
        if (windowEl.classList.contains('open')) {
            closeChatWindow();
        } else {
            greeting.classList.remove('visible');
            openChatWindow();
        }
    });

    closeBtn.addEventListener('click', closeChatWindow);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeChatWindow();
    });

    function openChatWindow() {
        windowEl.classList.add('open');
        bubble.classList.add('open');
        notification.style.display = 'none';
        if (chatBody.children.length === 0) triggerWelcomeFlow();
    }

    function closeChatWindow() {
        windowEl.classList.remove('open');
        bubble.classList.remove('open');
    }

    // Expose globally so scroll triggers can open chatbot automatically
    window.openChatbot = function openChatbot() {
        if (greeting) greeting.classList.remove('visible');
        openChatWindow();
    };


    /* ============================================================
       7. CONVERSATION ENGINE
       ============================================================ */
    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${sender}`;
        msgDiv.innerHTML = text.replace(/\n/g, '<br>');
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function showQuickOptions(optionsList) {
        chatOptions.innerHTML = '';
        chatInputForm.style.display = 'none';
        chatOptions.style.display = 'flex';
        optionsList.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'btn-chat-option';
            btn.textContent = opt.text;
            btn.addEventListener('click', () => handleUserResponse(opt.text, opt.value));
            chatOptions.appendChild(btn);
        });
    }

    function showTextInput(placeholder, mode = 'text') {
        const countrySelect = document.getElementById('chatCountrySelect');
        chatOptions.style.display = 'none';
        chatInputForm.style.display = 'flex';
        chatInput.placeholder = placeholder;
        chatInput.value = '';
        chatInput.type = mode === 'numeric' ? 'tel' : 'text';
        chatInput.inputMode = mode === 'numeric' ? 'numeric' : 'text';
        if (mode === 'numeric') {
            if (countrySelect) {
                countrySelect.style.display = 'block';
                countrySelect.value = '+91';
            }
            chatInput.placeholder = "Mobile Number (e.g. 9876543210)";
            chatInput.maxLength = 10;
        } else {
            if (countrySelect) countrySelect.style.display = 'none';
            chatInput.removeAttribute('maxLength');
        }
        setTimeout(() => chatInput.focus(), 100);
    }

    function triggerWelcomeFlow() {
        addMessage("Hey, I'm Shreya Shetty! How can i help you understand this project?", 'bot');
        setTimeout(() => {
            showMainMenu();
        }, 600);
    }

    function showMainMenu() {
        currentStep = 'menu';
        showQuickOptions([
            { text: 'Pricing & Floor Plans 💸💸', value: 'pricing' },
            { text: 'Download Brochure ⬇️', value: 'brochure' },
            { text: 'Get The Best Quote 💰', value: 'quote' },
            { text: 'Site Visit Or Virtual Tour 🚁', value: 'sitevisit' },
            { text: 'Pricing on Whatsapp ✅', value: 'whatsapp' },
            { text: 'Get A Call Back 📞', value: 'callback' }
        ]);
    }


    function handleUserResponse(userText, value) {
        addMessage(userText, 'user');
        setTimeout(() => {
            switch (value) {
                case 'pricing':
                    lastUserSelection = 'Pricing Info';
                    addMessage(
                        "Here's the launch pricing for Mahindra Sanctum:\n\n" +
                        "📋 <b>CLP (Construction Linked Plan)</b>\n" +
                        "• 2 BHK Premium (738–743 sq.ft) — <b>₹1.07 Cr*</b>\n" +
                        "• 2 BHK Luxury (834–838 sq.ft) — <b>₹1.27 Cr*</b>\n" +
                        "• 3 BHK (1085–1094 sq.ft) — <b>₹1.57 Cr*</b>\n\n" +
                        "💰 <b>20:80 Payment Plan</b>\n" +
                        "• 2 BHK Premium — <b>₹1.20–1.31 Cr*</b>\n" +
                        "• 2 BHK Luxury — <b>₹1.43–1.55 Cr*</b>\n" +
                        "• 3 BHK — <b>₹1.77–1.91 Cr*</b>\n\n" +
                        "EOI Amount: ₹1,00,000/- | Starts 05 June 2026\n\nWant the detailed Cost Sheet?",
                        'bot'
                    );
                    showQuickOptions([
                        { text: '📥 Get Detailed Cost Sheet', value: 'capture_lead' },
                        { text: '🔙 Back to Menu', value: 'main_menu' }
                    ]);
                    break;
                case 'brochure':
                    lastUserSelection = 'Brochure Download';
                    addMessage("Sure! I can send you the official brochure. May I have your mobile number to send it?", 'bot');
                    askForPhone();
                    break;
                case 'quote':
                    lastUserSelection = 'Get Quote';
                    addMessage("I can share the best launch quote with you. May I have your name?", 'bot');
                    askForName();
                    break;
                case 'sitevisit':
                    lastUserSelection = 'Site Visit / Virtual Tour';
                    addMessage("Excellent choice! We arrange a complimentary cab pickup for site visits, or can send the virtual tour links. May I have your mobile number?", 'bot');
                    askForPhone();
                    break;
                case 'whatsapp':
                    lastUserSelection = 'Pricing on Whatsapp';
                    addMessage("We will send the pricing booklet directly to your WhatsApp. Please share your WhatsApp number.", 'bot');
                    askForPhone();
                    break;
                case 'callback':
                    lastUserSelection = 'Instant Callback Request';
                    addMessage("Sure! I'll arrange an instant callback from our sales team. May I have your mobile number?", 'bot');
                    askForPhone();
                    break;
                case 'capture_lead':
                    askForPhone();
                    break;
                case 'main_menu':
                    triggerWelcomeFlow();
                    break;
            }
        }, 700);
    }

    function askForPhone() {
        currentStep = 'get_phone';
        addMessage("Please share your <b>mobile number</b>:", 'bot');
        showTextInput("Mobile Number", 'numeric');
    }

    function askForName() {
        currentStep = 'get_name';
        addMessage("Thank you! And what's your <b>Full Name</b>?", 'bot');
        showTextInput("Enter your name");
    }

    async function finalizeLead() {
        addMessage("Submitting your details... ⏳", 'bot');
        leadData.source = `Chatbot — Shreya Shetty (${lastUserSelection})`;
        leadData.timestamp = new Date().toISOString();

        try {
            if (typeof submitLeadToAPI === 'function') await submitLeadToAPI(leadData);
        } catch (err) {
            console.error('API submission failed:', err);
        }

        addMessage(`Thank you, <b>${leadData.name}</b>! 🎉 Your details have been submitted. I'll personally ensure our team reaches out to you within 30 minutes with the best launch deals.`, 'bot');
        setTimeout(() => {
            showQuickOptions([
                { text: '🔄 Ask about something else', value: 'main_menu' }
            ]);
        }, 1500);
    }


    /* ============================================================
       8. TEXT INPUT SUBMIT
       ============================================================ */
    chatInputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = chatInput.value.trim();
        if (!val) return;

        if (currentStep === 'get_phone') {
            const countryCode = countrySelect ? countrySelect.value : '+91';
            
            if (countryCode === '+91') {
                if (!/^[6-9]\d{9}$/.test(val)) {
                    addMessage(val, 'user');
                    setTimeout(() => {
                        addMessage("❌ Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9:", 'bot');
                        showTextInput("Mobile Number", 'numeric');
                        if (countrySelect) {
                            countrySelect.value = '+91';
                            countrySelect.style.display = 'block';
                        }
                    }, 500);
                    return;
                }
            } else {
                if (!/^\d{7,12}$/.test(val)) {
                    addMessage(val, 'user');
                    setTimeout(() => {
                        addMessage("❌ Please enter a valid international mobile number (7 to 12 digits):", 'bot');
                        showTextInput("Mobile Number", 'numeric');
                        if (countrySelect) {
                            countrySelect.value = countryCode;
                            countrySelect.style.display = 'block';
                        }
                    }, 500);
                    return;
                }
            }

            // Clean number and concatenate
            const cleanNumber = (countryCode + val).replace(/[\s\-\(\)\+]+/g, '');
            leadData.phone = '+' + cleanNumber;
            addMessage(`${countryCode} ${val}`, 'user');
            setTimeout(() => askForName(), 600);

        } else if (currentStep === 'get_name') {
            if (val.length < 2) {
                addMessage(val, 'user');
                setTimeout(() => {
                    addMessage("❌ Please enter a valid full name:", 'bot');
                    showTextInput("Enter your name");
                }, 500);
                return;
            }
            leadData.name = val;
            addMessage(val, 'user');
            setTimeout(() => finalizeLead(), 600);
        }
    });
}

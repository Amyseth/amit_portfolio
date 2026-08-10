/**
 * CodeNCraft Studio - Core Interactivity Script
 * Manages theme managers, estimators, modal checkout hooks, FAQ accordions,
 * service selection mappings, and secure local lead capturing.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initHeaderScroll();
  initCostEstimator();
  initFaqAccordion();
  initServiceSelectors();
  initCheckoutStorefront();
  initContactForm();
});

/* ==========================================================================
   Theme Switcher & LocalStorage Persistence
   ========================================================================== */
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'light') {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
  } else if (savedTheme === 'dark') {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
  } else {
    if (systemPrefersDark) {
      body.classList.add('dark-theme');
    } else {
      body.classList.add('light-theme');
    }
  }

  themeToggle.addEventListener('click', () => {
    if (body.classList.contains('dark-theme')) {
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    } else {
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    }
  });
}

/* ==========================================================================
   Header Scroll and Active Link Tracking
   ========================================================================== */
function initHeaderScroll() {
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Active link highlighting upon scroll intersection
    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').substring(1) === currentSection) {
        link.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   Mobile Responsive Navigation Menu Toggle
   ========================================================================== */
function initMobileMenu() {
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const links = document.querySelectorAll('.nav-link');

  mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      mobileToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });
}

/* ==========================================================================
   Dynamic Project Scope & Price Estimator Calculator
   ========================================================================== */
function initCostEstimator() {
  const pagesSlider = document.getElementById('pagesSlider');
  const pagesValue = document.getElementById('pagesValue');
  
  const complexitySlider = document.getElementById('complexitySlider');
  const complexityValue = document.getElementById('complexityValue');
  
  const stripeCheck = document.getElementById('stripeCheck');
  const aiCheck = document.getElementById('aiCheck');
  
  const estimateRange = document.getElementById('estimateRange');
  const estimateTimeline = document.getElementById('estimateTimeline');
  const budgetBookBtn = document.getElementById('budgetBookBtn');

  // Complexity Tier Mappings
  const complexityTiers = {
    1: { name: "Basic Web Layouts", base: 14999, timeline: "1-2 Weeks" },
    2: { name: "Interactive React Frontend", base: 24999, timeline: "1-2 Weeks" },
    3: { name: "Full-Stack Portal & Auth", base: 49999, timeline: "2-3 Weeks" },
    4: { name: "Bespoke SaaS Engine", base: 79999, timeline: "3-4 Weeks" }
  };

  const calculateEstimate = () => {
    const pages = parseInt(pagesSlider.value, 10);
    const complexityIndex = parseInt(complexitySlider.value, 10);
    const tier = complexityTiers[complexityIndex];

    // Show selected slider text values dynamically
    pagesValue.textContent = pages === 15 ? "15+ Modules" : `${pages} Pages / Modules`;
    complexityValue.textContent = tier.name;

    // Calculation Math
    let basePrice = tier.base;
    
    // Add extra price per page (8% of base price for each additional page)
    let pageIncrementalCost = Math.floor((tier.base * 0.08) * (pages - 1));
    let totalPrice = basePrice + pageIncrementalCost;

    // Add add-ons
    if (stripeCheck.checked) totalPrice += 9999;
    if (aiCheck.checked) totalPrice += 14999;

    // Quote Range (Low estimate to 25% higher estimate)
    let lowRange = Math.floor(totalPrice / 1000) * 1000;
    let highRange = Math.floor((totalPrice * 1.25) / 1000) * 1000;

    // Display formatted Rupee output
    estimateRange.textContent = `₹${lowRange.toLocaleString('en-IN')} - ₹${highRange.toLocaleString('en-IN')}`;
    estimateTimeline.textContent = tier.timeline;
  };

  // Add Listeners
  pagesSlider.addEventListener('input', calculateEstimate);
  complexitySlider.addEventListener('input', calculateEstimate);
  stripeCheck.addEventListener('change', calculateEstimate);
  aiCheck.addEventListener('change', calculateEstimate);

  // Initialize Calculator on load
  calculateEstimate();

  // Book with Estimator Pre-fill Trigger
  budgetBookBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    const pages = pagesSlider.value;
    const complexity = complexityTiers[complexitySlider.value].name;
    const stripeText = stripeCheck.checked ? "Yes" : "No";
    const aiText = aiCheck.checked ? "Yes" : "No";
    const priceQuoteText = estimateRange.textContent;

    // Select proper dropdown option in main contact form
    const projectTypeDropdown = document.getElementById('projectType');
    projectTypeDropdown.value = 'estimator';

    // Select proper pre-qualified budget tier based on slider values
    const budgetDropdown = document.getElementById('budgetRange');
    const numericCost = parseInt(priceQuoteText.replace(/[^\d]/g, '').substring(0, 5), 10);
    
    if (numericCost < 20000) {
      budgetDropdown.value = 'under50';
    } else if (numericCost >= 20000 && numericCost < 50000) {
      budgetDropdown.value = 'medium';
    } else if (numericCost >= 50000 && numericCost < 100000) {
      budgetDropdown.value = 'large';
    } else {
      budgetDropdown.value = 'custom';
    }

    // Auto-fill project message details beautifully
    const messageTextarea = document.getElementById('clientMessage');
    messageTextarea.value = `Hi CodeNCraft! I configured my project scope using your Slider Estimator:
- Total Modules: ${pages === '15' ? '15+ Pages' : pages + ' Pages'}
- Technology Level: ${complexity}
- Integrations: Stripe Billing [${stripeText}], AI Assistant Pipeline [${aiText}]
- Generated Quote Range: ${priceQuoteText}

Let's discuss this project scope!`;

    // Smoothly scroll down to contact form
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
  });
}

/* ==========================================================================
   FAQ Objections Accordion Panel Slide Transition
   ========================================================================== */
function initFaqAccordion() {
  const triggers = document.querySelectorAll('.faq-trigger');

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const parent = trigger.closest('.faq-item');
      const panel = parent.querySelector('.faq-panel');
      const isActive = parent.classList.contains('active');

      // Reset and close other open items
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
        item.querySelector('.faq-panel').style.maxHeight = null;
      });

      if (!isActive) {
        parent.classList.add('active');
        // Set maximum height to scrollHeight to trigger CSS sliding animations
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });
}

/* ==========================================================================
   Bespoke Services Package Selection Mapping
   ========================================================================== */
function initServiceSelectors() {
  const serviceButtons = document.querySelectorAll('.service-btn');

  serviceButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceName = btn.getAttribute('data-service');
      const projectTypeDropdown = document.getElementById('projectType');
      const budgetDropdown = document.getElementById('budgetRange');
      const messageTextarea = document.getElementById('clientMessage');

      // Map button selection values directly to Form Dropdowns
      if (serviceName === 'Frontend Rebrand') {
        projectTypeDropdown.value = 'rebrand';
        budgetDropdown.value = 'medium';
        messageTextarea.value = "Hi CodeNCraft! I am looking to rebrand our product frontend. I want clean custom CSS, smooth layouts, glassmorphism card frames, and high page performance.";
      } else if (serviceName === 'SaaS MVP Builder') {
        projectTypeDropdown.value = 'saas';
        budgetDropdown.value = 'large';
        messageTextarea.value = "Hi CodeNCraft! I am looking for a full-stack SaaS MVP. We need secure user authentication, database integrations, occupancy management dashboards, and stripe subscription checkouts.";
      } else if (serviceName === 'AI Engine Integration') {
        projectTypeDropdown.value = 'ai';
        budgetDropdown.value = 'custom';
        messageTextarea.value = "Hi CodeNCraft! I want to integrate smart logic into our application. We need Gemini/ChatGPT LLM API pipelines, computational ROI estimation formulas, or reinforcement learning feedback tracking.";
      }

      // Smooth scroll to lead form
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ==========================================================================
   Storefront Commercial Templates Checkout Modal Dialog
   ========================================================================== */
function initCheckoutStorefront() {
  const backdrop = document.getElementById('checkoutModalBackdrop');
  const openButtons = document.querySelectorAll('.buy-template-btn');
  const closeBtn = document.getElementById('modalCloseBtn');
  
  const templateTitle = document.getElementById('checkoutTemplateTitle');
  const templatePrice = document.getElementById('checkoutTemplatePrice');
  
  const checkoutForm = document.getElementById('checkoutForm');
  const successBox = document.getElementById('checkoutSuccessBox');
  const closeSuccessBtn = document.getElementById('closeCheckoutSuccessBtn');
  
  const customerEmailIndicator = document.getElementById('purchasedCustomerEmail');

  const openCheckout = (title, price) => {
    templateTitle.textContent = title;
    templatePrice.textContent = price;
    
    // Reset form display
    checkoutForm.reset();
    checkoutForm.style.display = 'flex';
    successBox.classList.remove('active');
    
    // Clear validation borders
    document.querySelectorAll('#checkoutForm .form-group').forEach(group => group.classList.remove('invalid'));

    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeCheckout = () => {
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  };

  openButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.getAttribute('data-template');
      const price = btn.getAttribute('data-price');
      openCheckout(title, price);
    });
  });

  closeBtn.addEventListener('click', closeCheckout);
  closeSuccessBtn.addEventListener('click', closeCheckout);
  
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeCheckout();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('active')) {
      closeCheckout();
    }
  });

  // Handle Purchase Form Submit Validation
  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('checkoutName');
    const emailInput = document.getElementById('checkoutEmail');
    
    let isNameValid = nameInput.value.trim().length > 0;
    let isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());

    // Validate Input Borders
    nameInput.closest('.form-group').classList.toggle('invalid', !isNameValid);
    emailInput.closest('.form-group').classList.toggle('invalid', !isEmailValid);

    if (isNameValid && isEmailValid) {
      // Record Template Sale Interest Offline in LocalStorage
      const purchaseDetails = {
        purchaseId: 'order_' + Date.now(),
        timestamp: new Date().toISOString(),
        customerName: nameInput.value.trim(),
        customerEmail: emailInput.value.trim(),
        templateTitle: templateTitle.textContent,
        priceCharged: templatePrice.textContent
      };

      const existingPurchases = JSON.parse(localStorage.getItem('codencraft_purchases') || '[]');
      existingPurchases.push(purchaseDetails);
      localStorage.setItem('codencraft_purchases', JSON.stringify(existingPurchases));

      // Display Success Modal details
      customerEmailIndicator.textContent = purchaseDetails.customerEmail;
      checkoutForm.style.display = 'none';
      successBox.classList.add('active');
    }
  });
}

/* ==========================================================================
   High-Converting Contact Lead Validation, Local Capture & Export
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const successBox = document.getElementById('successBox');
  const exportBtn = document.getElementById('exportLeadsBtn');
  const resetBtn = document.getElementById('resetFormBtn');

  const nameInput = document.getElementById('clientName');
  const emailInput = document.getElementById('clientEmail');
  const businessInput = document.getElementById('businessName');
  const messageInput = document.getElementById('clientMessage');

  // Formspree Endpoint Configuration
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xpqnjory';

  const validateField = (input) => {
    const group = input.closest('.form-group');
    let isValid = true;

    if (input.required && !input.value.trim()) {
      isValid = false;
    }

    if (input.type === 'email' && input.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.value.trim())) {
        isValid = false;
      }
    }

    group.classList.toggle('invalid', !isValid);
    return isValid;
  };

  // Blur validation handlers
  nameInput.addEventListener('blur', () => validateField(nameInput));
  emailInput.addEventListener('blur', () => validateField(emailInput));
  messageInput.addEventListener('blur', () => validateField(messageInput));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const isNameValid = validateField(nameInput);
    const isEmailValid = validateField(emailInput);
    const isMsgValid = validateField(messageInput);

    if (isNameValid && isEmailValid && isMsgValid) {
      const submitBtn = document.getElementById('submitBtn');
      const originalBtnText = submitBtn.innerHTML;
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Transmitting Roadmap...</span> <i class="fa-solid fa-spinner animate-spin"></i>';

      const leadData = {
        id: 'lead_' + Date.now(),
        timestamp: new Date().toISOString(),
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        company: businessInput.value.trim(),
        serviceSelected: document.getElementById('projectType').value,
        budgetSelected: document.getElementById('budgetRange').value,
        message: messageInput.value.trim()
      };

      try {
        const payload = {
          name: leadData.name,
          email: leadData.email,
          company: leadData.company,
          service: leadData.serviceSelected,
          budget: leadData.budgetSelected,
          message: leadData.message
        };

        if (FORMSPREE_ENDPOINT && !FORMSPREE_ENDPOINT.includes('YOUR_FORMSPREE_ID')) {
          const response = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) throw new Error('Formspree network error');
        }

        // Save locally to local backup leads
        const existingLeads = JSON.parse(localStorage.getItem('codencraft_leads') || '[]');
        existingLeads.push(leadData);
        localStorage.setItem('codencraft_leads', JSON.stringify(existingLeads));

        successBox.classList.add('active');

      } catch (err) {
        console.error('Lead Capture Fallback:', err);
        alert('There was a problem sending your message through Formspree. Recording it locally as backup instead!');
        
        const existingLeads = JSON.parse(localStorage.getItem('codencraft_leads') || '[]');
        existingLeads.push(leadData);
        localStorage.setItem('codencraft_leads', JSON.stringify(existingLeads));
        
        successBox.classList.add('active');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }
  });

  resetBtn.addEventListener('click', () => {
    form.reset();
    document.querySelectorAll('.form-group').forEach(group => group.classList.remove('invalid'));
    successBox.classList.remove('active');
  });

  exportBtn.addEventListener('click', () => {
    const leads = localStorage.getItem('codencraft_leads') || '[]';
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(JSON.parse(leads), null, 2));
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `codencraft_lead_details_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });
}

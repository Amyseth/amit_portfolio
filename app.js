/**
 * Amit Seth Portfolio - Core Interactivity Script
 * Contains theme managers, typing effects, ambient glows, count-up stats,
 * project filters, modals, and secure local form capture.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initHeaderScroll();
  initCursorGlow();
  initTypingEffect();
  initStatsCounters();
  initSkillsBarAnimation();
  initProjectFilters();
  initCaseStudyModals();
  initContactForm();
});

/* ==========================================================================
   Theme Switcher & LocalStorage Persistence
   ========================================================================== */
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

  // Retrieve existing selection or fall back to system preferences
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'light') {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
  } else if (savedTheme === 'dark') {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
  } else {
    // Default to system preference
    if (systemPrefersDark) {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
    }
  }

  // Handle click toggle
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
    // Shink header padding on scroll
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Intersection check for active link updates
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
   60fps Interactive Cursor glow
   ========================================================================== */
function initCursorGlow() {
  const cursorGlow = document.getElementById('cursorGlow');
  if (!cursorGlow) return;

  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth lerping tracer animation
  function animateGlow() {
    // 0.08 is the speed index. Higher numbers follow tighter, lower numbers glide smoother.
    currentX += (mouseX - currentX) * 0.08;
    currentY += (mouseY - currentY) * 0.08;

    cursorGlow.style.left = `${currentX}px`;
    cursorGlow.style.top = `${currentY}px`;

    requestAnimationFrame(animateGlow);
  }

  // Start smooth looping frame rendering
  animateGlow();
}

/* ==========================================================================
   Typing Banner Loop
   ========================================================================== */
function initTypingEffect() {
  const words = ['Full-Stack Developer', 'SaaS Solutions Architect', 'UI/UX Craftsperson', 'Creative Engineer'];
  const typingText = document.getElementById('typing-text');
  if (!typingText) return;

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 100;

  function type() {
    const currentWord = words[wordIndex];

    if (isDeleting) {
      typingText.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 40; // delete speed is faster
    } else {
      typingText.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 80; // regular typing speed
    }

    // Finished typing entire word
    if (!isDeleting && charIndex === currentWord.length) {
      typeSpeed = 2200; // Pause at full word before deleting
      isDeleting = true;
    } 
    // Finished deleting entire word
    else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typeSpeed = 300; // Pause before typing new word
    }

    setTimeout(type, typeSpeed);
  }

  // Trigger typist cycle
  setTimeout(type, 500);
}

/* ==========================================================================
   Count-Up Statistics Widget
   ========================================================================== */
function initStatsCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length === 0) return;

  const countUp = (element) => {
    const target = parseInt(element.getAttribute('data-target'), 10);
    const duration = 2000; // 2 seconds animation
    const stepTime = 20; // 50 updates per second
    const steps = duration / stepTime;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target.toLocaleString() + (element.textContent.includes('%') ? '%' : '+');
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current).toLocaleString() + (element.textContent.includes('%') ? '%' : '+');
      }
    }, stepTime);
  };

  // IntersectionObserver triggers animation when stats scroll into view
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        obs.unobserve(entry.target); // trigger only once
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(num => observer.observe(num));
}

/* ==========================================================================
   Skills Matrix Loading Animation
   ========================================================================== */
function initSkillsBarAnimation() {
  const skillsProgress = document.querySelectorAll('.skill-progress');
  if (skillsProgress.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Reset the bar to animate up to its stylesheet style
        const progressBar = entry.target;
        // The inline styling sets the original width which we load
        progressBar.style.width = progressBar.style.width;
      }
    });
  }, { threshold: 0.1 });

  // Initially reset widths to 0 to trigger scaling animation upon intersection
  skillsProgress.forEach(bar => {
    const targetWidth = bar.style.width;
    bar.style.width = '0';
    setTimeout(() => {
      bar.style.width = targetWidth;
    }, 100);
    observer.observe(bar);
  });
}

/* ==========================================================================
   Interactive Projects Category Filters
   ========================================================================== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active button CSS
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const categories = card.getAttribute('data-category').split(' ');
        
        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/* ==========================================================================
   Case Study Overlay Modal Actions
   ========================================================================== */
function initCaseStudyModals() {
  const backdrop = document.getElementById('modalBackdrop');
  const modalTriggers = document.querySelectorAll('.view-case-study');
  const closeBtns = document.querySelectorAll('.modal-close');
  const modalCards = document.querySelectorAll('.modal-card');

  // Trigger click modal
  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const projectType = trigger.getAttribute('data-project');
      const targetModal = document.getElementById(`${projectType}Modal`);

      if (targetModal) {
        backdrop.classList.add('active');
        targetModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // block page scrolling behind modal
      }
    });
  });

  // Close modals helper
  const closeAllModals = () => {
    backdrop.classList.remove('active');
    modalCards.forEach(card => card.classList.remove('active'));
    document.body.style.overflow = ''; // restore scrolling
  };

  closeBtns.forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      closeAllModals();
    }
  });

  // Keyboard close check
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('active')) {
      closeAllModals();
    }
  });
}

/* ==========================================================================
   Contact Form Validation, Local Capture & Data Export
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const successBox = document.getElementById('successBox');
  const exportBtn = document.getElementById('exportLeadsBtn');
  const resetBtn = document.getElementById('resetFormBtn');

  // Formspree Endpoint Configuration
  // REPLACE 'YOUR_FORMSPREE_ID' with the Form ID you get from Formspree.io (e.g. 'mqkrwqpy')
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xpqnjory';

  // Form Fields
  const nameInput = document.getElementById('clientName');
  const emailInput = document.getElementById('clientEmail');
  const messageInput = document.getElementById('clientMessage');

  // Validate Field State
  const validateField = (input, errorEl) => {
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

    if (!isValid) {
      group.classList.add('invalid');
    } else {
      group.classList.remove('invalid');
    }

    return isValid;
  };

  // Real-time blur validation triggers
  nameInput.addEventListener('blur', () => validateField(nameInput));
  emailInput.addEventListener('blur', () => validateField(emailInput));
  messageInput.addEventListener('blur', () => validateField(messageInput));

  // Form Submit Handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const isNameValid = validateField(nameInput);
    const isEmailValid = validateField(emailInput);
    const isMsgValid = validateField(messageInput);

    if (isNameValid && isEmailValid && isMsgValid) {
      const submitBtn = document.getElementById('submitBtn');
      const originalBtnText = submitBtn.innerHTML;
      
      // Set button to loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Transmitting...</span> <i class="fa-solid fa-spinner animate-spin"></i>';

      // Package Form Data
      const leadData = {
        id: 'lead_' + Date.now(),
        timestamp: new Date().toISOString(),
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        projectType: document.getElementById('projectType').value,
        message: messageInput.value.trim()
      };

      // Try sending to Formspree
      try {
        const formspreeData = {
          name: leadData.name,
          email: leadData.email,
          project: leadData.projectType,
          message: leadData.message
        };

        // Only send network request if Formspree ID has been set by the developer
        if (FORMSPREE_ENDPOINT && !FORMSPREE_ENDPOINT.includes('YOUR_FORMSPREE_ID')) {
          const response = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formspreeData)
          });

          if (!response.ok) {
            throw new Error('Failed to transmit message through Formspree');
          }
        } else {
          console.warn('Formspree submission skipped: "YOUR_FORMSPREE_ID" has not been configured in app.js yet.');
        }

        // Save a backup copy locally
        const existingLeads = JSON.parse(localStorage.getItem('portfolio_leads') || '[]');
        existingLeads.push(leadData);
        localStorage.setItem('portfolio_leads', JSON.stringify(existingLeads));

        // Display success box
        successBox.classList.add('active');

      } catch (err) {
        console.error('Transmission Error:', err);
        alert('There was a problem sending your message through Formspree. Saving it locally as backup instead!');
        
        // Save locally as fallback backup
        const existingLeads = JSON.parse(localStorage.getItem('portfolio_leads') || '[]');
        existingLeads.push(leadData);
        localStorage.setItem('portfolio_leads', JSON.stringify(existingLeads));
        
        successBox.classList.add('active');
      } finally {
        // Restore button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }
  });

  // Reset form inputs & panel
  resetBtn.addEventListener('click', () => {
    form.reset();
    
    // Clear validation outlines
    document.querySelectorAll('.form-group').forEach(group => {
      group.classList.remove('invalid');
    });

    successBox.classList.remove('active');
  });

  // Export LocalStorage leads to JSON download file
  exportBtn.addEventListener('click', () => {
    const leads = localStorage.getItem('portfolio_leads') || '[]';
    
    // Format JSON data beautifully
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(JSON.parse(leads), null, 2));
    
    // Virtual anchor creation to trigger automatic downloads
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `portfolio_career_inquiries_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });
}

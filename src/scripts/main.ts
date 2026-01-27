// Main initialization script

// Mobile menu toggle
function initMobileMenu() {
  const menuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.contains('hidden');
      if (isHidden) {
        mobileMenu.classList.remove('hidden');
        menuButton.setAttribute('aria-expanded', 'true');
      } else {
        mobileMenu.classList.add('hidden');
        menuButton.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

// FAQ accordion
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const toggle = item.querySelector('.faq-toggle');
    const content = item.querySelector('.faq-content') as HTMLElement;
    const icon = toggle?.querySelector('svg');

    if (toggle && content) {
      toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
          // Close
          toggle.setAttribute('aria-expanded', 'false');
          content.style.maxHeight = '0';
          icon?.classList.remove('rotate-180');
        } else {
          // Open
          toggle.setAttribute('aria-expanded', 'true');
          content.style.maxHeight = content.scrollHeight + 'px';
          icon?.classList.add('rotate-180');
        }
      });
    }
  });
}

// Counter animation for stats
function initCounters() {
  const counters = document.querySelectorAll('[data-counter="true"]');

  const observerOptions = {
    threshold: 0.5,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const counter = entry.target as HTMLElement;
        const target = parseInt(counter.dataset.target || '0', 10);
        const prefix = counter.dataset.prefix || '';
        const suffix = counter.dataset.suffix || '';
        const duration = 2000;
        const step = Math.ceil(target / (duration / 16));

        let current = 0;
        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          counter.textContent = `${prefix}${current}${suffix}`;
        }, 16);

        observer.unobserve(counter);
      }
    });
  }, observerOptions);

  counters.forEach((counter) => observer.observe(counter));
}

// Contact form handling (front-end only)
function initContactForm() {
  const form = document.getElementById('contact-form') as HTMLFormElement;

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Show success message (in production, this would send to a server)
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Message Sent!';
        (submitBtn as HTMLButtonElement).disabled = true;
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          (submitBtn as HTMLButtonElement).disabled = false;
        }, 3000);
      }
      form.reset();
    });
  }
}

// Initialize all components
function init() {
  initMobileMenu();
  initFAQAccordion();
  initCounters();
  initContactForm();
}

// Run on load and when sections are dynamically loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

window.addEventListener('sections-loaded', init);

export { initMobileMenu, initFAQAccordion, initCounters, initContactForm };

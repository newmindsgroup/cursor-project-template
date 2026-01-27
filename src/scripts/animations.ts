// Animation system with GSAP and Intersection Observer
import gsap from 'gsap';
import { initPresets, PRESETS, getPresetList, applyPreset } from './animation-presets';

// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Scroll-triggered fade animations
function initScrollAnimations() {
  if (prefersReducedMotion) {
    // Skip animations if user prefers reduced motion
    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach((el) => {
      (el as HTMLElement).style.opacity = '1';
      (el as HTMLElement).style.transform = 'none';
    });
    return;
  }

  const animatedElements = document.querySelectorAll('[data-animate]');

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        const animationType = element.dataset.animate || 'fade-up';
        const delay = parseFloat(element.dataset.animateDelay || '0') / 1000;

        // Animation variants
        const animations: Record<string, gsap.TweenVars> = {
          'fade-up': {
            y: 0,
            opacity: 1,
            duration: 0.6,
            delay,
            ease: 'power2.out',
          },
          'fade-down': {
            y: 0,
            opacity: 1,
            duration: 0.6,
            delay,
            ease: 'power2.out',
          },
          'fade-left': {
            x: 0,
            opacity: 1,
            duration: 0.6,
            delay,
            ease: 'power2.out',
          },
          'fade-right': {
            x: 0,
            opacity: 1,
            duration: 0.6,
            delay,
            ease: 'power2.out',
          },
          'fade-in': {
            opacity: 1,
            duration: 0.6,
            delay,
            ease: 'power2.out',
          },
          'scale-in': {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            delay,
            ease: 'back.out(1.7)',
          },
        };

        // Set initial state based on animation type
        if (animationType === 'fade-down') {
          gsap.set(element, { y: -20, opacity: 0 });
        } else if (animationType === 'fade-left') {
          gsap.set(element, { x: 20, opacity: 0 });
        } else if (animationType === 'fade-right') {
          gsap.set(element, { x: -20, opacity: 0 });
        } else if (animationType === 'scale-in') {
          gsap.set(element, { scale: 0.95, opacity: 0 });
        } else if (animationType === 'fade-in') {
          gsap.set(element, { opacity: 0 });
        } else {
          // Default fade-up
          gsap.set(element, { y: 20, opacity: 0 });
        }

        // Animate
        gsap.to(element, animations[animationType] || animations['fade-up']);

        observer.unobserve(element);
      }
    });
  }, observerOptions);

  animatedElements.forEach((element) => observer.observe(element));
}

// Stagger animations for grids/lists
function initStaggerAnimations() {
  if (prefersReducedMotion) return;

  const staggerGroups = document.querySelectorAll('[data-stagger]');

  staggerGroups.forEach((group) => {
    const children = group.children;
    const delay = parseFloat((group as HTMLElement).dataset.staggerDelay || '0.1');

    gsap.set(children, { y: 20, opacity: 0 });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(children, {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: delay,
              ease: 'power2.out',
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(group);
  });
}

// Parallax scroll effect (subtle)
function initParallax() {
  if (prefersReducedMotion) return;

  const parallaxElements = document.querySelectorAll('[data-parallax]');

  window.addEventListener(
    'scroll',
    () => {
      const scrolled = window.pageYOffset;

      parallaxElements.forEach((element) => {
        const speed = parseFloat((element as HTMLElement).dataset.parallaxSpeed || '0.5');
        const yPos = -(scrolled * speed);
        gsap.to(element, {
          y: yPos,
          duration: 0,
        });
      });
    },
    { passive: true }
  );
}

// Initialize all animations
function init() {
  initScrollAnimations();
  initStaggerAnimations();
  initParallax();
  initPresets(); // Initialize 20+ animation presets
}

// Run on load and when sections are dynamically loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

window.addEventListener('sections-loaded', init);

export { 
  initScrollAnimations, 
  initStaggerAnimations, 
  initParallax,
  initPresets,
  PRESETS,
  getPresetList,
  applyPreset
};

/**
 * Animation Presets Library
 * 20+ production-ready GSAP animation presets
 * 
 * Usage:
 *   <div data-preset="reveal-up">Content</div>
 *   <div data-preset="stagger-cards" data-stagger="0.1">Cards</div>
 *   <div data-preset="counter" data-count-to="500">0</div>
 */

import gsap from 'gsap';

// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// =============================================================================
// PRESET DEFINITIONS
// =============================================================================

interface AnimationPreset {
  name: string;
  initial: gsap.TweenVars;
  animate: gsap.TweenVars;
  description: string;
}

export const PRESETS: Record<string, AnimationPreset> = {
  // =====================
  // REVEAL ANIMATIONS
  // =====================
  'reveal-up': {
    name: 'Reveal Up',
    description: 'Fade in while moving up',
    initial: { y: 60, opacity: 0 },
    animate: { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
  },
  'reveal-down': {
    name: 'Reveal Down',
    description: 'Fade in while moving down',
    initial: { y: -60, opacity: 0 },
    animate: { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
  },
  'reveal-left': {
    name: 'Reveal Left',
    description: 'Fade in from right to left',
    initial: { x: 60, opacity: 0 },
    animate: { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
  },
  'reveal-right': {
    name: 'Reveal Right',
    description: 'Fade in from left to right',
    initial: { x: -60, opacity: 0 },
    animate: { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
  },
  'reveal-scale': {
    name: 'Reveal Scale',
    description: 'Fade in with scale bounce',
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }
  },
  'reveal-rotate': {
    name: 'Reveal Rotate',
    description: 'Fade in with slight rotation',
    initial: { rotation: -5, opacity: 0, y: 20 },
    animate: { rotation: 0, opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
  },

  // =====================
  // TEXT ANIMATIONS
  // =====================
  'text-split': {
    name: 'Text Split',
    description: 'Characters animate in individually',
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
  },
  'text-blur': {
    name: 'Text Blur',
    description: 'Fade in from blur',
    initial: { filter: 'blur(10px)', opacity: 0 },
    animate: { filter: 'blur(0px)', opacity: 1, duration: 0.8, ease: 'power2.out' }
  },
  'text-typewriter': {
    name: 'Typewriter',
    description: 'Typewriter effect (handled specially)',
    initial: { width: '0%' },
    animate: { width: '100%', duration: 1.5, ease: 'none' }
  },

  // =====================
  // CARD ANIMATIONS
  // =====================
  'card-flip': {
    name: 'Card Flip',
    description: '3D flip reveal',
    initial: { rotationY: -90, opacity: 0 },
    animate: { rotationY: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
  },
  'card-lift': {
    name: 'Card Lift',
    description: 'Lift up with shadow',
    initial: { y: 30, opacity: 0, boxShadow: '0 0 0 rgba(0,0,0,0)' },
    animate: { 
      y: 0, 
      opacity: 1, 
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)', 
      duration: 0.6, 
      ease: 'power2.out' 
    }
  },
  'card-slide': {
    name: 'Card Slide',
    description: 'Slide in from edge',
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
  },

  // =====================
  // STAGGER ANIMATIONS
  // =====================
  'stagger-cards': {
    name: 'Stagger Cards',
    description: 'Cards appear one by one',
    initial: { y: 40, opacity: 0 },
    animate: { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
  },
  'stagger-list': {
    name: 'Stagger List',
    description: 'List items slide in',
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
  },
  'stagger-grid': {
    name: 'Stagger Grid',
    description: 'Grid items reveal in sequence',
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.4)' }
  },
  'stagger-wave': {
    name: 'Stagger Wave',
    description: 'Wave-like reveal pattern',
    initial: { y: 30, opacity: 0, rotation: 3 },
    animate: { y: 0, opacity: 1, rotation: 0, duration: 0.6, ease: 'power2.out' }
  },

  // =====================
  // COUNTER ANIMATIONS
  // =====================
  'counter': {
    name: 'Counter',
    description: 'Animated number counter',
    initial: { textContent: '0' },
    animate: { duration: 2, ease: 'power2.out' }
  },
  'counter-fast': {
    name: 'Counter Fast',
    description: 'Fast number counter',
    initial: { textContent: '0' },
    animate: { duration: 1, ease: 'power1.out' }
  },

  // =====================
  // PARALLAX ANIMATIONS
  // =====================
  'parallax-slow': {
    name: 'Parallax Slow',
    description: 'Slow parallax movement',
    initial: {},
    animate: { y: 0 }
  },
  'parallax-fast': {
    name: 'Parallax Fast',
    description: 'Fast parallax movement',
    initial: {},
    animate: { y: 0 }
  },
  'parallax-depth': {
    name: 'Parallax Depth',
    description: 'Multi-layer depth effect',
    initial: {},
    animate: { y: 0 }
  },

  // =====================
  // SCROLL PROGRESS
  // =====================
  'scroll-progress': {
    name: 'Scroll Progress',
    description: 'Width based on scroll position',
    initial: { width: '0%' },
    animate: { width: '100%' }
  },
  'scroll-reveal': {
    name: 'Scroll Reveal',
    description: 'Opacity based on scroll position',
    initial: { opacity: 0 },
    animate: { opacity: 1 }
  },

  // =====================
  // MICRO-INTERACTIONS
  // =====================
  'hover-lift': {
    name: 'Hover Lift',
    description: 'Lift on hover',
    initial: { y: 0, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    animate: { y: -8, boxShadow: '0 20px 25px rgba(0,0,0,0.15)', duration: 0.3, ease: 'power2.out' }
  },
  'hover-scale': {
    name: 'Hover Scale',
    description: 'Scale on hover',
    initial: { scale: 1 },
    animate: { scale: 1.05, duration: 0.3, ease: 'power2.out' }
  },
  'hover-glow': {
    name: 'Hover Glow',
    description: 'Glow effect on hover',
    initial: { boxShadow: '0 0 0 rgba(139, 92, 246, 0)' },
    animate: { boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)', duration: 0.3, ease: 'power2.out' }
  },
  'click-pulse': {
    name: 'Click Pulse',
    description: 'Pulse on click',
    initial: { scale: 1 },
    animate: { scale: 0.95, duration: 0.1, ease: 'power2.in' }
  }
};

// =============================================================================
// INITIALIZATION FUNCTIONS
// =============================================================================

/**
 * Initialize all preset animations
 */
export function initPresets() {
  if (prefersReducedMotion) {
    // Remove all preset initial states for reduced motion
    const presetElements = document.querySelectorAll('[data-preset]');
    presetElements.forEach(el => {
      (el as HTMLElement).style.opacity = '1';
      (el as HTMLElement).style.transform = 'none';
    });
    return;
  }

  initRevealPresets();
  initStaggerPresets();
  initCounterPresets();
  initTextSplitPresets();
  initTypewriterPresets();
  initParallaxPresets();
  initHoverPresets();
  initScrollProgressPresets();
}

/**
 * Initialize reveal animations (scroll-triggered)
 */
function initRevealPresets() {
  const revealTypes = ['reveal-up', 'reveal-down', 'reveal-left', 'reveal-right', 'reveal-scale', 'reveal-rotate', 'text-blur', 'card-flip', 'card-lift', 'card-slide'];
  
  revealTypes.forEach(type => {
    const elements = document.querySelectorAll(`[data-preset="${type}"]`);
    
    elements.forEach(element => {
      const el = element as HTMLElement;
      const preset = PRESETS[type];
      const delay = parseFloat(el.dataset.delay || '0') / 1000;
      
      // Set initial state
      gsap.set(el, preset.initial);
      
      // Create observer
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              gsap.to(el, { ...preset.animate, delay });
              observer.unobserve(el);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );
      
      observer.observe(el);
    });
  });
}

/**
 * Initialize stagger animations
 */
function initStaggerPresets() {
  const staggerTypes = ['stagger-cards', 'stagger-list', 'stagger-grid', 'stagger-wave'];
  
  staggerTypes.forEach(type => {
    const containers = document.querySelectorAll(`[data-preset="${type}"]`);
    
    containers.forEach(container => {
      const preset = PRESETS[type];
      const stagger = parseFloat((container as HTMLElement).dataset.stagger || '0.1');
      const children = container.children;
      
      // Set initial state on children
      gsap.set(children, preset.initial);
      
      // Create observer
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              gsap.to(children, { ...preset.animate, stagger });
              observer.unobserve(container);
            }
          });
        },
        { threshold: 0.1 }
      );
      
      observer.observe(container);
    });
  });
}

/**
 * Initialize counter animations
 */
function initCounterPresets() {
  const counters = document.querySelectorAll('[data-preset="counter"], [data-preset="counter-fast"]');
  
  counters.forEach(counter => {
    const el = counter as HTMLElement;
    const target = parseFloat(el.dataset.countTo || el.textContent || '0');
    const preset = PRESETS[el.dataset.preset || 'counter'];
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    
    // Store original value
    el.textContent = prefix + '0' + suffix;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Use a proper object reference for GSAP animation
            const counterObj = { value: 0 };
            gsap.to(counterObj, {
              value: target,
              duration: preset.animate.duration,
              ease: preset.animate.ease,
              onUpdate: () => {
                el.textContent = prefix + Math.round(counterObj.value).toLocaleString() + suffix;
              }
            });
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    
    observer.observe(el);
  });
}

/**
 * Initialize text-split animations
 */
function initTextSplitPresets() {
  const elements = document.querySelectorAll('[data-preset="text-split"]');
  
  elements.forEach(element => {
    const el = element as HTMLElement;
    const text = el.textContent || '';
    const delay = parseFloat(el.dataset.delay || '0');
    const stagger = parseFloat(el.dataset.stagger || '0.03');
    
    // Split text into characters
    el.innerHTML = text.split('').map(char => 
      `<span class="split-char" style="display:inline-block">${char === ' ' ? '&nbsp;' : char}</span>`
    ).join('');
    
    const chars = el.querySelectorAll('.split-char');
    
    // Set initial state
    gsap.set(chars, { opacity: 0, y: 20 });
    
    // Animate on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            gsap.to(chars, {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: stagger,
              delay: delay,
              ease: 'power2.out'
            });
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.2 }
    );
    
    observer.observe(el);
  });
}

/**
 * Initialize typewriter animations
 */
function initTypewriterPresets() {
  const elements = document.querySelectorAll('[data-preset="text-typewriter"]');
  
  elements.forEach(element => {
    const el = element as HTMLElement;
    const text = el.textContent || '';
    const speed = parseFloat(el.dataset.speed || '50'); // ms per character
    const delay = parseFloat(el.dataset.delay || '0');
    
    // Clear content and add cursor
    el.textContent = '';
    el.style.borderRight = '2px solid currentColor';
    el.style.paddingRight = '2px';
    
    let charIndex = 0;
    let hasAnimated = false;
    
    const typeText = () => {
      if (charIndex < text.length) {
        el.textContent = text.substring(0, ++charIndex);
        setTimeout(typeText, speed);
      } else {
        // Remove cursor after typing completes
        setTimeout(() => {
          el.style.borderRight = 'none';
          el.style.paddingRight = '0';
        }, 500);
      }
    };
    
    // Start on scroll into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasAnimated) {
            hasAnimated = true;
            setTimeout(typeText, delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    
    observer.observe(el);
  });
}

/**
 * Initialize parallax presets
 */
function initParallaxPresets() {
  const parallaxElements = document.querySelectorAll('[data-preset^="parallax-"]');
  
  if (parallaxElements.length === 0) return;
  
  const speeds: Record<string, number> = {
    'parallax-slow': 0.3,
    'parallax-fast': 0.7,
    'parallax-depth': 0.5
  };
  
  let ticking = false;
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(el => {
          const preset = (el as HTMLElement).dataset.preset || 'parallax-slow';
          const speed = speeds[preset] || 0.5;
          const rect = el.getBoundingClientRect();
          const inView = rect.top < window.innerHeight && rect.bottom > 0;
          
          if (inView) {
            const yPos = -(scrolled * speed);
            gsap.set(el, { y: yPos * 0.5 });
          }
        });
        
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/**
 * Initialize hover presets
 */
function initHoverPresets() {
  const hoverTypes = ['hover-lift', 'hover-scale', 'hover-glow'];
  
  hoverTypes.forEach(type => {
    const elements = document.querySelectorAll(`[data-preset="${type}"]`);
    
    elements.forEach(element => {
      const el = element as HTMLElement;
      const preset = PRESETS[type];
      
      el.addEventListener('mouseenter', () => {
        gsap.to(el, preset.animate);
      });
      
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { ...preset.initial, duration: 0.3, ease: 'power2.out' });
      });
    });
  });
  
  // Click pulse
  const clickElements = document.querySelectorAll('[data-preset="click-pulse"]');
  clickElements.forEach(element => {
    element.addEventListener('click', () => {
      gsap.to(element, { scale: 0.95, duration: 0.1, ease: 'power2.in' });
      gsap.to(element, { scale: 1, duration: 0.3, ease: 'back.out(1.7)', delay: 0.1 });
    });
  });
}

/**
 * Initialize scroll progress presets
 */
function initScrollProgressPresets() {
  const progressElements = document.querySelectorAll('[data-preset="scroll-progress"]');
  const revealElements = document.querySelectorAll('[data-preset="scroll-reveal"]');
  
  if (progressElements.length === 0 && revealElements.length === 0) return;
  
  let ticking = false;
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollPercent = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        
        progressElements.forEach(el => {
          gsap.set(el, { width: `${scrollPercent}%` });
        });
        
        revealElements.forEach(el => {
          const rect = el.getBoundingClientRect();
          const elementTop = rect.top;
          const elementVisible = window.innerHeight - elementTop;
          const opacity = Math.min(1, Math.max(0, elementVisible / (window.innerHeight * 0.5)));
          gsap.set(el, { opacity });
        });
        
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/**
 * Get list of all available presets
 */
export function getPresetList(): { name: string; key: string; description: string }[] {
  return Object.entries(PRESETS).map(([key, preset]) => ({
    key,
    name: preset.name,
    description: preset.description
  }));
}

/**
 * Apply a preset programmatically
 */
export function applyPreset(element: HTMLElement, presetName: string, options: { delay?: number; stagger?: number } = {}) {
  const preset = PRESETS[presetName];
  if (!preset) {
    console.warn(`Animation preset "${presetName}" not found`);
    return;
  }
  
  gsap.set(element, preset.initial);
  gsap.to(element, { 
    ...preset.animate, 
    delay: options.delay || 0 
  });
}

// Export for external use
export { prefersReducedMotion };

/**
 * KLICK N CODE - Modern Animations & Interactions
 * Enhanced user experience with smooth animations
 */

(function() {
  'use strict';

  // =============================================
  // SCROLL ANIMATION OBSERVER
  // =============================================
  
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const animateOnScroll = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        // Add staggered animation to children if present
        const children = entry.target.querySelectorAll('.stagger-child');
        children.forEach((child, index) => {
          child.style.animationDelay = `${index * 0.1}s`;
          child.classList.add('animate-fade-in-up');
        });
        
        observer.unobserve(entry.target);
      }
    });
  };

  const scrollObserver = new IntersectionObserver(animateOnScroll, observerOptions);

  // =============================================
  // INITIALIZE SCROLL ANIMATIONS
  // =============================================
  
  function initScrollAnimations() {
    // Elements to animate on scroll
    const animateElements = document.querySelectorAll(
      'section > .container > .row, ' +
      '.card, ' +
      '.accordion-item, ' +
      'header .text-center'
    );

    animateElements.forEach((el, index) => {
      el.classList.add('scroll-animate');
      el.style.transitionDelay = `${(index % 3) * 0.1}s`;
      scrollObserver.observe(el);
    });
  }

  // =============================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // =============================================
  
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });
  }

  // =============================================
  // NAVBAR SCROLL EFFECT (Hide on scroll down, show on scroll up)
  // Note: Basic shrink functionality is handled by startup-modern.js
  // This adds the hide/show on scroll direction feature
  // =============================================
  
  function initNavbarEffect() {
    const navbar = document.querySelector('#mainNav');
    if (!navbar) return;

    let lastScroll = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScroll = window.pageYOffset;
          
          // Hide/show navbar on scroll direction (only when scrolled past 500px)
          if (currentScroll > lastScroll && currentScroll > 500) {
            navbar.style.transform = 'translateY(-100%)';
          } else {
            navbar.style.transform = 'translateY(0)';
          }
          
          lastScroll = currentScroll;
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // =============================================
  // BUTTON RIPPLE EFFECT
  // =============================================
  
  function initRippleEffect() {
    document.querySelectorAll('.btn').forEach(button => {
      button.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.style.cssText = `
          position: absolute;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          pointer-events: none;
          width: 100px;
          height: 100px;
          left: ${x - 50}px;
          top: ${y - 50}px;
          transform: scale(0);
          animation: ripple 0.6s ease-out;
        `;
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
      });
    });

    // Add ripple animation keyframes
    if (!document.querySelector('#ripple-style')) {
      const style = document.createElement('style');
      style.id = 'ripple-style';
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // =============================================
  // COUNTER ANIMATION
  // =============================================
  
  function animateCounters() {
    const counters = document.querySelectorAll('.fs-2.fw-bold.text-primary');
    
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const text = target.textContent;
          const match = text.match(/(\d+)/);
          
          if (match) {
            const endValue = parseInt(match[1]);
            const suffix = text.replace(match[1], '');
            let startValue = 0;
            const duration = 2000;
            const increment = endValue / (duration / 16);
            
            const updateCounter = () => {
              startValue += increment;
              if (startValue < endValue) {
                target.textContent = Math.floor(startValue) + suffix.replace(/^\d+/, '');
                requestAnimationFrame(updateCounter);
              } else {
                target.textContent = text;
              }
            };
            
            updateCounter();
          }
          
          counterObserver.unobserve(target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
  }

  // =============================================
  // HOVER TILT EFFECT FOR CARDS
  // =============================================
  
  function initTiltEffect() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
      });
    });
  }

  // =============================================
  // MAGNETIC BUTTONS
  // =============================================
  
  function initMagneticButtons() {
    const magneticButtons = document.querySelectorAll('.btn-primary, .btn-light');
    
    magneticButtons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  // =============================================
  // TYPING EFFECT FOR HERO
  // =============================================
  
  function initTypingEffect() {
    const heroTitle = document.querySelector('header h1');
    if (!heroTitle) return;
    
    // Add cursor effect to underlined text
    const underlines = heroTitle.querySelectorAll('.underline');
    underlines.forEach(underline => {
      underline.style.position = 'relative';
    });
  }

  // =============================================
  // LOADING ANIMATION
  // =============================================
  
  function initPageLoad() {
    // Only apply loading animation if JavaScript is enabled
    // Use CSS class instead of inline styles for better fallback
    document.documentElement.classList.add('js-loading');
    
    // Add loading styles dynamically
    const loadingStyle = document.createElement('style');
    loadingStyle.textContent = `
      .js-loading body { opacity: 0; }
      .js-loaded body { opacity: 1; transition: opacity 0.5s ease; }
    `;
    document.head.appendChild(loadingStyle);
    
    window.addEventListener('load', () => {
      document.documentElement.classList.remove('js-loading');
      document.documentElement.classList.add('js-loaded');
      
      // Animate hero elements
      const heroElements = document.querySelectorAll('header h1, header p, header .btn, header img');
      heroElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
          el.style.transition = 'all 0.8s ease';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 200 + (index * 150));
      });
    });
    
    // Fallback: show content after 3 seconds even if load event hasn't fired
    setTimeout(() => {
      document.documentElement.classList.remove('js-loading');
      document.documentElement.classList.add('js-loaded');
    }, 3000);
  }

  // =============================================
  // CURSOR GLOW EFFECT
  // =============================================
  
  function initCursorGlow() {
    // Use matchMedia for responsive behavior
    const desktopQuery = window.matchMedia('(min-width: 1024px)');
    
    let glow = null;
    
    function createGlow() {
      if (glow) return;
      
      glow = document.createElement('div');
      glow.className = 'cursor-glow';
      glow.style.cssText = `
        position: fixed;
        width: 300px;
        height: 300px;
        background: radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        transition: opacity 0.3s ease;
        opacity: 0;
      `;
      document.body.appendChild(glow);
      
      document.addEventListener('mousemove', handleMouseMove);
    }
    
    function removeGlow() {
      if (glow) {
        glow.remove();
        glow = null;
        document.removeEventListener('mousemove', handleMouseMove);
      }
    }
    
    function handleMouseMove(e) {
      if (glow) {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
        glow.style.opacity = '1';
      }
    }
    
    // Initialize based on current screen size
    if (desktopQuery.matches) {
      createGlow();
    }
    
    // Listen for screen size changes
    desktopQuery.addEventListener('change', (e) => {
      if (e.matches) {
        createGlow();
      } else {
        removeGlow();
      }
    });
  }

  // =============================================
  // INITIALIZE ALL EFFECTS
  // =============================================
  
  document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initSmoothScroll();
    initNavbarEffect();
    initRippleEffect();
    animateCounters();
    initTiltEffect();
    initTypingEffect();
    
    // Performance-heavy effects - only on capable devices
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      initMagneticButtons();
      initCursorGlow();
    }
  });

  // Initialize page load animation
  initPageLoad();

})();

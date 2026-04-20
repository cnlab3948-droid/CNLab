/**
 * CNLab Website — App Router & Navigation
 * SPA 라우팅, 네비게이션, 스크롤 애니메이션
 */

(function () {
  'use strict';

  // ===== DOM Elements =====
  const navbar = document.getElementById('navbar');
  const navLinks = document.getElementById('nav-links');
  const hamburger = document.getElementById('nav-hamburger');
  const allNavLinks = document.querySelectorAll('.nav__link');
  const allSections = document.querySelectorAll('.section');
  const footerLinks = document.querySelectorAll('[data-nav]');

  // ===== Navigation Scroll Effect =====
  let lastScrollY = 0;

  function handleScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScrollY = scrollY;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  // ===== SPA Routing =====
  function navigateTo(sectionId) {
    // Hide all sections
    allSections.forEach((section) => {
      section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      // Small delay to allow CSS transition
      requestAnimationFrame(() => {
        targetSection.classList.add('active');
        // Re-trigger animations
        requestAnimationFrame(() => {
          targetSection.style.opacity = '1';
          targetSection.style.transform = 'translateY(0)';
        });
      });
    }

    // Update nav links
    allNavLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.dataset.section === sectionId) {
        link.classList.add('active');
      }
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Close mobile menu
    closeMobileMenu();

    // Trigger scroll animations for the new section
    setTimeout(() => observeAnimations(), 100);
  }

  // ===== Nav Link Click Handlers =====
  allNavLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.dataset.section;
      window.location.hash = sectionId;
      navigateTo(sectionId);
    });
  });

  // Footer & Hero links
  footerLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.dataset.nav;
      window.location.hash = sectionId;
      navigateTo(sectionId);
    });
  });

  // ===== Hash Routing =====
  function handleHashChange() {
    const hash = window.location.hash.replace('#', '') || 'home';
    navigateTo(hash);
  }

  window.addEventListener('hashchange', handleHashChange);

  // ===== Mobile Menu =====
  function closeMobileMenu() {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
  }

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('open');
  });

  // Close mobile menu when clicking a link
  allNavLinks.forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close mobile menu on outside click
  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
      closeMobileMenu();
    }
  });

  // ===== Scroll Animations (Intersection Observer) =====
  function observeAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll:not(.visible)');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px',
        }
      );

      elements.forEach((el) => observer.observe(el));
    } else {
      // Fallback: show all
      elements.forEach((el) => el.classList.add('visible'));
    }
  }

  // ===== Experiment Tab Switching =====
  const expTabs = document.querySelectorAll('.experiment__tab');
  const expPanels = document.querySelectorAll('.experiment__panel');

  expTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.expTab;

      expTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      expPanels.forEach((panel) => {
        panel.classList.remove('active');
        if (panel.id === `panel-${targetTab}`) {
          panel.classList.add('active');
        }
      });
    });
  });

  // ===== Initialize =====
  function init() {
    handleScroll();
    handleHashChange();
    observeAnimations();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

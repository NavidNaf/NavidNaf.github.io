const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.getElementById('site-nav');
const backToTop = document.getElementById('back-to-top');
const form = document.getElementById('contact-form');
const serviceTabs = Array.from(document.querySelectorAll('[data-service-tab]'));
const servicesContext = document.getElementById('services-context');
const servicePanels = Array.from(document.querySelectorAll('[data-service-panel]'));

if (navToggle && header) {
  navToggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

if (siteNav) {
  siteNav.addEventListener('click', (event) => {
    const target = event.target;
    if (target.tagName === 'A' && header.classList.contains('nav-open')) {
      header.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

window.addEventListener('scroll', () => {
  if (!backToTop) return;
  if (window.scrollY > 400) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
});

const revealItems = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealItems.forEach((item) => observer.observe(item));

if (serviceTabs.length && servicesContext) {
  const serviceCopy = {
    consultation: 'Advisory, assessment, and strategic guidance for organizations seeking stronger security architecture, risk clarity, and long-term resilience.',
    training: 'Knowledge sharing, skill building, and structured learning programs designed to develop practical expertise and security awareness.'
  };

  const setServiceTab = (tabKey) => {
    serviceTabs.forEach((tab) => {
      const isActive = tab.dataset.serviceTab === tabKey;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    servicePanels.forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.servicePanel === tabKey);
    });

    servicesContext.textContent = serviceCopy[tabKey] || serviceCopy.consultation;
  };

  serviceTabs.forEach((tab) => {
    tab.addEventListener('click', () => setServiceTab(tab.dataset.serviceTab));
  });

  setServiceTab('consultation');
}

const notableSlider = document.querySelector('.notable-slider');
if (notableSlider) {
  const slides = Array.from(notableSlider.querySelectorAll('.notable-slide'));
  const dots = Array.from(notableSlider.querySelectorAll('.notable-dot'));
  const prevBtn = notableSlider.querySelector('[data-notable-prev]');
  const nextBtn = notableSlider.querySelector('[data-notable-next]');
  let currentIndex = 0;

  const renderSlide = (index) => {
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === index);
      slide.setAttribute('aria-hidden', slideIndex === index ? 'false' : 'true');
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === index);
    });
  };

  const goTo = (index) => {
    currentIndex = (index + slides.length) % slides.length;
    renderSlide(currentIndex);
  };

  if (prevBtn) {
    prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => goTo(currentIndex + 1));
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goTo(index));
  });

  renderSlide(currentIndex);
}

if (form) {
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');
  const success = document.getElementById('form-success');

  const showError = (input, errorEl, message) => {
    errorEl.textContent = message;
    input.setAttribute('aria-invalid', 'true');
  };

  const clearError = (input, errorEl) => {
    errorEl.textContent = '';
    input.removeAttribute('aria-invalid');
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    let valid = true;

    if (!nameInput.value.trim()) {
      showError(nameInput, nameError, 'Please enter your name.');
      valid = false;
    } else {
      clearError(nameInput, nameError);
    }

    const emailValue = emailInput.value.trim();
    if (!emailValue) {
      showError(emailInput, emailError, 'Please enter your email.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      showError(emailInput, emailError, 'Please enter a valid email address.');
      valid = false;
    } else {
      clearError(emailInput, emailError);
    }

    if (!messageInput.value.trim()) {
      showError(messageInput, messageError, 'Please enter a message.');
      valid = false;
    } else {
      clearError(messageInput, messageError);
    }

    if (valid) {
      success.textContent = 'Thanks for reaching out. I will respond within 2 business days.';
      form.reset();
    } else {
      success.textContent = '';
    }
  });
}

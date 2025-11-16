const themeToggle = document.getElementById('theme-toggle');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const contactForm = document.getElementById('contact-form');

(function setupThemeToggle() {
  // safe getter for stored theme
  function getStoredTheme() {
    try { return localStorage.getItem('theme'); } catch (e) { return null; }
  }

  function setStoredTheme(value) {
    try { localStorage.setItem('theme', value); } catch (e) { /* ignore */ }
  }

  function applyTheme(theme) {
    if (!theme) return;
    document.documentElement.setAttribute('data-theme', theme);
    // update icon inside the toggle button if present
    if (themeToggle) {
      themeToggle.innerHTML = `<i class="fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>`;
      themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }
  }

  // determine initial theme: stored -> prefers-color-scheme -> default light
  let theme = getStoredTheme();
  if (!theme) {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme = prefersDark ? 'dark' : 'light';
  }

  applyTheme(theme);

  // expose a toggle function
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setStoredTheme(next);
  }

  // attach listener only if the button exists
  if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      toggleTheme();
    });
  }

  // update theme if user changes system preference while page is open
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener?.('change', (e) => {
      // only apply system change when user hasn't explicitly set a theme
      if (!getStoredTheme()) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
})();

hamburger.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  hamburger.classList.toggle('active');
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
    hamburger.classList.remove('active');
  });
});

window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 50) {
    navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
  } else {
    navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  }

  let current = '';
  const sections = document.querySelectorAll('section');
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (scrollY >= sectionTop - 200) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href').substring(1) === current) {
      link.classList.add('active');
    }
  });
});

async function loadProjects() {
  const projectsGrid = document.getElementById('projects-grid');
  if (!projectsGrid) return;

  // built-in fallback (used if fetch fails or when opened via file://)
  const localFallback = [
    {
      title: "Sombuilder Marketplace",
      description: "A marketplace platform for local artisans with product listings, carts and payment integrations.",
      image: "./images/project-sombuilder.jpg",
      github_url: "https://github.com/jimcaale/sombuilder-marketplace",
      demo_url: "https://sombuilder.example.com",
      tech_stack: "Node.js,Express,MySQL,Stripe"
    },
    {
      title: "AI Chat Assistant",
      description: "Conversational AI assistant for small businesses; supports FAQ, order tracking and simple automations.",
      image: "./images/project-ai-chat.jpg",
      github_url: "https://github.com/jimcaale/ai-chat-assistant",
      demo_url: "https://chat.jimcaale.ai",
      tech_stack: "Python,Flask,TensorFlow"
    },
    {
      title: "Portfolio CMS",
      description: "Lightweight content manager to update portfolio content and publish project case studies without redeploys.",
      image: "./images/project-cms.jpg",
      github_url: "https://github.com/jimcaale/portfolio-cms",
      demo_url: "https://cms.jimcaale.dev",
      tech_stack: "React,Node.js,SQLite"
    },
    {
      title: "Trading Bot",
      description: "Automated trading bot prototype with signal generation and backtesting tools.",
      image: "./images/project-trading.jpg",
      github_url: "https://github.com/jimcaale/trading-bot",
      demo_url: "",
      tech_stack: "Python,Pandas,TA-Lib"
    }
  ];

  projectsGrid.innerHTML = '<div class="loading">Loading projects...</div>';

  // Try local JSON first (works when served). If that fails, use fallback.
  try {
    let projects = null;

    // If running via a server, try server API first
    if (window.location.protocol !== 'file:') {
      try {
        const apiRes = await fetch('/api/projects', { cache: 'no-store' });
        if (apiRes.ok) {
          const apiJson = await apiRes.json();
          projects = Array.isArray(apiJson) ? apiJson : (apiJson.projects || apiJson.data || []);
        }
      } catch (e) {
        // ignore - will try local file next
      }
    }

    // If no API projects, try local data/projects.json
    if (!projects || projects.length === 0) {
      try {
        const localRes = await fetch('./data/projects.json', { cache: 'no-store' });
        if (localRes.ok) {
          const localJson = await localRes.json();
          projects = Array.isArray(localJson) ? localJson : (localJson.projects || []);
        }
      } catch (e) {
        // fetch may fail for file:// or CORS; fallback will be used
        projects = null;
      }
    }

    if (!projects || projects.length === 0) {
      projects = localFallback;
    }

    // render
    projectsGrid.innerHTML = projects.map(p => {
      const techs = (p.tech_stack || p.techStack || p.tech || '').split(',').map(t => t.trim()).filter(Boolean);
      return `
        <article class="project-card">
          <a href="${p.demo_url || p.url || '#'}" target="_blank" rel="noopener">
            <div class="project-thumb">
              ${p.image ? `<img src="${p.image}" alt="${escapeHtml(p.title || 'Project')}">` : '<div class="project-placeholder"><i class="fas fa-code"></i></div>'}
            </div>
            <div class="project-info">
              <h3>${escapeHtml(p.title)}</h3>
              <p>${escapeHtml(p.description || '')}</p>
              <div class="project-tech">${techs.map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}</div>
              <div class="project-links">
                ${p.github_url ? `<a class="project-link github" href="${p.github_url}" target="_blank" rel="noopener"><i class="fab fa-github"></i></a>` : ''}

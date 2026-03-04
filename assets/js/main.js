function showSection(id) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.classList.remove('active');
  });

  const targetSection = document.getElementById(id);
  const targetTab = document.getElementById('tab-' + id);
  if (targetSection) targetSection.classList.add('active');
  if (targetTab) targetTab.classList.add('active');
  window.scrollTo({ top: 0, behavior: "smooth" });
}

(function markActiveTopNav() {
  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('[data-topnav]').forEach(link => {
    if (link.getAttribute('href').toLowerCase() === current) {
      link.classList.add('active');
    }
  });
})();

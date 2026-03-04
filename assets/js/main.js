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
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

(function markActiveTopNav() {
  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('[data-topnav]').forEach(link => {
    if (link.getAttribute('href').toLowerCase() === current) link.classList.add('active');
  });
})();

async function loadContentData() {
  const res = await fetch('data/content.json');
  if (!res.ok) throw new Error('Kunne ikke laste data/content.json');
  return res.json();
}

async function initCalendarPage() {
  const root = document.getElementById('calendar-root');
  if (!root) return;

  try {
    const data = await loadContentData();
    const { month, weeks, holidayNote } = data.calendar;
    document.getElementById('calendar-month').textContent = month;

    root.innerHTML = weeks.map(week => `
      <section class="bg-white border rounded-xl p-4">
        <h3 class="font-semibold mb-3 text-gray-700">${week.label}</h3>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          ${week.sessions.map(s => `
            <article class="border rounded-lg p-3 bg-gray-50">
              <div class="font-bold text-nff-blue">${s.day}</div>
              <div class="text-xs text-gray-500">${s.duration}</div>
              <div class="text-sm mt-1"><strong>${s.theme}</strong></div>
              <div class="text-xs text-gray-600 mt-1">${s.focus}</div>
            </article>
          `).join('')}
        </div>
      </section>
    `).join('');

    document.getElementById('holiday-note').textContent = holidayNote;
  } catch (e) {
    root.innerHTML = `<p class="text-red-700">Feil ved lasting av kalenderdata: ${e.message}</p>`;
  }
}

async function initExercisesPage() {
  const list = document.getElementById('exercise-list');
  if (!list) return;

  const phaseFilter = document.getElementById('phase-filter');
  const ageFilter = document.getElementById('age-filter');
  const searchInput = document.getElementById('exercise-search');
  const countLabel = document.getElementById('exercise-count');

  try {
    const data = await loadContentData();
    const exercises = data.exercises;

    const phases = [...new Set(exercises.map(e => e.phase))];
    phases.forEach(phase => {
      const opt = document.createElement('option');
      opt.value = phase;
      opt.textContent = phase;
      phaseFilter.appendChild(opt);
    });

    function render() {
      const p = phaseFilter.value;
      const a = ageFilter.value;
      const q = (searchInput?.value || '').trim().toLowerCase();
      const filtered = exercises.filter(e =>
        (p === 'all' || e.phase === p) &&
        (a === 'all' || e.age.includes(a)) &&
        (q === '' || `${e.name} ${e.objective}`.toLowerCase().includes(q))
      );

      if (countLabel) countLabel.textContent = `Viser ${filtered.length} av ${exercises.length} øvelser`;

      list.innerHTML = filtered.map(e => `
        <article class="bg-white border rounded-xl p-4">
          <a class="text-nff-blue underline font-medium" target="_blank" href="${e.url}">${e.name}</a>
          <div class="text-xs text-gray-600 mt-2">Fase: ${e.phase} · Spillere: ${e.players} · Bane: ${e.field} · Alder: ${e.age}</div>
          <div class="text-sm text-gray-700 mt-1">Mål: ${e.objective}</div>
        </article>
      `).join('') || '<p class="text-gray-500">Ingen øvelser matcher filteret.</p>';
    }

    phaseFilter.addEventListener('change', render);
    ageFilter.addEventListener('change', render);
    if (searchInput) searchInput.addEventListener('input', render);
    render();
  } catch (e) {
    list.innerHTML = `<p class="text-red-700">Feil ved lasting av øktdata: ${e.message}</p>`;
  }
}

initCalendarPage();
initExercisesPage();

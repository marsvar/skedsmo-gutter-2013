import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rammeverk – Skedsmo Fotball 2013',
}

export default function ReferansePage() {
  return (
    <div className="space-y-8 pb-4">

      {/* ── NFF SPILLMODELL ─────────────────────────────────── */}
      <section>
        <h1 className="text-xl font-bold mb-0.5" style={{ color: '#f9fafb' }}>NFF Spillmodell</h1>
        <p className="text-sm mb-5" style={{ color: '#9ca3af' }}>
          Seks faser som strukturerer all temabasert treningsplanlegging fra 10 år og oppover.
        </p>

        {/* Angrep */}
        <h2 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: '#fb923c' }}>
          Angrep (A)
        </h2>
        <div className="space-y-2 mb-5">
          <div className="rounded-xl p-3" style={{ background: '#111111', borderLeft: '3px solid #eab308' }}>
            <p className="font-bold text-sm" style={{ color: '#fde68a' }}>A1 – Behandle/vinne ballen og spille fremover</p>
            <p className="text-xs mt-1" style={{ color: '#fcd34d' }}>
              Vinner ballen og spiller raskt fremover. Mottak under press, pasninger i dybden, omstilling til angrep.
            </p>
          </div>
          <div className="rounded-xl p-3" style={{ background: '#111111', borderLeft: '3px solid #f97316' }}>
            <p className="font-bold text-sm" style={{ color: '#fdba74' }}>A2 – Komme til prioritert rom</p>
            <p className="text-xs mt-1" style={{ color: '#fb923c' }}>
              Løpsveier, tredjemann-kombinasjoner, timing for å komme til farlige rom bak forsvaret.
            </p>
          </div>
          <div className="rounded-xl p-3" style={{ background: '#111111', borderLeft: '3px solid #c6180e' }}>
            <p className="font-bold text-sm" style={{ color: '#fca5a5' }}>A3 – Avgjøre / score mål</p>
            <p className="text-xs mt-1" style={{ color: '#f87171' }}>
              Avslutning, 1v1 mot keeper, heading, skudd under press, spill i boksen.
            </p>
          </div>
        </div>

        {/* Forsvar */}
        <h2 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: '#60a5fa' }}>
          Forsvar (F)
        </h2>
        <div className="space-y-2 mb-6">
          <div className="rounded-xl p-3" style={{ background: '#111111', borderLeft: '3px solid #0ea5e9' }}>
            <p className="font-bold text-sm" style={{ color: '#7dd3fc' }}>F1 – Presse, lede og kontrollere</p>
            <p className="text-xs mt-1" style={{ color: '#38bdf8' }}>
              Organisert pressing. Triggere for å starte press, lede motspiller til ufarlig side.
            </p>
          </div>
          <div className="rounded-xl p-3" style={{ background: '#111111', borderLeft: '3px solid #6366f1' }}>
            <p className="font-bold text-sm" style={{ color: '#a5b4fc' }}>F2 – Sperre prioritert rom</p>
            <p className="text-xs mt-1" style={{ color: '#818cf8' }}>
              Blokkere rom mellom linjene, sperre pasningslinjer inn i senter og bak forsvarslinja.
            </p>
          </div>
          <div className="rounded-xl p-3" style={{ background: '#111111', borderLeft: '3px solid #a855f7' }}>
            <p className="font-bold text-sm" style={{ color: '#d8b4fe' }}>F3 – Hindre avslutning og mål</p>
            <p className="text-xs mt-1" style={{ color: '#c084fc' }}>
              Blokkere skudd, heading i boks, keeper-samarbeid, klarering.
            </p>
          </div>
        </div>

        {/* NFF session structure */}
        <div className="rounded-xl p-4 mb-4" style={{ background: '#111111', border: '1px solid #1f2937' }}>
          <p className="font-semibold text-sm mb-3" style={{ color: '#f3f4f6' }}>Anbefalt øktstruktur (NFF)</p>
          <div className="flex rounded-lg overflow-hidden h-8 mb-3 text-white text-xs font-bold">
            <div className="bg-green-500 flex items-center justify-center" style={{ width: '25%' }}>Prepp 25%</div>
            <div className="bg-yellow-400 flex items-center justify-center" style={{ width: '25%' }}>Situasjon 25%</div>
            <div className="bg-orange-500 flex items-center justify-center" style={{ width: '50%' }}>Kampspill 50%</div>
          </div>
          <ul className="text-xs space-y-1.5" style={{ color: '#d1d5db' }}>
            <li><strong>Prepp (25%)</strong> – Ballmestring, aktivering, oppvarming med tematisk vinkling</li>
            <li><strong>Spillsituasjoner (25%)</strong> – Isolerte øvelser direkte på temaet (f.eks. 3v2, pressinggrid)</li>
            <li><strong>Kamptilpasset spill (50%)</strong> – Spill med mål der temaet er i fokus</li>
          </ul>
        </div>

        {/* NFF vision */}
        <div className="bg-nff-blue text-white rounded-xl p-4">
          <p className="font-bold mb-1">NFF-visjon: «Fotball for alle»</p>
          <p className="text-xs opacity-90 mb-3">
            «Flest mulig – lengst mulig – best mulig» i et trygt og utviklende miljø.
          </p>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <p className="font-semibold mb-0.5">Mestring</p>
              <p className="opacity-75">Fokus på mestring fremfor kortsiktige resultater. Barn som opplever mestring fortsetter lenger.</p>
            </div>
            <div>
              <p className="font-semibold mb-0.5">Differensiering</p>
              <p className="opacity-75">Dynamisk differensiering innad i økt – aldri faste ferdighetsdelte grupper (t.o.m. 13 år).</p>
            </div>
            <div>
              <p className="font-semibold mb-0.5">Rød tråd</p>
              <p className="opacity-75">Én tydelig tematisk rød tråd gjennom hele treningsøkta for best mulig læringsutbytte.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TROPP & GRUPPER ──────────────────────────────────── */}
      <section>
        <h1 className="text-xl font-bold mb-0.5" style={{ color: '#f9fafb' }}>Ukesmal &amp; Gruppeinndeling</h1>
        <p className="text-sm mb-5" style={{ color: '#9ca3af' }}>
          20–30 spillere · 4 treningsdager per uke: man / tirs / tors / lør
        </p>

        {/* Group split */}
        <div className="rounded-xl p-4 mb-5" style={{ background: '#111111', border: '1px solid #1f2937' }}>
          <p className="font-semibold text-sm mb-3" style={{ color: '#f3f4f6' }}>Inndeling av troppen</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: 'A', title: 'Gruppe A', desc: '7–10 spillere\nHøyest teknisk nivå', border: '#c6180e', badge: 'bg-red-700 text-white' },
              { label: 'B', title: 'Gruppe B', desc: '7–10 spillere\nMidtre nivå', border: '#d97706', badge: 'bg-yellow-600 text-white' },
              { label: 'C', title: 'Gruppe C', desc: '6–10 spillere\nTrenger mer tid og rom', border: '#0d9488', badge: 'bg-teal-700 text-white' },
            ].map((g) => (
              <div key={g.label} className="rounded-xl p-3 text-center" style={{ background: '#1a1a1a', border: `1px solid ${g.border}` }}>
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-lg font-black mb-1 ${g.badge}`}>
                  {g.label}
                </div>
                <p className="font-semibold text-xs" style={{ color: '#e5e7eb' }}>{g.title}</p>
                <p className="text-xs mt-0.5 whitespace-pre-line" style={{ color: '#9ca3af' }}>{g.desc}</p>
              </div>
            ))}
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="rounded-lg p-2.5" style={{ background: '#1f2937' }}>
              <span className="font-medium" style={{ color: '#e5e7eb' }}>20–22 fremmøtte:</span>
              <span style={{ color: '#9ca3af' }}> Slå B og C sammen → gruppe B/C (~10–12 spillere)</span>
            </div>
            <div className="rounded-lg p-2.5" style={{ background: '#1f2937' }}>
              <span className="font-medium" style={{ color: '#e5e7eb' }}>23–30 fremmøtte:</span>
              <span style={{ color: '#9ca3af' }}> Kjør A, B og C separat</span>
            </div>
          </div>
          <p className="text-xs mt-2" style={{ color: '#6b7280' }}>
            Oppstart er alltid felles (rondo + sjef over ballen). Grupper splittes først til temaøvelsen.
          </p>
        </div>

        {/* Fixed opening exercises */}
        <h2 className="font-bold text-sm mb-2" style={{ color: '#f3f4f6' }}>
          Faste åpningsøvelser{' '}
          <span className="font-normal" style={{ color: '#6b7280' }}>(uansett tema – hele troppen samlet)</span>
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 mb-6">

          {/* Rondo */}
          <div className="bg-nff-blue text-white rounded-xl p-4">
            <p className="font-bold mb-0.5">
              1. Rondo{' '}
              <span className="text-blue-200 text-xs font-normal">10 min alltid</span>
            </p>
            <p className="text-blue-100 text-xs mb-3">
              4–6 grupper av 5–6. Format endres ikke midt i sesongen.
            </p>
            <div className="space-y-1.5 text-xs">
              {[
                { period: 'Apr–mai', format: '4v2', desc: 'Bli kjent, korte pasninger' },
                { period: 'Jun–aug', format: '5v2', desc: 'Mer rom, pasningsvariasjon' },
                { period: 'Sep–okt', format: '6v3', desc: 'Høy intensitet, beslutningshurtighet' },
              ].map((r) => (
                <div key={r.period} className="flex gap-2 items-start">
                  <span className="bg-blue-700 text-blue-100 px-1.5 py-0.5 rounded text-xs shrink-0">{r.period}</span>
                  <span><strong>{r.format}</strong> – {r.desc}</span>
                </div>
              ))}
            </div>
            <p className="text-blue-200 text-xs mt-3">
              Maks 2 berøringer. Frigjøringspassning = rollbytte for tapende innenspiller.
            </p>
          </div>

          {/* Sjef over ballen */}
          <div className="rounded-xl p-4" style={{ background: '#111111', border: '1px solid #1f2937' }}>
            <p className="font-bold mb-0.5" style={{ color: '#f3f4f6' }}>
              2. Sjef over ballen{' '}
              <span className="text-xs font-normal" style={{ color: '#6b7280' }}>10 min alltid</span>
            </p>
            <p className="text-xs mb-3" style={{ color: '#9ca3af' }}>
              Individuell ballmestring. <strong>Samme øvelse hele uka</strong> (man/tirs/tors), roterer på 4-ukers syklus.
            </p>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ color: '#6b7280', borderBottom: '1px solid #1f2937' }}>
                    <th className="text-left pb-1 px-1">Uke</th>
                    <th className="text-left pb-1 px-1">Øvelse</th>
                    <th className="text-left pb-1 px-1">Eksempel</th>
                  </tr>
                </thead>
                <tbody style={{ color: '#d1d5db' }}>
                  {[
                    { week: 'Uke 1', drill: 'Pasning & mottak', ex: 'Par, 1–2 berøringer, veksle fot' },
                    { week: 'Uke 2', drill: 'Dribbling & vendinger', ex: 'Cruyff, rolling, cuts – kurs' },
                    { week: 'Uke 3', drill: '1v1 dueller', ex: 'Par: en fører, en presser passivt → aktivt' },
                    { week: 'Uke 4', drill: 'Fri ballmestring', ex: 'Spillerne velger selv' },
                  ].map((r) => (
                    <tr key={r.week} style={{ borderBottom: '1px solid #1f2937' }}>
                      <td className="py-1.5 px-1 font-medium">{r.week}</td>
                      <td className="py-1.5 px-1">{r.drill}</td>
                      <td className="py-1.5 px-1" style={{ color: '#6b7280' }}>{r.ex}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 4-day weekly template */}
        <h2 className="font-bold text-sm mb-1" style={{ color: '#f3f4f6' }}>
          4-dagers ukesmal{' '}
          <span className="font-normal" style={{ color: '#6b7280' }}>(innenfor én temaperiode)</span>
        </h2>
        <p className="text-xs mb-3" style={{ color: '#9ca3af' }}>
          Temaøvelsen er <strong>den samme alle fire dagene</strong> – variasjonen er progresjon, ikke bytte av øvelse.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-6">
          {[
            {
              day: 'Mandag', color: 'border-[#1e2d3d]', header: 'bg-blue-600 text-white',
              items: [
                { time: '10 min', name: 'Rondo', note: 'Hele troppen' },
                { time: '10 min', name: 'Sjef over ballen', note: 'Hele troppen' },
                { time: '30 min', name: 'Temaøvelse', note: 'Ingen motstand' },
                { time: '35 min', name: 'Kamptilpasset spill', note: 'Regel fremhever tema' },
                { time: '5 min', name: 'Oppsummering', note: '' },
              ],
            },
            {
              day: 'Tirsdag', color: 'border-[#1a2e1e]', header: 'bg-green-600 text-white',
              items: [
                { time: '10 min', name: 'Rondo', note: 'Hele troppen' },
                { time: '10 min', name: 'Sjef over ballen', note: 'Hele troppen' },
                { time: '30 min', name: 'Temaøvelse', note: 'Aktiv motstand' },
                { time: '35 min', name: 'Kamptilpasset spill', note: '' },
                { time: '5 min', name: 'Oppsummering', note: '' },
              ],
            },
            {
              day: 'Torsdag', color: 'border-[#2e1e0a]', header: 'bg-orange-500 text-white',
              items: [
                { time: '10 min', name: 'Rondo', note: 'Hele troppen' },
                { time: '10 min', name: 'Sjef over ballen', note: 'Hele troppen' },
                { time: '25 min', name: 'Temaøvelse', note: 'Full motstand' },
                { time: '30 min', name: '9v9 / 11v11', note: 'Tema i fokus' },
                { time: '5 min', name: 'Oppsummering', note: '' },
                { time: '20 min', name: 'RRR', note: 'Ansvarlig trener' },
              ],
            },
            {
              day: 'Lørdag', color: 'border-[#1e1330]', header: 'bg-purple-600 text-white',
              items: [
                { time: '10 min', name: 'Rondo', note: 'Hele troppen' },
                { time: '10 min', name: 'Lagsamtale', note: 'Ukas tema' },
                { time: '', name: 'Kamp / mini-turnering', note: 'Mye spill, lite venting' },
              ],
            },
          ].map((col) => (
            <div key={col.day} className={`border rounded-xl overflow-hidden ${col.color}`}>
              <div className={`px-3 py-2 text-xs font-bold ${col.header}`}>{col.day}</div>
              <div className="px-2 py-2 space-y-1.5" style={{ background: '#111111' }}>
                {col.items.map((item) => (
                  <div key={item.name} className="text-xs">
                    {item.time && <span style={{ color: '#6b7280' }}>{item.time} </span>}
                    <span className="font-medium" style={{ color: '#f3f4f6' }}>{item.name}</span>
                    {item.note && <span style={{ color: '#6b7280' }}> · {item.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 3-week block progression */}
        <h2 className="font-bold text-sm mb-2" style={{ color: '#f3f4f6' }}>
          3-ukers temablokk{' '}
          <span className="font-normal" style={{ color: '#6b7280' }}>(progresjon innenfor ett tema)</span>
        </h2>
        <div className="space-y-2 mb-6">
          {[
            {
              week: 'Uke 1', label: 'Bli kjent',
              border: '#3b82f6', bg: '#0c1a3a',
              desc: 'Ingen motstand. Lær bevegelsesmønsteret. Mye repetisjon, lav stress. Introduser øvelsen uten å stoppe for mye.'
            },
            {
              week: 'Uke 2', label: 'Øk presset',
              border: '#eab308', bg: '#1a1200',
              desc: 'Aktiv motstand, smalere rom, høyere tempo. Spillerne begynner å ta beslutninger under press. Øvelsen er den samme.'
            },
            {
              week: 'Uke 3', label: 'Integrasjon',
              border: '#f97316', bg: '#1a0a00',
              desc: 'Full motstand og konkurransepreg. Temaet dukker naturlig opp i spillfasen. Treningsfokus flyttes til kampspillet.'
            },
          ].map((w) => (
            <div key={w.week} className="rounded-xl p-3" style={{ background: w.bg, borderLeft: `3px solid ${w.border}` }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${w.border}30`, color: w.border }}>{w.week}</span>
                <span className="font-semibold text-sm" style={{ color: '#f3f4f6' }}>{w.label}</span>
              </div>
              <p className="text-xs" style={{ color: '#9ca3af' }}>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── LENKER ──────────────────────────────────────────── */}
      <section>
        <h1 className="text-xl font-bold mb-3" style={{ color: '#f9fafb' }}>Ressurser</h1>
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #1f2937' }}>
          {[
            { label: 'tiim.no – øvelsesbank', url: 'https://tiim.no/okter-og-ovelser' },
            { label: 'Landslagsskolens øvelsesbank', url: 'https://tiim.no/artikkel/landslagsskolens-ovelsesbank' },
            { label: 'NFF retningslinjer – barn og ungdom', url: 'https://www.fotball.no/barn-og-ungdom/retningslinjer-for-barne--og-ungdomsfotball/' },
            { label: 'NFF sportsplan 13–16', url: 'https://www.fotball.no/barn-og-ungdom/sportsplaner/sportsplan-13-16/okter-og-ovelser/' },
            { label: 'NFF landslagsskolen', url: 'https://www.fotball.no/barn-og-ungdom/sportsplaner/landslagsskolen/' },
          ].map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-[#1f2937]"
              style={{ borderBottom: '1px solid #1f2937', color: '#d1d5db' }}
            >
              <span className="text-sm">{link.label}</span>
              <span className="text-sm" style={{ color: '#6b7280' }}>↗</span>
            </a>
          ))}
        </div>
      </section>

    </div>
  )
}

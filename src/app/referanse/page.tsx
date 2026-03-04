import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rammeverk – Skedsmo Fotball 2013',
}

export default function ReferansePage() {
  return (
    <div className="space-y-8 pb-4">

      {/* ── NFF SPILLMODELL ─────────────────────────────────── */}
      <section>
        <h1 className="text-xl font-bold text-gray-900 mb-0.5">NFF Spillmodell</h1>
        <p className="text-sm text-gray-500 mb-5">
          Seks faser som strukturerer all temabasert treningsplanlegging fra 10 år og oppover.
        </p>

        {/* Angrep */}
        <h2 className="text-sm font-bold text-orange-700 uppercase tracking-wide mb-2">
          Angrep (A)
        </h2>
        <div className="space-y-2 mb-5">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <p className="font-bold text-yellow-800 text-sm">A1 – Behandle/vinne ballen og spille fremover</p>
            <p className="text-xs text-yellow-700 mt-1">
              Vinner ballen og spiller raskt fremover. Mottak under press, pasninger i dybden, omstilling til angrep.
            </p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
            <p className="font-bold text-orange-800 text-sm">A2 – Komme til prioritert rom</p>
            <p className="text-xs text-orange-700 mt-1">
              Løpsveier, tredjemann-kombinasjoner, timing for å komme til farlige rom bak forsvaret.
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="font-bold text-red-800 text-sm">A3 – Avgjøre / score mål</p>
            <p className="text-xs text-red-700 mt-1">
              Avslutning, 1v1 mot keeper, heading, skudd under press, spill i boksen.
            </p>
          </div>
        </div>

        {/* Forsvar */}
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-2">
          Forsvar (F)
        </h2>
        <div className="space-y-2 mb-6">
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-3">
            <p className="font-bold text-sky-800 text-sm">F1 – Presse, lede og kontrollere</p>
            <p className="text-xs text-sky-700 mt-1">
              Organisert pressing. Triggere for å starte press, lede motspiller til ufarlig side.
            </p>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
            <p className="font-bold text-indigo-800 text-sm">F2 – Sperre prioritert rom</p>
            <p className="text-xs text-indigo-700 mt-1">
              Blokkere rom mellom linjene, sperre pasningslinjer inn i senter og bak forsvarslinja.
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
            <p className="font-bold text-purple-800 text-sm">F3 – Hindre avslutning og mål</p>
            <p className="text-xs text-purple-700 mt-1">
              Blokkere skudd, heading i boks, keeper-samarbeid, klarering.
            </p>
          </div>
        </div>

        {/* NFF session structure */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
          <p className="font-semibold text-gray-800 text-sm mb-3">Anbefalt øktstruktur (NFF)</p>
          <div className="flex rounded-lg overflow-hidden h-8 mb-3 text-white text-xs font-bold">
            <div className="bg-green-500 flex items-center justify-center" style={{ width: '25%' }}>Prepp 25%</div>
            <div className="bg-yellow-400 flex items-center justify-center" style={{ width: '25%' }}>Situasjon 25%</div>
            <div className="bg-orange-500 flex items-center justify-center" style={{ width: '50%' }}>Kampspill 50%</div>
          </div>
          <ul className="text-xs text-gray-600 space-y-1.5">
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
        <h1 className="text-xl font-bold text-gray-900 mb-0.5">Ukesmal & Gruppeinndeling</h1>
        <p className="text-sm text-gray-500 mb-5">
          20–30 spillere · 4 treningsdager per uke: man / tirs / tors / lør
        </p>

        {/* Group split */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
          <p className="font-semibold text-gray-800 text-sm mb-3">Inndeling av troppen</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: 'A', title: 'Gruppe A', desc: '7–10 spillere\nMinst rom, mest press, maks 2 touch', bg: 'bg-red-50 border-red-200', text: 'text-red-700', badge: 'bg-red-700 text-white' },
              { label: 'B', title: 'Gruppe B', desc: '7–10 spillere\nStandard versjon', bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-600 text-white' },
              { label: 'C', title: 'Gruppe C', desc: '6–10 spillere\nMer rom, færre forsvarere, frie touch', bg: 'bg-green-50 border-green-200', text: 'text-green-700', badge: 'bg-green-700 text-white' },
            ].map((g) => (
              <div key={g.label} className={`border rounded-xl p-3 text-center ${g.bg}`}>
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-lg font-black mb-1 ${g.badge}`}>
                  {g.label}
                </div>
                <p className={`font-semibold text-xs ${g.text}`}>{g.title}</p>
                <p className={`text-xs mt-0.5 whitespace-pre-line ${g.text} opacity-80`}>{g.desc}</p>
              </div>
            ))}
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="bg-gray-50 rounded-lg p-2.5">
              <span className="font-medium">20–22 fremmøtte:</span>
              <span className="text-gray-600"> Slå B og C sammen → gruppe B/C (~10–12 spillere)</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-2.5">
              <span className="font-medium">23–30 fremmøtte:</span>
              <span className="text-gray-600"> Kjør A, B og C separat</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Oppstart er alltid felles (rondo + sjef over ballen). Grupper splittes først til temaøvelsen.
          </p>
        </div>

        {/* Fixed opening exercises */}
        <h2 className="font-bold text-gray-800 text-sm mb-2">
          Faste åpningsøvelser{' '}
          <span className="font-normal text-gray-400">(uansett tema – hele troppen samlet)</span>
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
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="font-bold text-gray-800 mb-0.5">
              2. Sjef over ballen{' '}
              <span className="text-gray-400 text-xs font-normal">10 min alltid</span>
            </p>
            <p className="text-gray-500 text-xs mb-3">
              Individuell ballmestring. <strong>Samme øvelse hele uka</strong> (man/tirs/tors), roterer på 4-ukers syklus.
            </p>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100">
                    <th className="text-left pb-1 px-1">Uke</th>
                    <th className="text-left pb-1 px-1">Øvelse</th>
                    <th className="text-left pb-1 px-1">Eksempel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-700">
                  {[
                    { week: 'Uke 1', drill: 'Pasning & mottak', ex: 'Par, 1–2 berøringer, veksle fot' },
                    { week: 'Uke 2', drill: 'Dribbling & vendinger', ex: 'Cruyff, rolling, cuts – kurs' },
                    { week: 'Uke 3', drill: '1v1 dueller', ex: 'Par: en fører, en presser passivt → aktivt' },
                    { week: 'Uke 4', drill: 'Fri ballmestring', ex: 'Spillerne velger selv' },
                  ].map((r) => (
                    <tr key={r.week}>
                      <td className="py-1.5 px-1 font-medium">{r.week}</td>
                      <td className="py-1.5 px-1">{r.drill}</td>
                      <td className="py-1.5 px-1 text-gray-400">{r.ex}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 4-day weekly template */}
        <h2 className="font-bold text-gray-800 text-sm mb-1">
          4-dagers ukesmal{' '}
          <span className="font-normal text-gray-400">(innenfor én temaperiode)</span>
        </h2>
        <p className="text-xs text-gray-500 mb-3">
          Temaøvelsen er <strong>den samme alle fire dagene</strong> – variasjonen er progresjon, ikke bytte av øvelse.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-6">
          {[
            {
              day: 'Mandag', color: 'border-blue-200', header: 'bg-blue-600 text-white',
              items: [
                { time: '10 min', name: 'Rondo', note: 'Hele troppen' },
                { time: '10 min', name: 'Sjef over ballen', note: 'Hele troppen' },
                { time: '30 min', name: 'Temaøvelse', note: 'Ingen motstand' },
                { time: '35 min', name: 'Kamptilpasset spill', note: 'Regel fremhever tema' },
                { time: '5 min', name: 'Oppsummering', note: '' },
              ],
            },
            {
              day: 'Tirsdag', color: 'border-green-200', header: 'bg-green-600 text-white',
              items: [
                { time: '10 min', name: 'Rondo', note: 'Hele troppen' },
                { time: '10 min', name: 'Sjef over ballen', note: 'Hele troppen' },
                { time: '30 min', name: 'Temaøvelse', note: 'Aktiv motstand' },
                { time: '35 min', name: 'Kamptilpasset spill', note: '' },
                { time: '5 min', name: 'Oppsummering', note: '' },
              ],
            },
            {
              day: 'Torsdag', color: 'border-orange-200', header: 'bg-orange-500 text-white',
              items: [
                { time: '10 min', name: 'Rondo', note: 'Hele troppen' },
                { time: '10 min', name: 'Sjef over ballen', note: 'Hele troppen' },
                { time: '25 min', name: 'Temaøvelse', note: 'Full motstand' },
                { time: '30 min', name: '9v9 / 11v11', note: 'Tema i fokus' },
                { time: '5 min', name: 'Oppsummering', note: '' },
                { time: '20 min', name: 'RRR', note: 'Dedikert trener' },
              ],
            },
            {
              day: 'Lørdag', color: 'border-purple-200', header: 'bg-purple-600 text-white',
              items: [
                { time: '10 min', name: 'Rondo', note: 'Hele troppen' },
                { time: '10 min', name: 'Lagsamtale', note: 'Ukas tema' },
                { time: '', name: 'Kamp / mini-turnering', note: 'Mye spill, lite venting' },
              ],
            },
          ].map((col) => (
            <div key={col.day} className={`border rounded-xl overflow-hidden ${col.color}`}>
              <div className={`px-3 py-2 text-xs font-bold ${col.header}`}>{col.day}</div>
              <div className="px-2 py-2 space-y-1.5 bg-white">
                {col.items.map((item) => (
                  <div key={item.name} className="text-xs">
                    {item.time && <span className="text-gray-400">{item.time} </span>}
                    <span className="font-medium text-gray-800">{item.name}</span>
                    {item.note && <span className="text-gray-400"> · {item.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 3-week block progression */}
        <h2 className="font-bold text-gray-800 text-sm mb-2">
          3-ukers temablokk{' '}
          <span className="font-normal text-gray-400">(progresjon innenfor ett tema)</span>
        </h2>
        <div className="space-y-2 mb-6">
          {[
            {
              week: 'Uke 1', label: 'Bli kjent', color: 'bg-blue-50 border-blue-200 text-blue-800',
              badge: 'bg-blue-100 text-blue-700',
              desc: 'Ingen motstand. Lær bevegelsesmønsteret. Mye repetisjon, lav stress. Introduser øvelsen uten å stoppe for mye.'
            },
            {
              week: 'Uke 2', label: 'Øk presset', color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
              badge: 'bg-yellow-100 text-yellow-700',
              desc: 'Aktiv motstand, smalere rom, høyere tempo. Spillerne begynner å ta beslutninger under press. Øvelsen er den samme.'
            },
            {
              week: 'Uke 3', label: 'Integrasjon', color: 'bg-orange-50 border-orange-200 text-orange-800',
              badge: 'bg-orange-100 text-orange-700',
              desc: 'Full motstand og konkurransepreg. Temaet dukker naturlig opp i spillfasen. Coaching-fokus flyttes til kampspillet.'
            },
          ].map((w) => (
            <div key={w.week} className={`border rounded-xl p-3 ${w.color}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${w.badge}`}>{w.week}</span>
                <span className="font-semibold text-sm">{w.label}</span>
              </div>
              <p className="text-xs opacity-80">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── LENKER ──────────────────────────────────────────── */}
      <section>
        <h1 className="text-xl font-bold text-gray-900 mb-3">Ressurser</h1>
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
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
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-800">{link.label}</span>
              <span className="text-gray-400 text-sm">↗</span>
            </a>
          ))}
        </div>
      </section>

    </div>
  )
}

import { MatchCreateForm } from '@/components/admin/MatchCreateForm'

export const dynamic = 'force-dynamic'

export default function AdminMatchNewPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <a href="/admin/matches" className="text-sm text-white/40 hover:text-white/70 transition-colors">
          ← Tilbake til kamper
        </a>
        <h1 className="text-2xl font-bold text-white mt-2">Ny kamp</h1>
      </div>
      <MatchCreateForm />
    </div>
  )
}

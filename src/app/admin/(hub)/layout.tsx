export const dynamic = 'force-dynamic'

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      {children}
    </div>
  )
}

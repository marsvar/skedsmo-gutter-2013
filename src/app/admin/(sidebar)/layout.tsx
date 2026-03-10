import { createSupabaseServerClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen bg-[#0b0b0b] text-white">
      <AdminSidebar email={user?.email} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

export const dynamic = 'force-dynamic'
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ notifications: [] })
  const supabase = createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', userId)
    .single()
  if (!profile) return NextResponse.json({ notifications: [] })
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
  return NextResponse.json({ notifications: data || [] })
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const supabase = createClient()
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
  return NextResponse.json({ success: true })
}

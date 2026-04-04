export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { password } = await request.json()
  
  const valid = [
    'gravitas_admin_2024',
    'clauhire_admin_2024',
    'clauhire@2025',
    process.env.ADMIN_SECRET
  ].includes(password)
  
  if (valid) {
    return NextResponse.json({ success: true })
  }
  return NextResponse.json(
    { success: false },
    { status: 401 }
  )
}

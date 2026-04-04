export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { email, amount, secret } = 
      await request.json()
    
    const validSecret = 
      secret === 'gravitas_admin_2024' ||
      secret === 'clauhire_admin_2024' ||
      secret === 'clauhire@2025' ||
      secret === process.env.ADMIN_SECRET
    
    if (!validSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // MUST use service role to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get all profiles to find by email
    const { data: allProfiles, error: fetchError } = 
      await supabase
        .from('profiles')
        .select('id, email, full_name, hiries_balance')
    
    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      )
    }

    // Find profile by email (case insensitive)
    const profile = allProfiles?.find(p =>
      p.email?.toLowerCase().trim() ===
      email.toLowerCase().trim()
    )

    if (!profile) {
      return NextResponse.json({
        error: 'User not found',
        available_emails: allProfiles?.map(p => p.email)
      }, { status: 404 })
    }

    const newBalance = 
      (profile.hiries_balance || 0) + Number(amount)

    await supabase
      .from('profiles')
      .update({ hiries_balance: newBalance })
      .eq('id', profile.id)

    await supabase
      .from('hiries_transactions')
      .insert({
        user_id: profile.id,
        amount: Number(amount),
        type: 'ADMIN_CREDIT',
        description: `Admin added ${amount} Hiries`
      })

    return NextResponse.json({
      success: true,
      message: `Added ${amount} Hiries to ${profile.full_name || email}`,
      new_balance: newBalance
    })

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}

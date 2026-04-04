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

    // Get all profiles to find the best match
    const { data: allProfiles, error: fetchError } = 
      await supabase
        .from('profiles')
        .select('id, email, full_name, name, hiries_balance')
    
    if (fetchError) {
      return NextResponse.json(
        { error: `Database error: ${fetchError.message}` },
        { status: 500 }
      )
    }

    if (!allProfiles || allProfiles.length === 0) {
      return NextResponse.json(
        { error: 'No profiles found in database. Check your SUPABASE_SERVICE_ROLE_KEY.' },
        { status: 404 }
      )
    }

    const searchEmail = email.toLowerCase().trim()
    
    // 1. Try exact email match
    let profile = allProfiles.find(p => p.email?.toLowerCase().trim() === searchEmail)

    // 2. Try match by name if email search failed
    if (!profile) {
      const searchName = searchEmail.split('@')[0].replace(/[^a-z0-9]/g, '')
      profile = allProfiles.find(p => {
        const pName = (p.name || '').toLowerCase().replace(/[^a-z0-9]/g, '')
        const pFullName = (p.full_name || '').toLowerCase().replace(/[^a-z0-9]/g, '')
        return pName === searchName || pFullName === searchName
      })
    }

    if (!profile) {
      return NextResponse.json({
        error: 'User not found. Ensure the user has signed up and finished onboarding.',
        tip: 'If searching by email fails, I also tried matching by name.',
        count: allProfiles.length,
        available_emails: allProfiles.slice(0, 15).map(p => p.email || p.name || 'Unknown')
      }, { status: 404 })
    }

    const amountNum = Number(amount)
    if (isNaN(amountNum)) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const newBalance = (profile.hiries_balance || 0) + amountNum

    await supabase
      .from('profiles')
      .update({ hiries_balance: newBalance })
      .eq('id', profile.id)

    await supabase
      .from('hiries_transactions')
      .insert({
        user_id: profile.id,
        amount: amountNum,
        type: 'ADMIN_CREDIT',
        description: `Admin added ${amountNum} Hiries to ${profile.email || profile.name}`
      })

    return NextResponse.json({
      success: true,
      message: `Added ${amountNum} Hiries to ${profile.full_name || profile.name || email}`,
      new_balance: newBalance
    })


  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}

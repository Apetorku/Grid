import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { userId, email, fullName, role } = await req.json()

    console.log('Ensuring user:', { userId, email, fullName, role })

    // Use service role to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking user:', checkError)
    }

    if (existingUser) {
      console.log('User already exists:', existingUser.id)
      return NextResponse.json({ success: true, exists: true })
    }

    // Create user record with minimal required fields
    console.log('Creating new user...')
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email: email,
        full_name: fullName || email.split('@')[0],
        role: role || 'client',
      })
      .select()

    if (insertError) {
      console.error('Insert error details:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      })
      
      // If it's a duplicate key error, that's actually fine
      if (insertError.code === '23505') {
        return NextResponse.json({ success: true, exists: true })
      }
      
      throw insertError
    }

    console.log('User created successfully:', newUser)
    return NextResponse.json({ success: true, created: true, user: newUser })
  } catch (error: any) {
    console.error('Full error ensuring user:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Failed to ensure user',
        details: error.details || 'No additional details',
        hint: error.hint || 'No hint available'
      },
      { status: 500 }
    )
  }
}

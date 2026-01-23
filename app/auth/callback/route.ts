import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
    
    // Get user and create user record if doesn't exist
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingUser) {
        await supabase.from('users').insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata.full_name || user.email!.split('@')[0],
          role: 'client',
          google_id: user.user_metadata.sub,
          avatar_url: user.user_metadata.avatar_url,
          email_verified: true,
        })
      }

      // Get user role and redirect
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userData?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      } else if (userData?.role === 'developer') {
        return NextResponse.redirect(new URL('/developer', request.url))
      } else {
        return NextResponse.redirect(new URL('/client', request.url))
      }
    }
  }

  return NextResponse.redirect(new URL('/login', request.url))
}

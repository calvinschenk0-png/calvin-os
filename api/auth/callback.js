// api/auth/callback.js
import { google } from 'googleapis'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.query.error) {
    return res.redirect(302, '/calendar?error=access_denied')
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )

  const { tokens } = await oauth2Client.getToken(req.query.code)

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  )

  const { data: existing } = await supabase
    .from('tokens')
    .select('id')
    .limit(1)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('tokens')
      .update({
        access_token: tokens.access_token,
        ...(tokens.refresh_token && { refresh_token: tokens.refresh_token }),
        expiry: new Date(tokens.expiry_date).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
  } else {
    await supabase.from('tokens').insert({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry: new Date(tokens.expiry_date).toISOString(),
    })
  }

  res.redirect(302, '/calendar')
}

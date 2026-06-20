// api/calendar-sync.js
import { google } from 'googleapis'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  )

  const { data: tokenRow, error: tokenError } = await supabase
    .from('tokens')
    .select('*')
    .limit(1)
    .maybeSingle()

  if (tokenError) return res.status(500).json({ error: tokenError.message })
  if (!tokenRow) return res.status(401).json({ error: 'Not connected' })

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )

  oauth2Client.setCredentials({
    access_token: tokenRow.access_token,
    refresh_token: tokenRow.refresh_token,
  })

  if (new Date(tokenRow.expiry) <= new Date(Date.now() + 5 * 60 * 1000)) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken()
      oauth2Client.setCredentials(credentials)
      await supabase
        .from('tokens')
        .update({
          access_token: credentials.access_token,
          expiry: new Date(credentials.expiry_date).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', tokenRow.id)
    } catch (err) {
      return res.status(401).json({ error: 'Token refresh failed: ' + err.message })
    }
  }

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
  const timeMin = new Date()
  timeMin.setDate(timeMin.getDate() - 28)
  const timeMax = new Date()
  timeMax.setDate(timeMax.getDate() + 56)

  try {
    const { data } = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 500,
    })

    const events = (data.items || []).map(e => ({
      google_event_id: e.id,
      title: e.summary || '(No title)',
      start_at: e.start.dateTime || `${e.start.date}T00:00:00Z`,
      end_at: e.end.dateTime || `${e.end.date}T00:00:00Z`,
      all_day: !e.start.dateTime,
      location: e.location || null,
      synced_at: new Date().toISOString(),
    }))

    if (events.length > 0) {
      const { error: upsertError } = await supabase
        .from('calendar_events')
        .upsert(events, { onConflict: 'google_event_id' })
      if (upsertError) return res.status(500).json({ error: upsertError.message })
    }

    res.json({ synced: events.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

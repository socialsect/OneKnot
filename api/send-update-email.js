import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check if Resend is configured
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'Resend API key not configured' })
  }

  try {
    const { 
      recipientEmails, 
      weddingName, 
      updateMessage, 
      eventName, 
      timeUpdate, 
      mapLink,
      websiteUrl,
      emailType 
    } = req.body

    if (!recipientEmails || !Array.isArray(recipientEmails) || recipientEmails.length === 0) {
      return res.status(400).json({ error: 'No valid recipient emails provided' })
    }

    if (!weddingName || !updateMessage) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'updates@oneknot.app'
    const fromName = 'OneKnot Updates'

    let subject
    let htmlContent

    if (emailType === 'rsvp-confirmation') {
      subject = `RSVP Confirmation - ${eventName || weddingName}`
      htmlContent = generateRSVPConfirmationEmail({
        eventName,
        rsvpStatus: updateMessage,
        weddingName,
        websiteUrl
      })
    } else {
      subject = `Update: ${weddingName}${eventName ? ` - ${eventName}` : ''}`
      htmlContent = generateUpdateEmail({
        weddingName,
        updateMessage,
        eventName,
        timeUpdate,
        mapLink,
        websiteUrl
      })
    }

    const results = await Promise.allSettled(
      recipientEmails.map(email => 
        resend.emails.send({
          from: `${fromName} <${fromEmail}>`,
          to: email,
          subject: subject,
          html: htmlContent
        })
      )
    )

    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return res.status(200).json({
      success: true,
      sent: successful,
      failed: failed,
      total: recipientEmails.length
    })
  } catch (error) {
    console.error('Error sending emails:', error)
    return res.status(500).json({ error: 'Failed to send emails', details: error.message })
  }
}

function generateUpdateEmail({ weddingName, updateMessage, eventName, timeUpdate, mapLink, websiteUrl }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Wedding Update</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(to bottom right, #ec4899, #a855f7); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">${weddingName}</h1>
      </div>
      
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        ${eventName ? `<p style="font-size: 14px; color: #6b7280; margin-top: 0; text-transform: uppercase; letter-spacing: 0.5px;">${eventName}</p>` : ''}
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-size: 16px; white-space: pre-wrap;">${updateMessage}</p>
        </div>

        ${timeUpdate ? `
          <div style="margin: 20px 0; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #92400e;"><strong>Time Update:</strong> ${timeUpdate}</p>
          </div>
        ` : ''}

        ${mapLink ? `
          <div style="margin: 20px 0;">
            <a href="${mapLink}" style="display: inline-block; padding: 12px 24px; background: #ec4899; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">View Location</a>
          </div>
        ` : ''}

        ${websiteUrl ? `
          <div style="margin: 30px 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <a href="${websiteUrl}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">View Live Updates</a>
          </div>
        ` : ''}

        <p style="font-size: 12px; color: #9ca3af; margin-top: 30px; text-align: center;">
          This email was sent to guests who opted in to receive updates for ${weddingName}.
        </p>
      </div>
    </body>
    </html>
  `
}

function generateRSVPConfirmationEmail({ eventName, rsvpStatus, weddingName, websiteUrl }) {
  const statusText = rsvpStatus === 'yes' ? 'Yes, I\'ll be there' : rsvpStatus === 'maybe' ? 'Maybe' : 'Can\'t make it'
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>RSVP Confirmation</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(to bottom right, #ec4899, #a855f7); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">RSVP Confirmed</h1>
      </div>
      
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; margin-top: 0;">Thank you for your RSVP!</p>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981;">
          <p style="margin: 0; font-size: 14px; color: #065f46;"><strong>Event:</strong> ${eventName || weddingName}</p>
          <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: 600; color: #065f46;">Your Response: ${statusText}</p>
        </div>

        ${websiteUrl ? `
          <div style="margin: 30px 0;">
            <a href="${websiteUrl}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">View Wedding Website</a>
          </div>
        ` : ''}

        <p style="font-size: 12px; color: #9ca3af; margin-top: 30px; text-align: center;">
          This is a confirmation of your RSVP for ${weddingName}.
        </p>
      </div>
    </body>
    </html>
  `
}


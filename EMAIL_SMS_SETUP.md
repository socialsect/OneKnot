# Email & SMS Invitation Setup Guide

## Overview
The invitation system supports sending invitations via Email and SMS. You need to configure the services below.

---

## 📧 Email Setup (EmailJS)

### Step 1: Create EmailJS Account
1. Go to [EmailJS](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email

### Step 2: Create Email Service
1. Go to **Email Services** in dashboard
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions
5. **Copy the Service ID**

### Step 3: Create Email Template
1. Go to **Email Templates**
2. Click **Create New Template**
3. Use this template:

```
Subject: You're Invited to {{couple_names}}'s Wedding!

Hello {{to_name}},

You're invited to celebrate with us!

{{couple_names}}
{{wedding_date}} in {{wedding_city}}

View your invitation: {{invite_url}}
Visit our wedding website: {{website_url}}

We can't wait to celebrate with you!

Love,
{{couple_names}}
```

4. **Copy the Template ID**

### Step 4: Get Public Key
1. Go to **Account** → **General**
2. **Copy your Public Key**

### Step 5: Add to .env
Add these to your `.env` file:

```env
VITE_EMAILJS_PUBLIC_KEY=your-public-key
VITE_EMAILJS_SERVICE_ID=your-service-id
VITE_EMAILJS_TEMPLATE_ID=your-template-id
```

---

## 📱 SMS Setup (Twilio)

### Option 1: Backend API (Recommended)

Create a backend endpoint that uses Twilio:

```javascript
// Example: /api/send-sms
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

app.post('/api/send-sms', async (req, res) => {
  const { to, message } = req.body;
  
  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

Then update `InviteGuests.jsx`:

```javascript
const sendSMSInvite = async (guestData) => {
  const inviteUrl = `${window.location.origin}/invite/${wedding.slug}`
  const message = `You're invited to ${wedding.partner1Name} & ${wedding.partner2Name}'s wedding! ${inviteUrl}`

  await fetch('/api/send-sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: guestData.phone,
      message: message
    })
  })
}
```

### Option 2: Twilio Client-Side (Not Recommended)
⚠️ **Security Warning**: Never expose Twilio credentials in frontend code!

If you must use client-side, use Twilio's client SDK (but this is not secure for production).

---

## 🔧 Alternative: Firebase Extensions

### Email via Firebase Extension
1. Go to Firebase Console
2. Install **"Trigger Email"** extension
3. Configure email templates
4. Use Cloud Functions to send emails

### SMS via Firebase Extension
1. Install **"Send SMS"** extension
2. Configure with Twilio credentials
3. Use Cloud Functions to send SMS

---

## 🧪 Testing

### Test Email
1. Go to Dashboard → Invite Guests
2. Enter a test email
3. Check your inbox

### Test SMS
1. Enter a test phone number
2. Check your phone for SMS

---

## 📝 Firestore Collection

Invitations are stored in the `invitations` collection:

```javascript
{
  weddingId: "wedding-id",
  guestName: "John Doe",
  guestEmail: "john@example.com",
  guestPhone: "+1234567890",
  sentAt: Timestamp,
  emailSent: true,
  smsSent: true
}
```

---

## 🔒 Security Notes

1. **Never expose API keys** in frontend code
2. Use environment variables for all secrets
3. For SMS, use a backend API endpoint
4. Rate limit invitations to prevent abuse
5. Validate email/phone formats before sending

---

## 💰 Costs

- **EmailJS**: Free tier includes 200 emails/month
- **Twilio**: ~$0.0075 per SMS (varies by country)
- **Firebase Extensions**: Free (you pay for underlying services)

---

## 🚀 Quick Start

1. Set up EmailJS (5 minutes)
2. Add EmailJS keys to `.env`
3. Test email invitations
4. Set up Twilio backend (if using SMS)
5. Test SMS invitations

---

## Need Help?

- EmailJS Docs: https://www.emailjs.com/docs/
- Twilio Docs: https://www.twilio.com/docs
- Firebase Extensions: https://firebase.google.com/products/extensions


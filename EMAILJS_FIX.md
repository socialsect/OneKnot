# 🔴 Fix: "The recipients address is empty" Error

This error means EmailJS can't find the recipient email address. Here's how to fix it:

---

## The Problem

EmailJS needs the recipient email to be configured in your **Email Service**, not just in the template. The parameter name must match exactly.

---

## ✅ Solution: Configure Email Service

### Step 1: Check Your Email Service Configuration

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/admin)
2. Click **Email Services** → Select your service
3. Look for **"To Email"** field configuration

### Step 2: Set "To Email" Field

In your Email Service settings, you need to map the "To Email" field to a template variable:

**Option A: Using Template Variable (Recommended)**
1. In Email Service → **"To Email"** field
2. Set it to: `{{to_email}}`
3. This will use the `to_email` parameter from your template

**Option B: Using Service Default**
1. Some services (like Gmail) use `user_email` or `to_email` by default
2. Check your service documentation

### Step 3: Verify Template Parameters

Make sure your EmailJS template uses these exact parameter names:
- `{{to_email}}` - Recipient email (REQUIRED)
- `{{to_name}}` - Recipient name
- `{{couple_names}}` - Couple names
- `{{wedding_date}}` - Wedding date
- `{{wedding_city}}` - City
- `{{invite_url}}` - Invitation link
- `{{website_url}}` - Website link
- `{{reply_to}}` - Reply-to email

---

## Common Email Service Configurations

### Gmail Service
- **To Email field:** `{{to_email}}`
- **From Name:** Your name or `{{couple_names}}`
- **Reply To:** `{{reply_to}}`

### Outlook/Office 365
- **To Email field:** `{{to_email}}`
- **From Name:** Your name
- **Reply To:** `{{reply_to}}`

### Custom SMTP
- **To Email field:** `{{to_email}}`
- Configure according to your SMTP provider

---

## Quick Fix Checklist

- [ ] Email Service has "To Email" field set to `{{to_email}}`
- [ ] Template uses `{{to_email}}` parameter
- [ ] Code sends `to_email` in templateParams
- [ ] Email address is valid (contains @)
- [ ] EmailJS keys are correct in `.env`

---

## Testing

1. **Test in EmailJS Dashboard:**
   - Go to Templates → Your template
   - Click "Test" button
   - Fill in test values:
     - `to_email`: your-test-email@example.com
     - `to_name`: Test Guest
     - Other fields...
   - Send test email
   - Check if it arrives

2. **Test from Your App:**
   - Go to Invite Guests page
   - Enter a test email
   - Send invitation
   - Check browser console for logs
   - Check if email arrives

---

## Alternative: Use Different Parameter Name

If your service uses a different parameter name, update the code:

```javascript
// If your service uses "user_email" instead of "to_email"
const templateParams = {
  user_email: guestData.email, // Change this
  to_name: guestData.name,
  // ... rest of params
}
```

Then update your Email Service "To Email" field to: `{{user_email}}`

---

## Still Not Working?

1. **Check EmailJS Service Logs:**
   - Go to EmailJS Dashboard → Email Services → Your Service
   - Check "Activity" or "Logs" tab
   - Look for error messages

2. **Verify Service is Active:**
   - Make sure service is not paused/disabled
   - Check service status

3. **Check Email Format:**
   - Email must be valid format: `user@domain.com`
   - No spaces or special characters

4. **Test with Simple Template:**
   - Create a simple test template
   - Just send `{{to_email}}` to verify service works
   - Then add complexity back

---

## Example: Correct Service Configuration

**Email Service Settings:**
```
Service Name: Gmail
To Email: {{to_email}}
From Name: {{couple_names}}
Reply To: {{reply_to}}
```

**Template:**
```
Subject: You're Invited to {{couple_names}}'s Wedding!

Hello {{to_name}},

You're invited to {{couple_names}}'s wedding on {{wedding_date}} in {{wedding_city}}.

View invitation: {{invite_url}}
```

**Code (already correct):**
```javascript
templateParams = {
  to_email: guestData.email, // ✅ Matches service config
  to_name: guestData.name,
  // ... other params
}
```

---

## Need More Help?

- EmailJS Docs: https://www.emailjs.com/docs/
- EmailJS Support: https://www.emailjs.com/support/
- Check service-specific documentation

---

**The key is:** Your Email Service "To Email" field MUST be set to `{{to_email}}` to match the parameter name in your code!


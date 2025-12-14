# EmailJS Template Setup Guide

## Quick Setup Steps

### 1. Copy the HTML Template

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/admin)
2. Click **Email Templates** → **Create New Template**
3. Name it: "Wedding Invitation"
4. **Copy the entire HTML from `email-template.html`** and paste it into the template editor
5. Click **Save**

### 2. Configure Template Variables

The template uses these variables (EmailJS will auto-detect them):
- `{{to_name}}` - Guest's name
- `{{to_email}}` - Guest's email
- `{{couple_names}}` - Partner 1 & Partner 2 names
- `{{wedding_date}}` - Formatted wedding date
- `{{wedding_city}}` - Wedding city
- `{{invite_url}}` - Link to invitation page
- `{{website_url}}` - Link to wedding website
- `{{reply_to}}` - Reply-to email address

### 3. Set Subject Line

In the template settings, set the subject:
```
You're Invited to {{couple_names}}'s Wedding!
```

### 4. Test the Template

1. Click **Test** button in EmailJS
2. Fill in test values:
   - `to_name`: Test Guest
   - `couple_names`: Alex & Sam
   - `wedding_date`: June 15, 2024
   - `wedding_city`: New York
   - `invite_url`: https://oneknot.app/invite/test-slug
   - `website_url`: https://oneknot.app/w/test-slug
   - `reply_to`: your-email@example.com
3. Send test email to yourself
4. Check your inbox!

---

## Alternative: Plain Text Version

If you prefer a simpler template, here's a plain text version:

```
Subject: You're Invited to {{couple_names}}'s Wedding!

Dear {{to_name}},

You're invited to celebrate our special day!

{{couple_names}}
{{wedding_date}} in {{wedding_city}}

View your invitation: {{invite_url}}
Visit our wedding website: {{website_url}}

We can't wait to celebrate with you!

Love,
{{couple_names}}

---
Made with ❤️ using OneKnot
Questions? Reply to this email or contact: {{reply_to}}
```

---

## Customization Tips

### Change Colors
Replace these color codes in the HTML:
- `#ec4899` - Pink (primary color)
- `#8b5cf6` - Purple (gradient)
- Adjust to match your wedding theme!

### Add Logo
1. Upload your logo to EmailJS
2. Replace the emoji (💍) with:
```html
<img src="cid:your-logo.png" alt="Logo" style="height: 60px;" />
```

### Add Images
1. Upload images to EmailJS
2. Reference them with `cid:image-name.png`

---

## Template Preview

The template includes:
✅ Beautiful gradient header
✅ Personalized greeting
✅ Wedding details (couple, date, location)
✅ Two CTA buttons (Invitation & Website)
✅ Professional footer
✅ Mobile-responsive design
✅ Brand colors (pink/purple)

---

## Troubleshooting

**Variables not showing?**
- Make sure variable names match exactly (case-sensitive)
- Use double curly braces: `{{variable_name}}`

**Styling looks broken?**
- Email clients strip some CSS
- Use inline styles (already included)
- Test in multiple email clients

**Images not loading?**
- Upload images to EmailJS
- Use `cid:` references
- Or use external URLs (may be blocked)

---

## Next Steps

1. ✅ Create template in EmailJS
2. ✅ Test with sample data
3. ✅ Add EmailJS keys to `.env`
4. ✅ Test from your app
5. ✅ Send real invitations!

---

**Need help?** Check EmailJS documentation: https://www.emailjs.com/docs/


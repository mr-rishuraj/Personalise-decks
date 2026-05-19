# Pre-filled Defaults - PIEDS/Ignite 2026

## What's Pre-filled?

The website comes with smart defaults for PIEDS + Ignite 2026:

| Field | Default Value | Changeable? |
|-------|---------------|------------|
| Event Name | **Ignite 2026** | ✅ Yes |
| Organization | **PIEDS** | ✅ Yes |
| Pitch Deck | **Ignite_25_pitchdeck.pdf** | ✅ Yes |
| Partnership Title | **PIEDS & Partner Summit** | ✅ Yes |

---

## Why These Defaults?

- **Event:** Ignite 2026 is PIEDS' main conference
- **Organization:** PIEDS is the host
- **Pitch Deck:** Default deck for all partnership proposals
- **Title:** Generic but easily customizable

---

## How to Use

### For Ignite 2026 Partnerships (Recommended)
1. Just fill in **Company Name** (e.g., "AirPay")
2. Keep event/org/pitch deck as defaults
3. Click "Generate Document"
4. Done! Saves 2 minutes per proposal

### For Other Events/Organizations
1. Change **Event Name** (e.g., "TechFest 2026")
2. Change **Organization Name** (e.g., "YourOrg")
3. Upload different **Pitch Deck** (or paste link)
4. Fill remaining fields as needed
5. Generate!

### Example Workflows

#### Ignite 2026 + AirPay
```
Event Name:       Ignite 2026 ✓ (default)
Organization:     PIEDS ✓ (default)
Partner Company:  AirPay (type here)
Pitch Deck:       [default] ✓ (default)
→ Generate Document
```

#### TechFest 2026 + Different Org
```
Event Name:       TechFest 2026 (change)
Organization:     TechHub India (change)
Partner Company:  TechPartner Inc (type)
Pitch Deck:       [paste link to their deck] (change)
→ Generate Document
```

---

## Pitch Deck Default

The default pitch deck is: **Ignite_25_pitchdeck.pdf**

### What It Contains
- Ignite 2026 event overview
- PIEDS organization details
- Partnership benefits
- Event structure & timeline

### How to Use It
- Leave blank if using default (file is auto-loaded)
- Or paste the file path: `Ignite_25_pitchdeck.pdf`
- To use a different deck: Paste full URL or upload new PDF

---

## Smart Features

### Auto-Detection
If you keep the pitch deck field as:
```
[Default: Ignite_25_pitchdeck.pdf loaded]
```

The system automatically uses the default PDF and mentions it in the AI prompt.

### Easy Override
Change any field at any time - no field is locked. The defaults are just to save time.

### Reset to Defaults
Just refresh the page (F5) - form goes back to defaults.

---

## File Locations

- **Pitch Deck:** `/public/Ignite_25_pitchdeck.pdf`
- **Form Defaults:** `public/script.js` (line ~3)
- **Display Note:** `public/index.html` (top of form)

---

## Customizing Defaults (Advanced)

### Change Default Event
Edit `public/index.html`:
```html
<input type="text" id="eventName" value="Ignite 2026">
                                        ↓
                    Change to your event name
```

### Change Default Organization
Edit `public/index.html`:
```html
<input type="text" id="yourOrg" value="PIEDS">
                                        ↓
                          Change to your org
```

### Change Default Pitch Deck
Edit `public/script.js`:
```javascript
const DEFAULT_PITCH_DECK = 'Ignite_25_pitchdeck.pdf';
                            ↓
              Change to your pitch deck filename
```

Then push changes:
```bash
git add .
git commit -m "Update defaults"
git push origin main
```

Vercel auto-redeploys in ~1 minute!

---

## Benefits of Defaults

✅ **Speed:** Generate proposals in 2-3 minutes instead of 5+
✅ **Consistency:** Same event/org values for all proposals
✅ **Error Prevention:** No typos in organization names
✅ **Flexibility:** Can still change anything anytime
✅ **Training:** New users see example values

---

## FAQ

**Q: Can I change the defaults?**
A: Yes! Edit `public/index.html` and redeploy.

**Q: What if I don't want defaults?**
A: Clear the field and enter your own values.

**Q: Does it affect generated documents?**
A: Only if you use the defaults - they're embedded in the AI prompt.

**Q: How do I reset to defaults?**
A: Refresh the page (F5) or reload the URL.

**Q: Can multiple teams use different defaults?**
A: Yes! Deploy multiple instances with different defaults for each team.

---

## Next Steps

1. ✅ Defaults are set up
2. Try generating a proposal with defaults
3. Try changing values and generating again
4. Share with team - they'll see PIEDS/Ignite defaults

Enjoy faster proposal generation! 🚀

# GridRush Netlify Deployment Guide

Complete step-by-step instructions for deploying GridRush to Netlify.

---

## Prerequisites

- GitHub account with push access to the repository
- Netlify account (free tier works perfectly)

---

## Deployment Steps

### 1. Prepare Repository

Ensure all changes are committed and pushed:

```bash
cd /path/to/gridrush
git status                # Check for uncommitted changes
git add .                 # Stage all changes
git commit -m "Ready for Netlify deployment"
git push origin main      # Or your main branch name
```

### 2. Connect Netlify to GitHub

1. Visit [https://app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"GitHub"**
4. Authorize Netlify to access your GitHub account
5. Select **GrowthScienceAI/gridrush** repository

### 3. Configure Build Settings

Netlify will auto-detect the `netlify.toml` configuration, but verify:

```
Build command:    (leave empty)
Publish directory: .
```

These settings are already configured in `netlify.toml`, so just click **"Deploy site"**!

### 4. Wait for Deployment

- Initial deployment takes ~30-60 seconds
- Watch the deploy log in real-time
- You'll see: "Site is live ✨"

### 5. Get Your Live URL

Your site will be available at:
```
https://[random-name].netlify.app
```

Example: `https://cheerful-muffin-abc123.netlify.app`

---

## Customize Site Name

1. Go to **Site settings** → **General** → **Site details**
2. Click **"Change site name"**
3. Enter your desired name (e.g., `gridrush`)
4. New URL: `https://gridrush.netlify.app`

---

## Add Custom Domain (Optional)

### If you own a domain:

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `gridrush.com`)
4. Follow DNS configuration:

**For apex domain (gridrush.com):**
```
Type: A
Name: @
Value: 75.2.60.5
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: [your-site].netlify.app
```

5. SSL certificate auto-provisions in ~24 hours

---

## Continuous Deployment

Every push to GitHub auto-deploys:

```bash
# Make changes to your code
vim index.html

# Commit and push
git add .
git commit -m "Update game UI"
git push origin main

# Netlify automatically detects and deploys! 🚀
```

### Deploy Previews

Pull requests get preview URLs automatically:

1. Create a branch: `git checkout -b feature/new-mode`
2. Make changes and push
3. Open a PR on GitHub
4. Netlify comments with preview URL
5. Test before merging!

---

## Environment Configuration

### Production Environment

Already configured in `netlify.toml`:

- Asset minification enabled
- CSS bundling enabled
- Cache headers optimized
- Security headers applied

### Build Plugins (Future)

Enable in `netlify.toml`:

```toml
[[plugins]]
  package = "@netlify/plugin-lighthouse"  # Performance audits
```

---

## Monitoring & Analytics

### Enable Netlify Analytics

1. Go to **Site settings** → **Analytics**
2. Click **"Enable Analytics"** ($9/month, optional)
3. Get real visitor data without cookies!

### Free Alternatives

Add Google Analytics by inserting before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## Optimization Checklist

- ✅ `netlify.toml` configured
- ✅ `_redirects` file present
- ✅ All paths are relative
- ✅ SEO meta tags added
- ✅ Open Graph tags for social sharing
- ✅ Cache headers optimized
- ✅ Security headers enabled
- ✅ Asset minification enabled

---

## Common Issues & Solutions

### Issue: "Page not found" errors

**Solution:**
Ensure `_redirects` file exists with:
```
/*    /index.html   200
```

### Issue: CSS/JS not loading

**Solution:**
Check all paths are relative:
- ✅ `href="css/styles.css"` (correct)
- ❌ `href="/css/styles.css"` (wrong - absolute path)

### Issue: Slow build times

**Solution:**
- Build is instant (no build step!)
- If slow, check for large files in repo

### Issue: Deploy failed

**Solution:**
1. Check deploy log for errors
2. Verify `netlify.toml` syntax
3. Ensure all files committed to Git

---

## Performance Tips

### Enable Asset Optimization

Already configured in `netlify.toml`, but verify in dashboard:

1. **Site settings** → **Build & deploy** → **Post processing**
2. Enable:
   - ✅ Bundle CSS
   - ✅ Minify CSS
   - ✅ Minify JS
   - ✅ Compress images
   - ✅ Pretty URLs

### Use Netlify CDN

Automatic! Your site serves from 100+ edge locations worldwide.

### Preload Critical Assets

Add to `<head>` for faster loading:

```html
<link rel="preload" href="css/styles.css" as="style">
<link rel="preload" href="js/game.js" as="script">
```

---

## Rollback Deployment

If something goes wrong:

1. Go to **Deploys** tab
2. Find previous working deploy
3. Click **"..."** → **"Publish deploy"**
4. Instant rollback to that version!

---

## Branch Deploys

Deploy multiple branches simultaneously:

1. **Site settings** → **Build & deploy** → **Deploy contexts**
2. Enable **"Branch deploys"**
3. Select branches to deploy
4. Each branch gets its own URL!

Example:
- `main` → https://gridrush.netlify.app
- `dev` → https://dev--gridrush.netlify.app
- `staging` → https://staging--gridrush.netlify.app

---

## Security

### Automatic HTTPS

- Free Let's Encrypt SSL certificate
- Auto-renewal every 3 months
- Force HTTPS enabled by default

### Security Headers

Already configured in `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
```

---

## Next Steps After Deployment

1. ✅ Update social media OG image URL in `index.html`
2. ✅ Add Netlify status badge to README
3. ✅ Set up custom domain (if desired)
4. ✅ Share your game with the world! 🎉

---

## Support

- **Netlify Docs:** https://docs.netlify.com
- **Netlify Community:** https://answers.netlify.com
- **GridRush Issues:** https://github.com/GrowthScienceAI/gridrush/issues

---

## Success Checklist

Before sharing your deployed game:

- [ ] Game loads without errors
- [ ] Dice rolling works
- [ ] AI opponent makes moves
- [ ] Timer counts down
- [ ] Winning conditions trigger
- [ ] Mobile responsive
- [ ] HTTPS enabled (🔒 in browser)
- [ ] Custom domain configured (optional)
- [ ] SEO meta tags visible in page source

---

**Congratulations! Your GridRush game is now live! 🏁🏎️**

Share your URL and let the races begin!

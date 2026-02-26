# 🚀 Deployment Guide

## 🔐 Security First - Environment Variables

**NEVER commit real API keys to Git!**

### ✅ Correct Setup
- `.env.example` - contains placeholder values only
- `.env` - contains real keys (already in .gitignore)
- Production keys are set in hosting platform

### ❌ What NOT to do
- Don't commit real API keys
- Don't hardcode keys in source code
- Don't expose keys in client-side code if not needed

---

## 📦 Vercel Deployment

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project" → Connect GitHub
3. Select your repository
4. Vercel will auto-detect Vite + React

### 3. Set Environment Variables
In Vercel dashboard → Settings → Environment Variables:
```
Name: VITE_GROQ_API_KEY
Value: gsk_your_real_groq_key_here
Environment: Production, Preview, Development
```

### 4. Deploy
- Click "Deploy"
- Wait for build to complete
- Test the deployed app

---

## 🌐 Netlify Deployment

### 1. Push to GitHub
(If not already done)

### 2. Deploy on Netlify
1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub and select repository
4. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

### 3. Set Environment Variables
In Netlify dashboard → Site settings → Build & deploy → Environment:
```
Key: VITE_GROQ_API_KEY
Value: gsk_your_real_groq_key_here
Scope: All deploy contexts
```

### 4. Deploy
- Click "Deploy site"
- Wait for build
- Test functionality

---

## 🔍 Deployment Checklist

### Before Deploy
- [ ] `.env.example` has placeholder values only
- [ ] `.env` is in .gitignore
- [ ] No real keys in source code
- [ ] Project builds locally: `npm run build`

### After Deploy
- [ ] Site loads correctly
- [ ] AI chat functionality works
- [ ] Wallet data loads from opscan.org
- [ ] No console errors
- [ ] Environment variables are working

---

## 🛠️ Troubleshooting

### Common Issues

**API Key Not Working**
- Check environment variable name (must start with `VITE_`)
- Verify key is correct
- Check browser console for errors

**Build Fails**
- Check build logs
- Ensure all dependencies are installed
- Verify TypeScript compilation

**CORS Issues**
- opscan.org API should work from browser
- If issues, check network tab in browser dev tools

### Local Testing
```bash
# Test production build locally
npm run build
npm run preview
```

---

## 📱 Mobile & Performance

Both Vercel and Netlify provide:
- ✅ HTTPS by default
- ✅ Global CDN
- ✅ Automatic deployments
- ✅ Custom domains
- ✅ Analytics

### Performance Tips
- Images are optimized automatically
- Bundle splitting is handled by Vite
- Service worker can be added for PWA

---

## 🔧 Custom Domain (Optional)

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Netlify
1. Go to Site settings → Domain management
2. Add custom domain
3. Update DNS records

---

## 📊 Monitoring

Both platforms provide:
- Build logs
- Function logs (if using serverless)
- Performance metrics
- Error tracking
- Uptime monitoring

---

## 🔄 CI/CD

### Automatic Deployments
- **Vercel**: Every push to main → Production
- **Netlify**: Every push to main → Production

### Preview Deployments
- **Vercel**: Every PR → Preview URL
- **Netlify**: Deploy previews for branches/PRs

---

## 🚨 Security Reminders

1. **Never** expose server-side keys in frontend
2. **Always** use HTTPS in production
3. **Regularly** rotate API keys
4. **Monitor** usage and costs
5. **Keep** dependencies updated

---

## 📞 Support

- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Netlify**: [docs.netlify.com](https://docs.netlify.com)
- **Groq API**: [console.groq.com](https://console.groq.com)

---

*Last updated: February 2026*

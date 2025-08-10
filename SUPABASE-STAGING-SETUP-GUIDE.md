# 🏗️ Supabase Staging Project Setup Guide

## 📋 **Step-by-Step: Create Supabase Staging Project**

### **Step 1: Create New Supabase Project**

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard
   - Sign in with your account

2. **Create New Project**
   - Click "**New Project**" button
   - **Organization**: Select your organization
   - **Project Name**: `viboothi-automation` (or `viboothi-staging`)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose same region as production (for consistency)
   - **Pricing Plan**: Free tier is fine for staging
   - Click "**Create new project**"

3. **Wait for Project Setup**
   - Project creation takes 2-3 minutes
   - You'll see a progress indicator
   - Don't close the browser tab

### **Step 2: Get Staging Credentials**

Once your project is ready:

1. **Go to Project Settings**
   - Click the "⚙️ Settings" icon in sidebar
   - Select "**API**" from the settings menu

2. **Copy These Values:**
   ```
   Project URL: https://[your-project-ref].supabase.co
   anon public key: eyJ... (starts with eyJ)
   service_role key: eyJ... (starts with eyJ, different from anon)
   ```

3. **Paste Them Here**
   ```
   STAGING_URL=
   STAGING_ANON_KEY=
   STAGING_SERVICE_KEY=
   ```

---

## 🔄 **Once You Provide Credentials, I'll:**

1. **Update .env.automation** with your real staging URLs
2. **Create storage bucket setup commands**
3. **Provide schema migration commands**
4. **Create verification scripts**

---

## 📋 **What to Copy From Supabase Dashboard:**

### **From Settings → API:**
```
✅ Project URL (your staging Supabase URL)
✅ anon public key (for frontend)
✅ service_role key (for admin operations)
```

### **Important Notes:**
- ⚠️ **Keep service_role key secure** - it has admin access
- ✅ **anon key is safe** - it's meant for frontend use
- 📝 **Save your database password** - you'll need it for CLI setup

---

## 🛡️ **Safety Checklist:**
- [ ] New project created (not production)
- [ ] Different project URL than production
- [ ] Database password saved securely
- [ ] Ready to paste credentials here

**🚀 Ready to proceed? Paste your staging credentials and I'll update your automation environment!**

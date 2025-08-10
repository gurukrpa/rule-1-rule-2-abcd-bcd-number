# 🎯 Create Supabase Automation Project - Step by Step Guide

## 🎯 Current Issue
You have placeholder URLs in `.env.automation` instead of a real Supabase staging project.

## ✅ Step-by-Step Solution

### Step 1: Create New Supabase Project
1. **Go to Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **Create New Project**
   ```
   • Click "New Project"
   • Organization: Select your organization
   • Project Name: "viboothi-automation" or "viboothi-staging"
   • Database Password: Create a strong password (save it!)
   • Region: Same as your production project (closest to your users)
   • Pricing Plan: Free tier is fine for staging
   ```

3. **Wait for Project Creation**
   ```
   ⏳ This takes 2-3 minutes
   ☕ Go grab a coffee while it sets up
   ```

### Step 2: Get Project Configuration
1. **Go to Project Settings**
   ```
   • Click on your new project
   • Go to Settings (gear icon in sidebar)
   • Click "API" in the left menu
   ```

2. **Copy the Configuration**
   ```
   You'll need these values:
   • Project URL
   • Project API Keys (anon/public key)
   • Service Role Key (optional, for admin operations)
   ```

### Step 3: Update .env.automation
Replace the placeholder values in `.env.automation` with your real staging credentials:

```bash
# Supabase Configuration (Automation Database)
VITE_SUPABASE_URL=https://YOUR_NEW_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_NEW_PROJECT_ANON_KEY
VITE_SUPABASE_SERVICE_ROLE_KEY=YOUR_NEW_PROJECT_SERVICE_ROLE_KEY
```

### Step 4: Set Up Database Schema
Your automation project needs the same database structure as production.

**Option A: Manual Setup**
1. Go to SQL Editor in your new project
2. Copy the schema from your production project
3. Run the SQL to create tables

**Option B: Migration Script (I can help create this)**
We can create a script to automatically set up the schema.

### Step 5: Test the Automation Environment
```bash
# Switch to automation environment
./switch-environment.sh automation

# Test the connection
npm run dev

# Check that it connects to your new staging Supabase project
```

---

## 🎯 Quick Start Commands

After creating the Supabase project, you'll run:

```bash
# 1. Edit the automation environment file
nano .env.automation

# 2. Replace placeholder URLs with real staging project URLs

# 3. Test the automation environment
./switch-environment.sh automation
npm run dev

# 4. Verify in browser that you see the yellow automation banner
```

---

## 🛡️ Why This Approach is Safe

1. **Complete Isolation**: Your production Supabase project (`zndkprjytuhzufdqhnmt`) remains untouched
2. **Separate Data**: Staging project has its own database, completely isolated
3. **Environment Switching**: Easy to switch between production and staging
4. **Visual Warnings**: Yellow banner prevents confusion between environments

---

## 🎯 Next Steps After Project Creation

1. Create the Supabase automation project (2-3 minutes)
2. Update `.env.automation` with real credentials
3. Set up database schema in staging project
4. Test automation environment
5. Deploy to staging when ready

Would you like me to help you with any of these steps?

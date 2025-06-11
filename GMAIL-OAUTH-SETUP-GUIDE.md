# Gmail OAuth Setup Guide for ABCD/BCD Number Application

## Overview
This guide will help you configure Gmail OAuth authentication in Supabase for the ABCD/BCD Number Application, restricting access to only `gurukrpasharma@gmail.com`.

## Prerequisites
- Supabase project: `https://zndkprjytuhzufdqhnmt.supabase.co`
- Domain: `viboothi.in`
- Google Cloud Console access

## Step 1: Google Cloud Console Setup

### 1.1 Create OAuth 2.0 Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project: **ABCD-BCD-Number-App**
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client ID**

### 1.2 Configure OAuth 2.0 Client
- **Application type**: Web application
- **Name**: ABCD BCD Number Application
- **Authorized JavaScript origins**:
  - `https://viboothi.in`
  - `https://zndkprjytuhzufdqhnmt.supabase.co`
- **Authorized redirect URIs**:
  - `https://zndkprjytuhzufdqhnmt.supabase.co/auth/v1/callback`
  - `https://viboothi.in/auth/callback`

### 1.3 Configure OAuth Consent Screen
- **User Type**: External
- **App name**: ABCD/BCD Number Application
- **User support email**: gurukrpasharma@gmail.com
- **Developer contact email**: gurukrpasharma@gmail.com
- **App domain**: viboothi.in
- **Authorized domains**: viboothi.in
- **Scopes**: email, profile, openid

### 1.4 Add Test Users (for restricted access)
- **Test users**: Add `gurukrpasharma@gmail.com`

## Step 2: Supabase Configuration

### 2.1 Enable Google Provider
1. Go to Supabase Dashboard: `https://supabase.com/dashboard/project/zndkprjytuhzufdqhnmt`
2. Navigate to **Authentication > Providers**
3. Enable **Google** provider
4. Add your Google OAuth credentials:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)

### 2.2 Configure Site URL and Redirect URLs
- **Site URL**: `https://viboothi.in`
- **Redirect URLs**:
  - `https://viboothi.in/auth/callback`
  - `https://viboothi.in/**`

### 2.3 Update RLS Policies
Run the migration file: `005_create_auth_users.sql`

```sql
-- Enable Google OAuth and restrict access
CREATE POLICY "Restrict access to specific email" ON auth.users
    FOR ALL USING (
        email = 'gurukrpasharma@gmail.com'
    );
```

## Step 3: Domain Configuration (Vercel)

### 3.1 Vercel Environment Variables
Add these environment variables in Vercel:

```env
VITE_SUPABASE_URL=https://zndkprjytuhzufdqhnmt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_ALLOWED_EMAIL=gurukrpasharma@gmail.com
VITE_DOMAIN=viboothi.in
VITE_AUTH_REDIRECT_URL=https://viboothi.in/auth/callback
```

### 3.2 Vercel Domain Settings
- **Custom Domain**: viboothi.in
- **HTTPS**: Enabled (required for OAuth)
- **SPA Fallback**: `index.html`

## Step 4: Security Configuration

### 4.1 Row Level Security (RLS)
The auth_users table has RLS enabled with policies that only allow:
- `gurukrpasharma@gmail.com` to access the application
- Automatic user profile creation on first login
- Session tracking and login counting

### 4.2 Email Restriction Logic
The application implements multiple layers of email restriction:

1. **Frontend validation** in `GmailAuth.jsx`
2. **OAuth callback validation** in `AuthCallback.jsx`
3. **Protected route validation** in `ProtectedRouteGmail.jsx`
4. **Database policies** in Supabase

## Step 5: Testing the Setup

### 5.1 Local Testing
1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:5173/auth`
3. Test Gmail OAuth flow
4. Verify restricted access

### 5.2 Production Testing
1. Deploy to Vercel
2. Navigate to `https://viboothi.in/auth`
3. Test with authorized email: `gurukrpasharma@gmail.com`
4. Test with unauthorized email (should be denied)

## Authentication Flow

1. **User visits**: `https://viboothi.in` → redirects to `/auth`
2. **Click "Sign in with Google"**: Initiates OAuth flow
3. **Google authentication**: User signs in with Gmail
4. **Email validation**: Check if email is `gurukrpasharma@gmail.com`
5. **Access granted/denied**: Based on email validation
6. **Redirect to dashboard**: If authorized, redirect to `/dashboard`
7. **Session management**: Store session and user data

## Error Handling

- **Unauthorized email**: Clear session and show error message
- **OAuth failures**: Redirect back to auth page with error
- **Session expiry**: Automatic redirect to auth page
- **Network errors**: Show retry options

## Security Features

- ✅ **Email-based access control**
- ✅ **HTTPS enforcement**
- ✅ **Session validation**
- ✅ **CSRF protection via Supabase**
- ✅ **Row Level Security**
- ✅ **Protected routes**
- ✅ **Automatic session cleanup**

## URLs and Endpoints

- **Production**: https://viboothi.in
- **Auth page**: https://viboothi.in/auth
- **OAuth callback**: https://viboothi.in/auth/callback
- **Dashboard**: https://viboothi.in/dashboard
- **Legacy auth**: https://viboothi.in/legacy-auth

## Support

For issues with authentication:
1. Check browser console errors
2. Verify Google Cloud Console configuration
3. Check Supabase auth logs
4. Ensure environment variables are set correctly
5. Contact: gurukrpasharma@gmail.com

---

**Note**: This setup provides enterprise-level security while maintaining ease of use for the authorized user.

# Full Stack Setup Guide

This guide outlines how to create the admin-only application using Supabase, React and Vercel.

## 1. Supabase configuration

1. Create a new Supabase project and obtain the project URL and anon key.
2. Add these keys to a `.env` file used by Vite:
   ```
   VITE_SUPABASE_URL=<your-url>
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```
3. Run the SQL script `supabase_schema_admin.sql` in the Supabase dashboard to create the tables required for admin login, user management and rule data.

## 2. Frontend file structure

```
src/
  admin/
    App.jsx
    main.jsx
    pages/
      LoginPage.jsx
      Dashboard.jsx
      ABCDPage.jsx
      IndexPage.jsx
      Rule1Page.jsx
      Rule2Page.jsx
```

All pages import the existing `supabaseClient.js` for API access and use React Router for navigation.

## 3. Routes

- `/admin/login` – login form for administrators
- `/admin/dashboard` – user management dashboard
- `/admin/user/:id` – ABCD page for a user
- `/admin/user/:id/index` – IndexPage
- `/admin/user/:id/rule1` – Rule‑1 page
- `/admin/user/:id/rule2` – Rule‑2 page

## 4. Deployment

1. Commit all code to GitHub.
2. Create a new project on Vercel and import the repository.
3. Set the environment variables for Supabase URL and anon key in Vercel.
4. Deploy the project. After the first deployment, add the custom domain `viboothi.in` in the Vercel dashboard.
5. Point your domainʼs DNS records to Vercel as instructed in the dashboard and wait for propagation.

With these steps the application will be available at `https://viboothi.in`.

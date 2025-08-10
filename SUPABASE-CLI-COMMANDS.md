# 🔧 Supabase CLI Setup Commands

## **Prerequisites: Install Supabase CLI**

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Verify installation
supabase --version
```

## **Step 1: Login to Supabase CLI**

```bash
# Login to Supabase
supabase login

# This opens browser for authentication
# Follow the login flow
```

## **Step 2: Link Projects**

### **Link Production Project (for schema export)**
```bash
# Link to production project
supabase link --project-ref zndkprjytuhzufdqhnmt

# Verify link
supabase status
```

### **Link Staging Project (once created)**
```bash
# Switch to staging project
# Replace [YOUR-STAGING-REF] with your actual staging project reference
supabase link --project-ref [YOUR-STAGING-REF]
```

## **Step 3: Export Production Schema**

```bash
# Export current production schema
supabase db dump --schema-only > production-schema.sql

# This creates a file with all tables, functions, policies, etc.
```

## **Step 4: Apply Schema to Staging**

```bash
# Make sure you're linked to staging project
supabase link --project-ref [YOUR-STAGING-REF]

# Apply the schema to staging
supabase db push production-schema.sql

# OR use psql directly:
# psql "postgresql://postgres:[PASSWORD]@db.[YOUR-STAGING-REF].supabase.co:5432/postgres" < production-schema.sql
```

## **Step 5: Create Storage Buckets**

```bash
# Create the same storage buckets as production
# Replace with your actual bucket names from production

supabase storage create bucket user-data --public=false
supabase storage create bucket house-images --public=true  
supabase storage create bucket excel-exports --public=false

# Verify buckets created
supabase storage list
```

## **Step 6: Copy Storage Policies (if needed)**

```bash
# Export storage policies from production
supabase db dump --schema=storage > storage-policies.sql

# Apply to staging
supabase db push storage-policies.sql
```

---

## **Quick Reference Commands:**

```bash
# Check which project you're linked to
supabase status

# Switch between projects
supabase link --project-ref zndkprjytuhzufdqhnmt      # Production
supabase link --project-ref [YOUR-STAGING-REF]        # Staging

# Export/Import schema
supabase db dump --schema-only > schema.sql          # Export
supabase db push schema.sql                          # Import

# Storage operations
supabase storage list                                 # List buckets
supabase storage create bucket [name]                # Create bucket
```

---

**⚠️ Important:** 
- Always verify you're linked to the correct project before running commands
- Test with small changes first
- Keep staging and production clearly separated

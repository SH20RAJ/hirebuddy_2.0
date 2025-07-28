# Security Guide: Environment Variable Protection

## 🚨 Critical Security Issue Fixed

This guide addresses the recent security issue where sensitive environment variables were exposed in the client-side build.

## What Was Wrong

Environment variables with the `VITE_` prefix were being bundled into the client-side JavaScript, exposing:
- `VITE_GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `VITE_OPENAI_API_KEY` - OpenAI API key
- Other sensitive credentials

**These were visible in the built `dist/` folder and to anyone inspecting the website.**

## ✅ What We Fixed

### 1. Removed Sensitive VITE_ Variables
- Moved `GOOGLE_CLIENT_SECRET` to `.env.server` (server-side only)
- Moved `OPENAI_API_KEY` to `.env.server` (server-side only)
- Updated code to use Supabase Edge Functions instead of direct API calls

### 2. Created Secure Proxy Functions
- **Google Auth Proxy** (`supabase/functions/google-auth-proxy/`)
  - Handles OAuth token exchange securely
  - Client sends authorization code, server exchanges for tokens
- **OpenAI Proxy** (`supabase/functions/openai-proxy/`)
  - Routes OpenAI requests through secure server
  - API key never exposed to client

### 3. Added Security Validation
- Created `EnvironmentValidator` class to detect exposed secrets
- Automatic warnings when sensitive variables have `VITE_` prefix
- Runs security check on app startup

### 4. Cleaned Up Build Artifacts
- Removed `dist/` folder containing exposed secrets
- Ensured `.gitignore` properly excludes build artifacts

## 🔒 Security Rules Going Forward

### Safe to Expose (VITE_ prefix OK):
- `VITE_SUPABASE_URL` - Public Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Public anonymous key for client auth
- `VITE_GOOGLE_CLIENT_ID` - Public OAuth client identifier
- `VITE_API_URL` - Public API endpoints
- `VITE_STACK_PUBLISHABLE_KEY` - Public Stack Auth key

### NEVER Expose (NO VITE_ prefix):
- `GOOGLE_CLIENT_SECRET` - OAuth client secret
- `OPENAI_API_KEY` - OpenAI API key
- `SUPABASE_SERVICE_ROLE_KEY` - Admin-level database access
- `GITHUB_CLIENT_SECRET` - GitHub OAuth secret
- Any API keys, passwords, or private keys

## 🛡️ Best Practices

### 1. Environment File Structure
```
.env.local          # Public client variables (VITE_ prefix)
.env.server         # Private server variables (NO VITE_ prefix)
.env.example        # Template with placeholder values
```

### 2. Variable Naming Convention
```bash
# ✅ SAFE - Will be public
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_GOOGLE_CLIENT_ID=your-public-client-id

# ❌ DANGEROUS - Never use VITE_ for secrets
GOOGLE_CLIENT_SECRET=your-secret-key
OPENAI_API_KEY=sk-your-secret-key
```

### 3. Code Patterns

#### ❌ Don't Do This:
```typescript
// Direct API calls with exposed keys
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}` // EXPOSED!
  }
});
```

#### ✅ Do This Instead:
```typescript
// Use Supabase Edge Function proxy
const { data, error } = await supabase.functions.invoke('openai-proxy', {
  body: { model: 'gpt-4', messages: [...] }
});
```

## 🚀 Deployment Security

### Vercel Environment Variables
1. Go to Vercel dashboard → Project Settings → Environment Variables
2. **Remove** any variables with sensitive values that have `VITE_` prefix
3. **Add** server-side variables without `VITE_` prefix for Edge Functions

### Before Each Deployment
1. Run security check: `npm run build`
2. Check console for security warnings
3. Verify no sensitive data in `dist/` folder
4. Test that Edge Functions work properly

## 🔍 Security Monitoring

The app now automatically checks for security issues on startup. Watch for:

```bash
🔍 Environment Security Check:
✅ Environment configuration is secure
```

Or warnings like:
```bash
🚨 SECURITY RISK: VITE_OPENAI_API_KEY is exposed to the client!
```

## 📋 Emergency Response

If sensitive variables are accidentally exposed:

1. **Immediately** regenerate all exposed API keys
2. Remove/clean the exposed build artifacts
3. Update environment variables in deployment platform
4. Deploy new build with secure configuration
5. Monitor for any unauthorized usage

## 🔧 Testing Security

Run the security validator manually:
```typescript
import { EnvironmentValidator } from './utils/security';
EnvironmentValidator.logEnvironmentStatus();
```

This will show any security issues that need addressing. 
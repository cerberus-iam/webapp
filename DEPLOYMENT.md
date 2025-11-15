# Deployment Guide

This guide covers deploying Cerberus IAM Frontend to Railway and other platforms.

## Table of Contents

- [Railway Deployment](#railway-deployment)
- [Environment Variables](#environment-variables)
- [Build Configuration](#build-configuration)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Deployment Process](#deployment-process)
- [Post-Deployment Verification](#post-deployment-verification)
- [Rollback Procedures](#rollback-procedures)
- [Monitoring and Logging](#monitoring-and-logging)
- [Troubleshooting](#troubleshooting)
- [Alternative Platforms](#alternative-platforms)

## Railway Deployment

Railway is the primary deployment platform for Cerberus IAM Frontend.

### Prerequisites

- Railway account ([railway.app](https://railway.app))
- GitHub repository connected to Railway
- Access to Railway project
- Cerberus IAM API deployed and accessible

### Initial Setup

#### 1. Create New Project

1. Log in to [Railway](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `app` repository
5. Select the branch to deploy (usually `main`)

#### 2. Configure Service

Railway will auto-detect Next.js and configure build settings:

- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Install Command**: `npm install`

If not auto-detected, set these manually in the service settings.

#### 3. Set Environment Variables

In the Railway dashboard, go to **Variables** tab and add:

```bash
# Required Variables
NEXT_PUBLIC_API_BASE_URL=https://your-api.railway.app
API_BASE_URL=https://your-api.railway.app
NEXT_PUBLIC_APP_URL=https://your-app.railway.app

# Optional Variables
NEXT_PUBLIC_ORG_SLUG=cerberus-iamanization
NODE_ENV=production
```

#### 4. Configure Domain

1. Go to **Settings** → **Domains**
2. Click "Generate Domain" for a Railway subdomain
3. Or add custom domain:
   - Add your domain (e.g., `iam.yourdomain.com`)
   - Update DNS records as shown
   - Wait for SSL certificate provisioning

### GitHub Actions Integration

The project includes a GitHub Actions workflow for automated deployments.

#### Setup Railway Token

1. Go to Railway → **Account Settings** → **Tokens**
2. Create new token with project access
3. Add to GitHub repository secrets:
   - Go to GitHub repo → **Settings** → **Secrets and variables** → **Actions**
   - Add secret: `RAILWAY_TOKEN` with the token value
   - Add secret: `RAILWAY_SERVICE_NAME` with your service name

#### Workflow

The `.github/workflows/deploy-railway.yml` workflow:

- Triggers on push to `main` branch
- Runs tests before deploying
- Deploys to Railway automatically
- Notifies on success/failure

## Environment Variables

### Required Variables

| Variable                   | Description                | Example                   | Where Used |
| -------------------------- | -------------------------- | ------------------------- | ---------- |
| `NEXT_PUBLIC_API_BASE_URL` | API base URL (client-side) | `https://api.example.com` | Browser    |
| `API_BASE_URL`             | API base URL (server-side) | `https://api.example.com` | Server     |
| `NEXT_PUBLIC_APP_URL`      | Frontend app URL           | `https://iam.example.com` | Browser    |

### Optional Variables

| Variable               | Description             | Default      | Example      |
| ---------------------- | ----------------------- | ------------ | ------------ |
| `NEXT_PUBLIC_ORG_SLUG` | Organization identifier | -            | `acme-corp`  |
| `NODE_ENV`             | Environment mode        | `production` | `production` |

### Setting Variables in Railway

1. Navigate to your service
2. Click on **Variables** tab
3. Click **Raw Editor** for bulk paste:

```
NEXT_PUBLIC_API_BASE_URL=https://your-api.railway.app
API_BASE_URL=https://your-api.railway.app
NEXT_PUBLIC_APP_URL=https://your-app.railway.app
NEXT_PUBLIC_ORG_SLUG=cerberus-iam
NODE_ENV=production
```

4. Click **Save**
5. Railway will automatically redeploy

## Build Configuration

### Build Settings

Railway automatically detects Next.js projects. Verify these settings:

```json
{
  "buildCommand": "npm run build",
  "startCommand": "npm run start",
  "installCommand": "npm install"
}
```

### Build Optimization

The project is configured for optimal production builds:

- **Output**: Standalone build for smaller Docker images
- **Minification**: Enabled
- **Source Maps**: Disabled in production
- **Image Optimization**: Next.js image optimization enabled

### next.config.ts

```typescript
const nextConfig = {
  output: 'standalone', // For containerized deployments
  reactStrictMode: true,
  poweredByHeader: false, // Security: hide X-Powered-By header
}
```

## Pre-Deployment Checklist

Before deploying to production:

### Code Quality

- [ ] All tests passing (`npm test`)
- [ ] E2E tests passing (`npm run test:e2e`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code formatted (`npm run format`)
- [ ] TypeScript compilation successful (`npx tsc --noEmit`)

### Security

- [ ] No secrets in code
- [ ] Environment variables configured
- [ ] Dependencies updated and audited (`npm audit`)
- [ ] HTTPS configured
- [ ] Security headers configured

### Documentation

- [ ] README.md updated
- [ ] CHANGELOG.md updated
- [ ] API documentation current
- [ ] Environment variables documented

### Performance

- [ ] Build succeeds (`npm run build`)
- [ ] Build size acceptable
- [ ] Images optimized
- [ ] No console errors in production build

## Deployment Process

### Automatic Deployment (Recommended)

Merging to `main` branch triggers automatic deployment:

```bash
# Create and merge PR
git checkout -b feat/your-feature
# Make changes
git commit -m "feat: add feature"
git push origin feat/your-feature
# Create PR, get approval, merge

# GitHub Actions will:
# 1. Run tests
# 2. Build application
# 3. Deploy to Railway
```

### Manual Deployment

If needed, deploy manually:

#### Via Railway CLI

1. Install Railway CLI:

   ```bash
   npm install -g @railway/cli
   ```

2. Login:

   ```bash
   railway login
   ```

3. Link project:

   ```bash
   railway link
   ```

4. Deploy:
   ```bash
   railway up
   ```

#### Via Railway Dashboard

1. Go to Railway project
2. Click on service
3. Click **Deploy** → **Deploy Latest**

## Post-Deployment Verification

After deployment, verify the application:

### Automated Checks

The deployment workflow includes automated checks:

- [ ] Deployment completed successfully
- [ ] Service is running
- [ ] Health check passing

### Manual Checks

1. **Application Accessibility**:

   ```bash
   curl https://your-app.railway.app
   ```

2. **Authentication Flow**:
   - Visit login page
   - Attempt login
   - Verify redirect to dashboard

3. **API Connectivity**:
   - Check browser console for errors
   - Verify API calls succeed
   - Check network tab

4. **Core Features**:
   - [ ] Login works
   - [ ] Registration works
   - [ ] Dashboard loads
   - [ ] User management accessible
   - [ ] Navigation functional

### Monitor Logs

```bash
# Via Railway CLI
railway logs

# Or check Railway dashboard → Deployments → View Logs
```

### Check Metrics

Monitor in Railway dashboard:

- **CPU Usage**: Should stabilize after deployment
- **Memory Usage**: Should remain consistent
- **Response Times**: < 200ms for static pages
- **Error Rate**: Should be 0% or near 0%

## Rollback Procedures

If deployment fails or introduces issues:

### Via Railway Dashboard

1. Go to **Deployments** tab
2. Find the last working deployment
3. Click **...** → **Redeploy**
4. Confirm rollback

### Via GitHub

1. Identify last working commit
2. Revert problematic commits:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```
3. Automatic deployment will trigger

### Emergency Rollback

For critical issues:

1. Immediately revert to last known good deployment
2. Investigate issue in development
3. Create hotfix branch
4. Deploy fix once verified

## Monitoring and Logging

### Railway Logs

Access logs via:

- **Dashboard**: Deployments → View Logs
- **CLI**: `railway logs` or `railway logs --tail`

### Log Levels

```typescript
// In code
console.log('[INFO]', message) // General information
console.warn('[WARN]', message) // Warnings
console.error('[ERROR]', message) // Errors
```

### Metrics to Monitor

- **Deployment Success Rate**: Should be > 95%
- **Build Time**: Typically 2-5 minutes
- **Response Time**: < 200ms for static, < 500ms for API calls
- **Error Rate**: < 1%
- **Memory Usage**: < 80% of allocated
- **CPU Usage**: < 70% average

### Alerts

Set up alerts in Railway:

1. Go to **Settings** → **Notifications**
2. Configure alerts for:
   - Deployment failures
   - High error rates
   - Resource usage thresholds
   - Downtime

## Troubleshooting

### Deployment Fails

**Issue**: Build fails with error

**Solutions**:

1. Check build logs for errors
2. Verify `package.json` scripts
3. Ensure all dependencies in `package.json`
4. Check for TypeScript errors: `npx tsc --noEmit`
5. Test build locally: `npm run build`

### Application Won't Start

**Issue**: Build succeeds but app doesn't start

**Solutions**:

1. Check start command: Should be `npm run start`
2. Verify build created `.next` folder
3. Check environment variables are set
4. Review startup logs for errors

### Environment Variables Not Working

**Issue**: App can't connect to API

**Solutions**:

1. Verify variables are set in Railway
2. Check variable names (case-sensitive)
3. Ensure `NEXT_PUBLIC_` prefix for client-side vars
4. Redeploy after changing variables

### API Connection Issues

**Issue**: Frontend can't reach backend

**Solutions**:

1. Verify API URL is correct
2. Check CORS settings on backend
3. Ensure API is deployed and running
4. Test API directly: `curl https://api-url/health`
5. Check network tab in browser dev tools

### Performance Issues

**Issue**: Slow page loads

**Solutions**:

1. Check Railway resource usage
2. Optimize images
3. Enable caching
4. Review bundle size
5. Consider upgrading Railway plan

## Alternative Platforms

### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_API_BASE_URL production
```

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod

# Build settings in netlify.toml
```

### Docker

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

---

For questions or issues, contact the DevOps team or open a GitHub issue.

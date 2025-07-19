# PassportPal Deployment Guide

## Prerequisites

1. **Database Setup**: You need a PostgreSQL database
   - **Recommended**: [Neon](https://neon.tech) (free tier available)
   - **Alternative**: [Supabase](https://supabase.com) or [Railway](https://railway.app)

2. **Environment Variables**:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NODE_ENV`: Set to "production" for deployment

## Deployment Options

### Option 1: Replit (Recommended - Already Configured)

**Steps:**
1. Go to [replit.com](https://replit.com)
2. Create a new Node.js project
3. Upload your project files
4. Set environment variables in "Secrets":
   - `DATABASE_URL`: Your PostgreSQL connection string
5. Click "Run" - deployment is automatic

**Advantages:**
- ✅ Already configured with `.replit` file
- ✅ Free hosting
- ✅ Built-in database support
- ✅ Automatic HTTPS

### Option 2: Vercel

**Steps:**
1. Install Vercel CLI: `npm i -g vercel`
2. Set environment variables:
   ```bash
   vercel env add DATABASE_URL
   ```
3. Deploy:
   ```bash
   vercel --prod
   ```

**Advantages:**
- ✅ Global CDN
- ✅ Automatic deployments
- ✅ Free tier available

### Option 3: Railway

**Steps:**
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Add environment variables in Railway dashboard
4. Deploy automatically

**Advantages:**
- ✅ Built-in PostgreSQL database
- ✅ Automatic deployments
- ✅ Easy environment variable management

### Option 4: Render

**Steps:**
1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set environment variables
5. Deploy

**Advantages:**
- ✅ Free tier available
- ✅ Automatic deployments
- ✅ Built-in SSL

## Database Setup

### Using Neon (Recommended)

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Set as `DATABASE_URL` environment variable

### Using Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. Set as `DATABASE_URL` environment variable

## Environment Variables

Set these in your deployment platform:

```bash
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
PORT=5000  # Optional, defaults to 5000
```

## Build and Deploy

### Local Testing

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Test locally
npm run start
```

### Production Deployment

The project is already configured for production deployment. The build process:

1. **Frontend**: Vite builds React app to `dist/public/`
2. **Backend**: esbuild bundles Node.js server to `dist/index.js`
3. **Start**: Production server serves both static files and API

## Post-Deployment

### Verify Deployment

1. Check if the app loads at your deployment URL
2. Test wallet connection (MetaMask)
3. Test QR code scanning
4. Verify admin dashboard access

### Monitoring

- Check application logs in your deployment platform
- Monitor database connections
- Verify environment variables are set correctly

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify `DATABASE_URL` is correct
   - Check if database is accessible from deployment region

2. **Build Failures**
   - Ensure all dependencies are in `package.json`
   - Check TypeScript compilation errors

3. **Port Issues**
   - Most platforms use `PORT` environment variable
   - Default is 5000, but platforms may override

4. **Static File Serving**
   - Verify `dist/public/` contains built frontend files
   - Check if server is configured to serve static files

### Support

- Check deployment platform logs
- Verify environment variables
- Test locally before deploying

## Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **Database**: Use connection pooling in production
3. **HTTPS**: Most platforms provide automatic SSL
4. **CORS**: Configure if needed for your domain

## Performance Optimization

1. **Database**: Use connection pooling
2. **Static Files**: CDN for better performance
3. **Caching**: Implement caching for crypto prices
4. **Monitoring**: Set up application monitoring 
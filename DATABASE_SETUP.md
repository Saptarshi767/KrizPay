# Database Setup Guide

## Quick Setup Options

### Option 1: Neon (Recommended - Free)

1. Go to [neon.tech](https://neon.tech)
2. Sign up for free account
3. Create a new project
4. Copy the connection string
5. Set as `DATABASE_URL` environment variable

**Connection string format:**
```
postgresql://username:password@host:port/database
```

### Option 2: Supabase (Free)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. Set as `DATABASE_URL` environment variable

### Option 3: Railway (Free)

1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Add PostgreSQL service
4. Copy the connection string
5. Set as `DATABASE_URL` environment variable

## Local Development

For local development, you can use:

### Docker PostgreSQL

```bash
docker run --name passportpal-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=passportpal -p 5432:5432 -d postgres
```

Then set:
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/passportpal
```

### SQLite (Alternative)

If you want to use SQLite for development, modify `drizzle.config.ts`:

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: "sqlite://./dev.db",
  },
});
```

## Environment Variables

Set these in your deployment platform:

```bash
# Required
DATABASE_URL=postgresql://username:password@host:port/database

# Optional
NODE_ENV=production
PORT=5000
```

## Testing Database Connection

You can test your database connection by running:

```bash
npm run db:push
```

This will create the database tables if they don't exist.

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if database is running
   - Verify connection string format
   - Check firewall settings

2. **Authentication Failed**
   - Verify username and password
   - Check if user has proper permissions

3. **Database Not Found**
   - Create the database if it doesn't exist
   - Check database name in connection string

### Support

- Check database provider documentation
- Verify connection string format
- Test connection with a database client 
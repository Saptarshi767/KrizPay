# PowerShell script to set up Vercel environment variables
Write-Host "Setting up Vercel environment variables..." -ForegroundColor Green

# Set the DATABASE_URL environment variable
$databaseUrl = "postgresql://neondb_owner:npg_XSeLc7iwNCv4@ep-crimson-bonus-a16htxlf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

Write-Host "Adding DATABASE_URL to Vercel..." -ForegroundColor Yellow
Write-Host "Please select 'Production' when prompted" -ForegroundColor Cyan

# Add the environment variable
vercel env add DATABASE_URL production

Write-Host "Environment variable setup complete!" -ForegroundColor Green
Write-Host "Your app URL: https://passportpal-leyctj93d-saptarshi767s-projects.vercel.app" -ForegroundColor Cyan 
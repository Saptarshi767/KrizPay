@echo off
echo 🚀 Starting PassportPal Deployment...

REM Check if DATABASE_URL is set
if "%DATABASE_URL%"=="" (
    echo ❌ Error: DATABASE_URL environment variable is not set
    echo Please set your PostgreSQL database URL:
    echo set DATABASE_URL=postgresql://username:password@host:port/database
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Build the project
echo 🔨 Building project...
call npm run build

REM Check if build was successful
if %ERRORLEVEL% EQU 0 (
    echo ✅ Build successful!
    echo 🚀 Starting production server...
    call npm run start
) else (
    echo ❌ Build failed!
    pause
    exit /b 1
) 
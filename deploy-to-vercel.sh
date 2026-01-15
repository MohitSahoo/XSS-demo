#!/bin/bash

# XSS Demo - Vercel Deployment Script
# This script helps deploy the XSS demo to Vercel

echo "🚀 XSS Demo - Vercel Deployment Setup"
echo "======================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found."
    echo "📦 Installing Vercel CLI globally..."
    npm install -g vercel
fi

echo "✅ Vercel CLI is ready"
echo ""
echo "📝 Deployment Steps:"
echo "1. Ensure you have a GitHub account and have pushed your code"
echo "2. Sign in to Vercel using: vercel login"
echo "3. Deploy using: vercel --prod"
echo ""
echo "🔗 For MongoDB Atlas:"
echo "   - Sign up at https://www.mongodb.com/cloud/atlas"
echo "   - Create a free cluster"
echo "   - Get your connection string"
echo "   - Add MONGODB_URI to Vercel environment variables"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "⚠️  Git repository not initialized"
    echo "   Run: git init && git add . && git commit -m 'Initial commit'"
    exit 1
fi

# Check if remote is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  Git remote not set"
    echo "   Run: git remote add origin https://github.com/YOUR_USERNAME/XSS-demo.git"
    exit 1
fi

echo "✅ Git repository is set up"
echo ""
echo "Ready to deploy? Run: vercel --prod"

# Deployment Guide for Startosphere

This guide will help you deploy your Startosphere website with logo upload functionality.

## Prerequisites

1. A GitHub account
2. A Vercel account (free) - sign up at https://vercel.com
3. A Cloudinary account (free) - sign up at https://cloudinary.com

## Step 1: Set up Cloudinary (Image Hosting)

1. Go to https://cloudinary.com and create a free account
2. After logging in, go to your Dashboard
3. Note down your **Cloud Name** (you'll see it at the top)
4. Go to Settings → Upload → Upload Presets
5. Click "Add upload preset"
6. Set the following:
   - **Preset name**: `startosphere_logos`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `startosphere` (optional)
7. Click "Save"

## Step 2: Push to GitHub

1. Open Terminal in your project folder
2. Run these commands:

```bash
cd /Users/raihankhan/Documents/Startosphere

# Note: package.json and api/upload-logo.js have been created for you.

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit with logo upload feature"

# Create a new repository on GitHub (go to github.com)
# Then link it (replace YOUR_USERNAME and YOUR_REPO):
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

1. Go to https://vercel.com and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. In the deployment settings:
   - **Framework Preset**: Other
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
5. Click "Environment Variables" and add:
   - `CLOUDINARY_CLOUD_NAME` = your cloud name from Step 1
   - `CLOUDINARY_UPLOAD_PRESET` = `startosphere_logos`
6. Click "Deploy"

## Step 4: Update Your Code

After deployment, Vercel will give you a URL like `https://your-project.vercel.app`

Update `script.js` line ~185 to use your Vercel URL:
```javascript
const response = await fetch('https://your-project.vercel.app/api/upload-logo', {
```

Then commit and push again:
```bash
git add .
git commit -m "Updated API endpoint"
git push
```

Vercel will automatically redeploy!

## Testing

1. Go to your deployed site
2. Navigate to the "Submit Service" page
3. Fill out the form and upload a logo
4. The logo should upload successfully to Cloudinary
5. Check your admin dashboard - the logo URL will be in the provider data

## Troubleshooting

- **Upload fails**: Check Cloudinary upload preset is set to "Unsigned"
- **CORS errors**: Make sure the serverless function has CORS headers
- **Environment variables not working**: Re-add them in Vercel dashboard

## Cost

- **Vercel**: Free tier (100GB bandwidth/month)
- **Cloudinary**: Free tier (25GB storage, 25GB bandwidth/month)
- Both are more than enough for a startup directory!

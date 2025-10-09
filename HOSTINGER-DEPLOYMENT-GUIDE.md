# Hostinger Deployment Guide for NEWS4US

Follow these steps to deploy the NEWS4US website to Hostinger:

## Deployment Steps

1. **Upload contents of dist/ to Hostinger public_html**
   - Upload `index.html`, `assets/` folder, and `.htaccess` file from the `dist/` folder
   - Ensure all files are uploaded completely

2. **Ensure .htaccess sits in public_html alongside index.html**
   - The `.htaccess` file is crucial for SPA routing to work correctly
   - It should be located at the root of your public_html directory

3. **Clear Hostinger cache (if any) and hard refresh the browser**
   - Clear your browser cache completely
   - Perform a hard refresh (Ctrl+F5 or Cmd+Shift+R) to ensure new files are loaded

## Verification Steps

After deployment, verify that:

1. The homepage loads correctly at `https://news4us.in/`
2. All logos and static assets load properly
3. Navigation to `/admin` works without 404 errors (SPA routing)
4. API calls are correctly pointing to the Render backend

## Troubleshooting

If you encounter issues:

1. Check that all files were uploaded completely
2. Verify `.htaccess` file permissions (should be 644)
3. Clear your browser cache completely
4. Check Hostinger's file manager to ensure the directory structure is correct

## Additional Notes

- The SPA routing configuration ensures all frontend routes (including `/admin`) are handled by the React application
- API calls are configured to use environment variables, pointing to your Render backend in production
- All assets are referenced with root-absolute paths for consistent loading across routes
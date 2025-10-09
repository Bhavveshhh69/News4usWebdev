# Hostinger Deployment Guide for NEWS4US

## Deployment Steps

1. **Upload Files to Hostinger**
   - Upload the entire contents of the `dist/` folder to your Hostinger `public_html` directory
   - Ensure the following files/folders are present:
     - `index.html`
     - `assets/` folder with hashed files
     - `.htaccess` file

2. **Verify .htaccess Location**
   - Confirm that the `.htaccess` file is located directly in `public_html` alongside `index.html`
   - This file is crucial for SPA routing to work correctly

3. **Clear Cache and Test**
   - Clear any Hostinger cache if available
   - Perform a hard refresh of your browser (Ctrl+F5 or Cmd+Shift+R)
   - Test both the home page and `/admin` route to ensure they load correctly

## Verification Checklist

After deployment, verify that:
- [ ] Homepage loads without errors
- [ ] Logo displays correctly at https://news4us.in/logo.png
- [ ] All static assets load from `/assets/` paths
- [ ] Navigation to `/admin` works without 404 errors
- [ ] API calls are hitting the Render backend (check Network tab in DevTools)

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
# Cloudinary + Google Sheets env vars for custom preview/order image uploads

For the Netlify function `netlify/functions/submit-preview.js`, configure these environment variables in **Netlify → Site configuration → Environment variables**.

## Required Cloudinary variables

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

If any of the required Cloudinary variables above are missing and a customer uploads an image, the function returns a clear error listing exactly which variable names are missing.

## Optional Cloudinary variables

- `CLOUDINARY_FOLDER` (preferred folder variable)
- `CLOUDINARY_UPLOAD_FOLDER` (legacy fallback name still supported)
- `CLOUDINARY_UPLOAD_PRESET` (optional; included if present)

If no folder env var is set, uploads default to `cdla-custom-orders`.

## Required Google Sheets variables

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_SHEET_ID`

## Expected sheet columns for appended row values

The function appends values in this order:

1. Submitted At
2. Status
3. Customer name
4. Email
5. Phone
6. Product name
7. SKU
8. Ring size
9. Inside text
10. Outside text
11. Selected symbols
12. Customer notes
13. Estimated total
14. Uploaded Image URL
15. Uploaded Image Filename

`Customization Summary` is intentionally not included.

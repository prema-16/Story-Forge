# Multi-Cloud Storage Architecture Documentation

## Storage Providers Supported
- AWS S3
- Cloudflare R2
- Google Cloud Storage (GCS)
- Azure Blob Storage
- Cloudinary Asset Vault

## Lifecycle Policies
- Active assets stored in high-performance S3 / R2 buckets.
- Auto-migration to Cold Glacier storage after 90 days of inactivity.

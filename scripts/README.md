# GCP Database Setup Scripts

This directory contains scripts to set up the Smart Redirect System database in Google Cloud Platform (GCP).

## Files

- `setup-gcp-database.sh` - Main setup script for GCP Cloud SQL
- `init-gcp-database.sql` - SQL schema initialization script
- `README.md` - This documentation file

## Prerequisites

1. **Google Cloud SDK**: Install the gcloud CLI

   ```bash
   # macOS
   brew install google-cloud-sdk

   # Or download from: https://cloud.google.com/sdk/docs/install
   ```

2. **Authentication**: Login to your Google Cloud account

   ```bash
   gcloud auth login
   ```

3. **Project Setup**: Have a GCP project ready with billing enabled

## Quick Start

### 1. Configure Environment Variables (Optional)

You can set these environment variables to customize the setup:

```bash
export GCP_PROJECT_ID="your-project-id"
export DB_INSTANCE_NAME="temp-redirect-db"
export DB_NAME="temp_redirect"
export DB_USER="redirect_app"
export GCP_REGION="us-central1"
export DB_TIER="db-f1-micro"
```

### 2. Run the Setup Script

From the project root directory:

```bash
./scripts/setup-gcp-database.sh
```

The script will:

- Enable required GCP APIs
- Create a Cloud SQL PostgreSQL instance
- Create the database and application user
- Initialize the database schema
- Provide connection details

### 3. Update Your Environment

After the script completes, update your `.env` file with the provided `DATABASE_URL`.

## Manual Setup (Alternative)

If you prefer to set up manually or need more control:

### 1. Create Cloud SQL Instance

```bash
gcloud sql instances create temp-redirect-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --storage-type=SSD \
    --storage-size=10GB
```

### 2. Set Root Password

```bash
gcloud sql users set-password postgres \
    --instance=temp-redirect-db \
    --password=YOUR_SECURE_PASSWORD
```

### 3. Create Database

```bash
gcloud sql databases create temp_redirect --instance=temp-redirect-db
```

### 4. Create Application User

```bash
gcloud sql users create redirect_app \
    --instance=temp-redirect-db \
    --password=YOUR_APP_PASSWORD
```

### 5. Initialize Schema

```bash
gcloud sql connect temp-redirect-db --user=postgres --database=temp_redirect < scripts/init-gcp-database.sql
```

## Configuration Options

### Instance Tiers

- `db-f1-micro` - Free tier (1 vCPU, 0.6 GB RAM)
- `db-g1-small` - 1 vCPU, 1.7 GB RAM
- `db-custom-1-3840` - Custom (1 vCPU, 3.75 GB RAM)

### Regions

Common regions:

- `us-central1` - Iowa
- `us-east1` - South Carolina
- `europe-west1` - Belgium
- `asia-southeast1` - Singapore

## Security Considerations

### 1. Authorized Networks

Restrict access to specific IP addresses:

```bash
gcloud sql instances patch temp-redirect-db \
    --authorized-networks=YOUR_IP_ADDRESS
```

### 2. Cloud SQL Proxy (Recommended for Production)

For secure connections without exposing public IPs:

```bash
# Install Cloud SQL Proxy
curl -o cloud_sql_proxy https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64
chmod +x cloud_sql_proxy

# Run proxy
./cloud_sql_proxy -instances=PROJECT_ID:REGION:INSTANCE_NAME=tcp:5432
```

Then use `localhost:5432` in your connection string.

### 3. Environment Variables

Store sensitive information securely:

```bash
# Using Google Secret Manager
gcloud secrets create database-url --data-file=.env

# In your application, retrieve the secret
gcloud secrets versions access latest --secret="database-url"
```

## Troubleshooting

### Common Issues

1. **Permission Denied**

   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **API Not Enabled**

   ```bash
   gcloud services enable sqladmin.googleapis.com
   ```

3. **Instance Already Exists**

   - The script handles this gracefully
   - You can delete and recreate: `gcloud sql instances delete INSTANCE_NAME`

4. **Connection Issues**
   - Check authorized networks
   - Verify firewall rules
   - Ensure SSL is properly configured

### Logs and Monitoring

View instance logs:

```bash
gcloud sql operations list --instance=temp-redirect-db
gcloud logging read "resource.type=gce_instance"
```

## Cost Optimization

### Free Tier Limits

- 1 f1-micro instance per project
- 30 GB storage
- Limited to certain regions

### Cost Monitoring

```bash
# Set up billing alerts
gcloud alpha billing budgets create \
    --billing-account=BILLING_ACCOUNT_ID \
    --display-name="Cloud SQL Budget" \
    --budget-amount=10USD
```

## Backup and Recovery

### Automated Backups

Backups are enabled by default. To create manual backup:

```bash
gcloud sql backups create --instance=temp-redirect-db
```

### Point-in-Time Recovery

```bash
gcloud sql backups restore BACKUP_ID \
    --restore-instance=temp-redirect-db-restored \
    --backup-instance=temp-redirect-db
```

## Cleanup

To delete all resources:

```bash
# Delete the instance (this will delete all data!)
gcloud sql instances delete temp-redirect-db

# Disable APIs (optional)
gcloud services disable sqladmin.googleapis.com
```

## Support

For issues with this setup:

1. Check the [Cloud SQL documentation](https://cloud.google.com/sql/docs)
2. Review GCP billing and quotas
3. Check the project's error logs

For application-specific issues, refer to the main project README.

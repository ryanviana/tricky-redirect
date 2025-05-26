# Smart Redirect System

A one-time smart redirect system that behaves conditionally based on visitor history. Perfect for scenarios where you want to redirect first-time visitors to one URL (e.g., Calendly) and returning visitors to another URL (e.g., WhatsApp).

## ✨ Features

- **Conditional Redirects**: First visit → URL A, subsequent visits → URL B
- **IP-based Tracking**: Tracks unique visitors by IP address
- **Custom Slugs**: Create memorable short links like `schedule.yoursite.com/ABC123`
- **Modern UI**: Clean, responsive interface built with Tailwind CSS
- **Type-safe**: Built with TypeScript for better development experience
- **Database Persistence**: PostgreSQL with Prisma ORM

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone and install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   cp env.example .env
   ```

   Edit `.env` and add your database URL:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/temp_redirect?schema=public"
   ```

3. **Set up the database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📖 Usage

### Creating a Redirect

1. Visit the homepage
2. Fill in the form:
   - **Slug**: Custom identifier (e.g., `ABC123`)
   - **First Visit URL**: Where first-time visitors go
   - **Subsequent Visits URL**: Where returning visitors go
3. Click "Create Redirect"
4. Copy the generated link

### How Redirects Work

- **First visit**: `yoursite.com/ABC123` → redirects to First Visit URL
- **Subsequent visits**: `yoursite.com/ABC123` → redirects to Subsequent Visits URL

Visitor tracking is based on IP address, so the same person from the same network will be considered a returning visitor.

## 🏗️ Architecture

### Database Schema

**redirects table:**

- `id`: Unique identifier
- `slug`: URL slug (e.g., "ABC123")
- `first_url`: First-time visitor destination
- `next_url`: Returning visitor destination
- `created_at`: Creation timestamp

**redirect_visits table:**

- `id`: Unique identifier
- `slug_id`: Foreign key to redirects
- `visitor_ip`: Visitor's IP address
- `visited_at`: Visit timestamp

### API Endpoints

- `POST /api/redirects` - Create a new redirect
- `GET /api/redirects` - List all redirects with visit counts
- `DELETE /api/redirects/[id]` - Delete a specific redirect
- `GET /[slug]` - Handle redirect logic

### Pages

- `/` - Homepage with redirect creation form
- `/urls` - URL management dashboard to view and delete redirects

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/temp_redirect?schema=public"

# Optional: For production
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://yoursite.com"
```

### Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Create and run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Railway/Render

1. Connect your repository
2. Set environment variables
3. Deploy with automatic PostgreSQL provisioning

### Google Cloud Platform

Use the provided scripts for GCP deployment:

```bash
# Set up Cloud SQL database
./scripts/setup-gcp-database.sh

# Deploy to Cloud Run (optional)
gcloud run deploy temp-redirect \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

See `scripts/README.md` for detailed GCP setup instructions.

### Custom Server

1. Build the application: `npm run build`
2. Start the server: `npm start`
3. Ensure PostgreSQL is accessible

## 🔒 Security Considerations

- IP-based tracking can be spoofed but is sufficient for most use cases
- Consider rate limiting for production use
- Validate all URLs before storing
- Use HTTPS in production

## 🛠️ Development

### Project Structure

```
src/
├── app/
│   ├── [slug]/          # Dynamic route for redirects
│   ├── api/redirects/   # API endpoints
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Homepage
├── lib/
│   └── prisma.ts        # Database client
└── components/          # Reusable components (future)
```

### Adding Features

- **Analytics Dashboard**: Track redirect usage and statistics
- **Expiration**: Add time-based expiration for redirects
- **Bulk Creation**: Import multiple redirects from CSV
- **QR Codes**: Generate QR codes for redirects

## 📝 License

MIT License - feel free to use this project for any purpose.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues or questions, please open a GitHub issue or contact the development team.

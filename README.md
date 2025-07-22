# 🚛 Freight Delivery Monitor

Real-time freight delivery monitoring with AI-powered customer notifications.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm
- Temporal CLI

### Installation
```bash
# Install dependencies
npm install

# Install Temporal CLI
# Option 1: Mac (Homebrew)
brew install temporal

# Option 2: Linux/Mac (curl)
curl -sSf https://temporal.download/cli.sh | sh

# Start Temporal server
temporal server start-dev

# Start worker (Terminal 1)
npm run dev

# Start API server (Terminal 2)  
npm run api:dev
```

### Environment Setup
Create `.env` file:
```bash
# Development (no API keys needed)
USE_MOCK_TRAFFIC=true
USE_MOCK_OPENAI=true
USE_MOCK_NOTIFICATIONS=true
DELAY_THRESHOLD_MINUTES=30

# Production (optional - requires API keys)
GOOGLE_MAPS_API_KEY=your_key
OPENAI_API_KEY=your_key
SENDGRID_API_KEY=your_key
SENDGRID_FROM_EMAIL=noreply@company.com
```

## 📡 API Usage

### Start Monitoring
```bash
curl -X POST http://localhost:3000/api/delivery/start-monitoring \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "New York, NY",
    "destination": "Los Angeles, CA",
    "customerId": "CUST-123",
    "customerName": "John Smith",
    "customerEmail": "john@example.com",
    "customerPhone": "+1-555-123-4567"
  }'
```

### Check Status
```bash
curl http://localhost:3000/api/delivery/status/{workflowId}
```

### Health Check
```bash
curl http://localhost:3000/health
```

## 🎯 How It Works

1. **Traffic Analysis** - Checks route delays via Google Maps API
2. **Smart Notifications** - Sends emails only if delay > threshold (30 min)
3. **AI Messages** - Generates personalized delay notifications
4. **Email Delivery** - Sends via SendGrid

## 🔧 Commands

```bash
npm run dev         # Start worker
npm run api:dev     # Start API server  
npm run build       # Build for production
npm test            # Run tests
```

## 🐛 Troubleshooting

- **Temporal errors**: Ensure `temporal server start-dev` is running
- **API errors**: Use mock mode with `USE_MOCK_*=true`

## 📁 Project Structure

```
src/
├── activities/     # Business logic (traffic, messaging, notifications)
├── services/       # External API integrations
├── workflows/      # Temporal workflow orchestration
├── api-server.ts   # REST API endpoints
└── worker.ts       # Temporal worker
```
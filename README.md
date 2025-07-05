# 🚀 WhatsGrapp - AI-Powered WhatsApp Payment Platform

**Your Go-To Solution for End-to-End Payment Solutions Using Natural Language**

WhatsGrapp is a modern fintech platform that combines WhatsApp messaging, AI-powered chatbots, and seamless payment processing. Built with Next.js, Supabase, and integrated with Twilio WhatsApp API and Google Gemini AI.

![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)
![WhatsApp](https://img.shields.io/badge/WhatsApp-API-25D366)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4)

## 🌟 Key Features

### 💬 **AI-Powered WhatsApp Integration**
- **Intelligent Chatbot**: Powered by Google Gemini AI for natural language processing
- **Smart Intent Recognition**: Understands user requests automatically
- **Context-Aware Responses**: Maintains conversation history and context
- **Fallback Logic**: Works intelligently even without AI API
- **Real-time Message Processing**: Instant WhatsApp webhook integration

### 🏪 **Merchant Management**
- **Quick Onboarding**: Register businesses via WhatsApp or web interface
- **Product Catalog**: Add and manage products with descriptions and pricing
- **Payment Link Generation**: Create instant checkout links for any product
- **Business Analytics**: Track sales, orders, and customer interactions

### 💳 **Payment Processing**
- **Multiple Payment Methods**: Credit/Debit Cards, Bank Transfer, Cash on Delivery, GrabPay
- **Grab Financial Integration**: Direct access to Grab Loan products
- **Dynamic Checkout**: Handle custom amounts and product-specific payments
- **Secure Processing**: Built with modern security practices

### 📊 **Real-time Monitoring**
- **WhatsApp Message Monitor**: Live feed of all WhatsApp interactions
- **Database Monitor**: Real-time view of all saved data
- **Analytics Dashboard**: Business insights and performance metrics
- **Test Dashboard**: Simulate WhatsApp flows without Twilio

### 🤖 **Model Context Protocol (MCP) Features**
- **Advanced Chat Processing**: Sophisticated conversation handling
- **Intent Classification**: Automatic categorization of user requests
- **Action Triggering**: AI can directly create merchants and products
- **Session Management**: Persistent chat sessions across interactions
- **Metadata Enrichment**: Rich context saving for all interactions

## 🏗️ Project Structure

```
whatsgrapp/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx             # Homepage with feature overview
│   │   ├── analytics/           # Business analytics dashboard
│   │   ├── checkout/            # Payment processing page
│   │   ├── dashboard/           # Main admin dashboard
│   │   ├── database-monitor/    # Real-time database viewer
│   │   ├── merchant/onboard/    # Merchant registration
│   │   ├── payment-links/       # Payment link generator
│   │   ├── products/manage/     # Product management
│   │   ├── test-dashboard/      # WhatsApp flow simulator
│   │   ├── whatsapp-monitor/    # Live WhatsApp feed
│   │   └── api/                 # API Routes
│   │       ├── ai-chat/         # AI chatbot endpoint
│   │       ├── merchants/       # Merchant CRUD operations
│   │       ├── merchants-list/  # Merchant listing
│   │       ├── products/        # Product management
│   │       ├── whatsapp/        # WhatsApp webhook
│   │       └── whatsapp-messages/ # Message history
│   ├── components/
│   │   ├── ui/                  # Reusable UI components
│   │   └── WhatsAppChatbot.tsx  # Floating chat widget
│   ├── lib/
│   │   ├── services/            # Business logic services
│   │   └── supabase/           # Database configuration
│   └── types/                   # TypeScript definitions
├── supabase/                    # Database schema and migrations
├── public/                      # Static assets
└── tests/                       # Test scripts and utilities
```

## 📱 Pages & Features

### 🏠 **Homepage** (`/`)
- Clean, modern landing page showcasing implemented features
- Navigation to all platform sections
- Call-to-action for merchant onboarding
- WhatsApp chatbot widget integration

### 🏪 **Merchant Onboarding** (`/merchant/onboard`)
- Business registration form
- Contact information collection
- Business category selection
- Instant activation upon submission

### 📦 **Product Management** (`/products/manage`)
- Add new products with details and pricing
- View all registered products
- Generate instant payment links
- Edit and manage product catalog

### 💳 **Checkout Page** (`/checkout`)
- Dynamic product loading via URL parameters
- Customer information collection
- Multiple payment method options
- **Grab Loans Integration**: Prominent financing options
- Order processing and confirmation

### 📊 **Analytics Dashboard** (`/analytics`)
- Sales performance metrics
- Customer interaction insights
- Revenue tracking
- Business growth analytics

### 🔗 **Payment Link Generator** (`/payment-links`)
- Create custom payment links
- QR code generation
- Link sharing capabilities
- Custom amount handling

### 📱 **WhatsApp Monitor** (`/whatsapp-monitor`)
- Live feed of WhatsApp messages
- Real-time message updates
- Message status tracking
- Interaction history

### 🗄️ **Database Monitor** (`/database-monitor`)
- Real-time database viewer
- All tables data display
- Live updates as data changes
- Development and debugging tool

### 🧪 **Test Dashboard** (`/test-dashboard`)
- Simulate WhatsApp conversations
- Test AI responses without Twilio
- Debug chatbot logic
- Development testing interface

### 📈 **Main Dashboard** (`/dashboard`)
- Overview of all platform activities
- Quick access to key features
- Recent activity feed
- Performance summaries

## 🤖 MCP (Model Context Protocol) Features

### **Advanced Chat Processing**
```javascript
// Example: AI-powered merchant registration
User: "Register my coffee shop, Brew Masters, contact: 123-456-7890, category: food"
AI Response: "✅ I've successfully registered Brew Masters! Your coffee shop is now active on WhatsGrapp."
// Automatically creates merchant record in database
```

### **Intent Classification Examples**
- **Merchant Registration**: "register business", "create store", "add merchant"
- **Product Addition**: "add product", "new item", "create product"
- **Price Inquiry**: "how much", "price", "cost"
- **Checkout Request**: "buy", "purchase", "order"

### **Smart Action Triggering**
```javascript
// AI can directly execute business logic
const response = await mcpChatService.processMessage({
  message: "Add product: Premium Coffee, $15, Best quality coffee beans",
  userId: "user123"
});
// Result: Product created + Checkout link generated + Database updated
```

### **Session Management**
- Persistent conversation context
- User preference tracking
- Multi-turn conversation support
- Context-aware responses

### **Metadata Enrichment**
- Rich conversation context
- User intent history
- Action execution logs
- Performance analytics

## ⚙️ API Endpoints

### **Core APIs**
- `POST /api/ai-chat` - AI chatbot processing
- `GET/POST /api/merchants` - Merchant management
- `GET /api/merchants-list` - List all merchants
- `GET/POST /api/products` - Product management
- `POST /api/whatsapp/webhook` - WhatsApp webhook
- `GET /api/whatsapp-messages` - Message history

### **Authentication**
- **Public APIs**: All endpoints are publicly accessible
- **No Authentication Required**: Designed for easy integration
- **Security**: Rate limiting and input validation implemented

## 🛠️ Technology Stack

### **Frontend**
- **Next.js 15.3.5**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component library
- **Framer Motion**: Smooth animations
- **Lucide React**: Beautiful icons

### **Backend**
- **Next.js API Routes**: Serverless functions
- **Supabase**: PostgreSQL database with real-time features
- **Twilio WhatsApp API**: WhatsApp integration
- **Google Gemini AI**: Advanced language processing

### **Development Tools**
- **ESLint**: Code linting
- **TypeScript**: Static type checking
- **PostCSS**: CSS processing
- **Sharp**: Image optimization

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ and npm/yarn
- Supabase account
- Twilio WhatsApp Business API account
- Google AI Studio account (for Gemini AI)

### **1. Clone Repository**
```bash
git clone <repository-url>
cd whatsgrapp
npm install
```

### **2. Environment Setup**
Create `.env.local` file:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Twilio WhatsApp API
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+your_twilio_number

# Google Gemini AI (Optional)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# Application Settings
NEXT_PUBLIC_BASE_URL=http://localhost:3000
WEBHOOK_SECRET=your_webhook_secret
```

### **3. Database Setup**
```bash
# Initialize Supabase
npx supabase init
npx supabase start

# Apply schema
psql -h localhost -p 54322 -U postgres -d postgres < supabase/fresh-complete-schema.sql

# Generate TypeScript types
npm run db:generate
```

### **4. Run Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📋 Database Schema

### **Core Tables**
- **`merchants`**: Business information and contact details
- **`products`**: Product catalog with pricing and descriptions
- **`whatsapp_messages`**: All WhatsApp conversations and interactions
- **`orders`**: Purchase orders and transaction records
- **`customers`**: Customer information and contact details

### **Key Features**
- **Row Level Security (RLS)**: Secure data access
- **Real-time Subscriptions**: Live data updates
- **Public Access**: No authentication required for core operations
- **Automatic Timestamps**: Created/updated tracking

## 🧪 Testing

### **Test Scripts**
```bash
# Test AI Chat Integration
node test-ai-chat.js

# Test API Endpoints
node test-apis.js

# Test Data Saving
node test-data-saving.js

# Test Checkout Updates
node test-checkout-updates.js

# Test Gemini AI
node test-gemini.mjs
```

### **Utility Scripts**
```bash
# Restart Application
restart-whatsgrapp.bat

# Complete Restart with Cleanup
restart-complete.bat

# Auto Restart
restart-auto.bat

# Restart with Twilio Limits
restart-with-limit.bat
```

## 🤖 AI Chatbot Usage Examples

### **Business Registration**
```
User: "I want to register my restaurant, Tasty Bites, phone: +1234567890, category: restaurant"
Bot: "✅ Great! I've registered Tasty Bites as a restaurant. Your business is now active on WhatsGrapp!"
```

### **Product Addition**
```
User: "Add product: Chicken Burger, $12.99, Delicious grilled chicken burger with fries"
Bot: "🍔 Perfect! I've added Chicken Burger ($12.99) to your catalog. Here's your instant checkout link: [link]"
```

### **Smart Recommendations**
```
User: "I need help with payments"
Bot: "I can help you with payment solutions! Here are some options:
- Set up your merchant account
- Create product listings
- Generate payment links
- Process orders through WhatsApp
What would you like to start with?"
```

## 🔧 Advanced Configuration

### **Twilio WhatsApp Setup**
1. Create Twilio account
2. Set up WhatsApp Business API
3. Configure webhook URL: `https://yourdomain.com/api/whatsapp/webhook`
4. Add phone numbers to sandbox (development)

### **Gemini AI Integration**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create API key
3. Add to environment variables
4. Test with provided scripts

### **Supabase Configuration**
1. Create new Supabase project
2. Run schema setup scripts
3. Configure RLS policies
4. Enable real-time subscriptions

## 📈 Performance Features

- **Server-Side Rendering**: Fast initial page loads
- **Static Generation**: Optimized static assets
- **Image Optimization**: Automatic image compression
- **Code Splitting**: Efficient bundle loading
- **Real-time Updates**: Live data synchronization

## 🔒 Security

- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Output sanitization
- **Rate Limiting**: API abuse prevention
- **HTTPS Enforcement**: Secure data transmission

## 🚀 Deployment

### **Vercel Deployment** (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### **Manual Deployment**
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check `AI-CHATBOT-SETUP.md` and `DATABASE-SAVING-SUMMARY.md`
- **Issues**: Create GitHub issues for bugs
- **Questions**: Use GitHub discussions

## 🙏 Acknowledgments

- **Next.js**: Amazing React framework
- **Supabase**: Powerful backend-as-a-service
- **Twilio**: Reliable WhatsApp API
- **Google AI**: Advanced language processing
- **Vercel**: Seamless deployment platform

---

**Built with ❤️ for modern fintech solutions**

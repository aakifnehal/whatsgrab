# WhatsGrab AI Chatbot Setup

## 🤖 AI-Powered Features

WhatsGrab now includes an intelligent AI chatbot powered by Google's Gemini AI that provides:

- **Smart Intent Recognition**: Understands user requests in natural language
- **Context-Aware Responses**: Maintains conversation context and history  
- **Product Recommendations**: Suggests relevant products based on user queries
- **Automated Actions**: Can trigger product addition, merchant registration, and checkout flows
- **Enhanced Fallback**: Works even without AI API with intelligent pattern matching

## 🔧 Setting Up Gemini AI (Optional)

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Update Environment Variables

Edit your `.env.local` file and replace the placeholder:

```bash
# Replace this placeholder with your actual API key
GOOGLE_GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Test the Integration

Run the AI test script:
```bash
node test-ai-chat.js
```

## 🚀 Features Working Without AI

Even without the Gemini API key configured, the chatbot provides:

- **Pattern-based responses** for common commands
- **Business registration** via comma-separated format
- **Product addition** with instant checkout links
- **Smart suggestions** based on user input
- **Contextual help** and guidance

## 💬 How to Use the Chatbot

### Business Registration
```
Tech Store, +65 9123 4567, We sell latest electronics and gadgets
```

### Add Products
```
iPhone 15, 1200, Latest smartphone with advanced camera
MacBook Pro, 2500, Professional laptop for creators
AirPods Pro, 300, Wireless earbuds with noise cancellation
```

### Natural Language Commands
- "hello" - Get started
- "setup business" - Business registration guide
- "add product" - Product addition guide  
- "show products" - List available products
- "help" - Get assistance

## 🎨 UI Features

- **Android WhatsApp UI**: Authentic mobile WhatsApp interface
- **Centered Modal**: Opens in center of screen with phone frame
- **Quick Suggestions**: Smart reply buttons based on context
- **Typing Indicators**: Realistic chat experience
- **Product Links**: Auto-generated checkout URLs

## 🔄 Fallback System

The system includes multiple fallback layers:

1. **Gemini AI Response** (if API key is valid)
2. **Enhanced Pattern Matching** (intelligent fallbacks)
3. **Basic Responses** (guaranteed to work)

This ensures users always get helpful responses regardless of AI availability.

## 🛠️ Technical Details

- **Service**: `/src/lib/services/gemini-ai.service.ts`
- **API Route**: `/src/app/api/ai-chat/route.ts`
- **UI Component**: `/src/components/WhatsAppChatbot.tsx`
- **Test Script**: `test-ai-chat.js`

## 📊 Monitoring

All conversations are logged to the database for analytics:
- User messages and AI responses
- Intent classification
- Merchant and product interactions
- Error tracking for improvements

The AI integration makes WhatsGrab's chatbot significantly more intelligent while maintaining full functionality as a fallback!

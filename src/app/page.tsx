import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <span className="text-xl font-bold text-gray-900">WhatsGrapp</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/products" className="text-gray-600 hover:text-gray-900">Products</Link>
              <Link href="/database-monitor" className="text-gray-600 hover:text-gray-900">Database</Link>
              <Link href="#features" className="text-gray-600 hover:text-gray-900">Features</Link>
              <Link href="/merchant/onboard" className="text-gray-600 hover:text-gray-900">Register</Link>
            </nav>
            <div className="flex space-x-4">
              <Link href="/products">
                <Button variant="outline">Browse Products</Button>
              </Link>
              <Link href="/merchant/onboard">
                <Button>Try Chatbot</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            Your Business on
            <span className="text-green-600"> WhatsApp</span>
          </h1>
          <p className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto">
            Experience the future of e-commerce setup through natural language conversations. 
            Our AI chatbot handles everything from business registration to product management - just by chatting!
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/merchant/onboard">
              <Button size="lg" className="px-8 py-4 text-lg">
                🤖 Try AI Chatbot
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                �️ View Products
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="mt-32">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Actually Implemented Features</h2>
            <p className="mt-4 text-lg text-gray-600">Real features you can use right now</p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🏪</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Merchant Registration</h3>
              <p className="text-gray-600">Quick business registration via WhatsApp chat or web forms with database storage.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Product Management</h3>
              <p className="text-gray-600">Add products via chat or web interface with instant checkout link generation.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Checkout Pages</h3>
              <p className="text-gray-600">Auto-generated product checkout pages with customer information collection.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Chatbot</h3>
              <p className="text-gray-600">Gemini AI-powered WhatsApp-style chatbot with natural language processing.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Database Monitor</h3>
              <p className="text-gray-600">Real-time dashboard showing all saved messages, merchants, and products.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">�️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Product Catalog</h3>
              <p className="text-gray-600">Browse all products from all merchants with search and filtering capabilities.</p>
            </div>
          </div>
        </div>

        {/* Browse Products Section */}
        <div className="mt-20 text-center">
          <div className="bg-white rounded-2xl p-12 shadow-lg">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-6">
              <span className="text-4xl">🛍️</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Live Product Marketplace
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Browse real products from registered merchants. All products are added via our AI chatbot 
              and have working checkout pages with customer data collection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="px-8 py-4 text-lg bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                  🛒 Browse Products
                </Button>
              </Link>
              <Link href="/database-monitor">
                <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-2">
                  📊 View Database
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* WhatsApp Chatbot Highlight */}
        <div className="mt-16 bg-green-50 rounded-2xl p-8 border border-green-200">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.588z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              💬 Try Our AI-Powered WhatsApp Chatbot!
            </h3>
            <p className="text-green-700 text-lg mb-4">
              Test all features right here! Our Gemini AI chatbot handles business registration, 
              product management, and checkout generation using natural language.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-600">
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>AI Business Setup</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Smart Product Addition</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Instant Checkout Links</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-green-600 bg-green-100 rounded-lg p-3">
              <strong>Try these commands:</strong> &quot;hello&quot; • &quot;Tech Store, +65 1234, Electronics&quot; • &quot;iPhone 15, 1200, Latest phone&quot; • &quot;show products&quot;
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 bg-green-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to experience the future?</h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Start building your business using natural language. No complex forms, just chat!
          </p>
          <Link href="/merchant/onboard">
            <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
              Start Chatting Now
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer with Special Copy */}
      <footer className="bg-gray-900 text-white py-16 mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <span className="text-xl font-bold">WhatsGrapp</span>
            </div>
            
            {/* Special Copy Section */}
            <div className="bg-gray-800 rounded-xl p-8 mb-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-green-400 mb-4">
                🚀 Your Go-To Solution for End-to-End Payment Solutions Using Natural Language
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                WhatsGrapp revolutionizes e-commerce by enabling businesses to set up complete payment workflows 
                through simple conversations. From merchant registration to product management and checkout generation - 
                everything happens through natural language interactions with our AI-powered WhatsApp-style interface.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-green-400 font-semibold mb-2">🗣️ Natural Language Setup</div>
                  <div className="text-gray-300">Just chat to register your business and add products</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-blue-400 font-semibold mb-2">⚡ Instant Implementation</div>
                  <div className="text-gray-300">Checkout pages and payment links generated automatically</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-purple-400 font-semibold mb-2">🤖 AI-Powered Intelligence</div>
                  <div className="text-gray-300">Gemini AI understands your business needs and acts accordingly</div>
                </div>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm">
              &copy; 2025 WhatsGrapp. The future of conversational commerce is here.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
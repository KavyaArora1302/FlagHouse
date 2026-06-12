import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';

/**
 * Build context information for the chatbot
 * Includes product catalog, FAQs, and user-specific info
 */
export async function buildChatbotContext(user = null) {
  let context = '';

  // 1. Product Catalog Information
  try {
    const products = await Product.find().select('name category price originalPrice description featured').lean();
    
    if (products && products.length > 0) {
      context += '=== PRODUCT CATALOG ===\n\n';
      
      // Group by category
      const categories = ['Sports', 'Gaming', 'Music', 'Travel'];
      
      categories.forEach((category) => {
        const categoryProducts = products.filter((p) => p.category === category);
        if (categoryProducts.length > 0) {
          context += `${category} Flags:\n`;
          categoryProducts.forEach((product) => {
            const price = product.originalPrice 
              ? `₹${product.price} (was ₹${product.originalPrice})`
              : `₹${product.price}`;
            const featuredTag = product.featured ? ' [FEATURED]' : '';
            context += `  - ${product.name}: ${price}${featuredTag}\n`;
            context += `    ${product.description}\n`;
          });
          context += '\n';
        }
      });

      // Featured products
      const featured = products.filter((p) => p.featured);
      if (featured.length > 0) {
        context += 'Currently Featured Products:\n';
        featured.forEach((p) => {
          context += `  - ${p.name} (${p.category}): ₹${p.price}\n`;
        });
        context += '\n';
      }
    }
  } catch (error) {
    console.error('Error fetching products for context:', error);
  }

  // 2. User-specific information
  if (user) {
    context += `=== CUSTOMER INFORMATION ===\n`;
    context += `Customer Name: ${user.name}\n`;
    context += `Customer Email: ${user.email}\n`;
    
    // Get user's order history count
    try {
      const orderCount = await Order.countDocuments({ user: user._id });
      if (orderCount > 0) {
        context += `Previous Orders: ${orderCount}\n`;
        context += `(Customer can view order details in their "My Orders" page)\n`;
      } else {
        context += `Previous Orders: None (New customer!)\n`;
      }
    } catch (error) {
      console.error('Error fetching order count:', error);
    }
    
    context += '\n';
  }

  // 3. Store Policies & FAQs
  context += `=== STORE POLICIES & INFO ===\n\n`;
  
  context += `Categories Available:\n`;
  context += `  - Sports (Football, Cricket, Basketball, etc.)\n`;
  context += `  - Gaming (Popular video game flags)\n`;
  context += `  - Music (Band and music-themed flags)\n`;
  context += `  - Travel (Country and destination flags)\n\n`;

  context += `Payment Methods:\n`;
  context += `  - UPI\n`;
  context += `  - Credit/Debit Cards\n`;
  context += `  - Net Banking\n`;
  context += `  - Cash on Delivery (COD) - ₹40 extra charge\n\n`;

  context += `Shipping Information:\n`;
  context += `  - Free shipping on all orders\n`;
  context += `  - Delivery within 5-7 business days\n`;
  context += `  - Ships across India\n\n`;

  context += `Return Policy:\n`;
  context += `  - 7-day return policy on all products\n`;
  context += `  - Products must be unused and in original packaging\n`;
  context += `  - Contact support for return requests\n\n`;

  context += `Flag Specifications:\n`;
  context += `  - Size: Standard wall flag size (varies by product)\n`;
  context += `  - Material: High-quality fabric\n`;
  context += `  - Includes mounting accessories\n`;
  context += `  - Vibrant, fade-resistant colors\n\n`;

  context += `Contact Information:\n`;
  context += `  - Website: https://flag-house.vercel.app\n`;
  context += `  - Email: Use the contact form on the website\n`;
  context += `  - Support: Available via contact page\n\n`;

  context += `Account Features:\n`;
  context += `  - Create account for faster checkout\n`;
  context += `  - Save multiple addresses\n`;
  context += `  - Track order history\n`;
  context += `  - View past purchases\n\n`;

  return context;
}

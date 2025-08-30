import emailjs from '@emailjs/browser';

// EmailJS configuration
// You'll need to get these from https://www.emailjs.com/
const EMAIL_SERVICE_ID = 'your_service_id';
const EMAIL_TEMPLATE_ID = 'your_template_id';
const EMAIL_PUBLIC_KEY = 'your_public_key';

export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  pointsEarned?: number;
  pointsUsed?: number;
}

export const sendOrderConfirmationEmail = async (orderData: OrderEmailData): Promise<void> => {
  try {
    // Initialize EmailJS (you only need to do this once)
    emailjs.init(EMAIL_PUBLIC_KEY);

    // Prepare email template parameters
    const templateParams = {
      to_email: orderData.customerEmail,
      customer_name: orderData.customerName,
      order_id: orderData.orderId,
      order_items: orderData.items.map(item => 
        `${item.name} x${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}`
      ).join('\n'),
      total_amount: `₹${orderData.total.toFixed(2)}`,
      points_earned: orderData.pointsEarned || 0,
      points_used: orderData.pointsUsed || 0,
      order_date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    // Send email
    const response = await emailjs.send(
      EMAIL_SERVICE_ID,
      EMAIL_TEMPLATE_ID,
      templateParams
    );

    console.log('Order confirmation email sent successfully:', response);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    // Don't throw error to prevent order creation from failing
    // Just log it for debugging
  }
};

// For demo purposes, let's create a mock email service that just logs
export const sendOrderConfirmationEmailMock = async (orderData: OrderEmailData): Promise<void> => {
  // Call the server-side email service
  try {
    const response = await fetch('/api/send-order-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderNumber: orderData.orderId,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        items: orderData.items,
        total: orderData.total,
        pointsEarned: orderData.pointsEarned,
        pointsUsed: orderData.pointsUsed,
      }),
    });

    const result = await response.json();
    if (result.success) {
      console.log('✅ Order confirmation email sent successfully!');
    } else {
      console.log('📧 EMAIL SERVICE NOT CONFIGURED - Order details logged to console');
      // Fallback to console logging
      console.log('📧 ORDER CONFIRMATION EMAIL');
      console.log('==========================');
      console.log(`To: ${orderData.customerEmail}`);
      console.log(`Subject: Order Confirmation - ${orderData.orderId}`);
      console.log('');
      console.log(`Dear ${orderData.customerName},`);
      console.log('');
      console.log(`Thank you for your order! Your order ${orderData.orderId} has been confirmed.`);
      console.log('');
      console.log('ORDER DETAILS:');
      console.log('--------------');
      orderData.items.forEach(item => {
        console.log(`${item.name} x${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}`);
      });
      console.log('');
      console.log(`Total: ₹${orderData.total.toFixed(2)}`);
      if (orderData.pointsUsed) {
        console.log(`Points Used: ${orderData.pointsUsed}`);
      }
      if (orderData.pointsEarned) {
        console.log(`Points Earned: ${orderData.pointsEarned}`);
      }
      console.log('');
      console.log('Your order will be prepared shortly. Thank you for choosing CS-Truck!');
      console.log('');
      console.log('Best regards,');
      console.log('The CS-Truck Team');
      console.log('==========================');
    }
  } catch (error) {
    console.error('Failed to send email via server:', error);
    // Fallback to console logging if server call fails
    console.log('📧 ORDER CONFIRMATION EMAIL (SERVER ERROR - FALLBACK)');
    console.log('==========================');
    console.log(`To: ${orderData.customerEmail}`);
    console.log(`Order: ${orderData.orderId}`);
    console.log(`Total: ₹${orderData.total.toFixed(2)}`);
    console.log('==========================');
  }
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000));
};

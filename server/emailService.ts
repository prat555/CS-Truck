import nodemailer from 'nodemailer';

export interface OrderEmailData {
  orderNumber: string;
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

// Email configuration from environment variables
const EMAIL_CONFIG = {
  service: process.env.EMAIL_SERVICE || 'gmail', // gmail, outlook, etc.
  user: process.env.EMAIL_USER, // your email
  password: process.env.EMAIL_PASSWORD, // app password
  from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
};

let transporter: nodemailer.Transporter | null = null;

const initializeEmailService = () => {
  if (!EMAIL_CONFIG.user || !EMAIL_CONFIG.password) {
    console.warn('Email service not configured. Set EMAIL_USER and EMAIL_PASSWORD environment variables.');
    return null;
  }

  try {
    transporter = nodemailer.createTransporter({
      service: EMAIL_CONFIG.service,
      auth: {
        user: EMAIL_CONFIG.user,
        pass: EMAIL_CONFIG.password,
      },
    });

    console.log('Email service initialized successfully');
    return transporter;
  } catch (error) {
    console.error('Failed to initialize email service:', error);
    return null;
  }
};

const generateOrderEmailHTML = (orderData: OrderEmailData): string => {
  const itemsHTML = orderData.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - CS-Truck</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; border: 1px solid #e9ecef;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #28a745; margin: 0; font-size: 28px;">🚚 CS-Truck</h1>
                <p style="color: #6c757d; margin: 5px 0 0 0; font-size: 16px;">Delicious Food on Wheels</p>
            </div>
            
            <div style="background-color: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #28a745; margin-top: 0;">Order Confirmation</h2>
                <p>Dear <strong>${orderData.customerName}</strong>,</p>
                <p>Thank you for your order! Your order has been confirmed and is being prepared.</p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0; color: #495057;">Order Details</h3>
                    <p style="margin: 0; font-size: 18px;"><strong>Order Number: ${orderData.orderNumber}</strong></p>
                    <p style="margin: 5px 0 0 0; color: #6c757d;">Order Date: ${new Date().toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                </div>
            </div>
            
            <div style="background-color: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin-top: 0; color: #495057;">Items Ordered</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #f8f9fa;">
                            <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #dee2e6;">Item</th>
                            <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #dee2e6;">Qty</th>
                            <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #dee2e6;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>
                
                <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #28a745;">
                    ${orderData.pointsUsed ? `<p style="margin: 5px 0; color: #dc3545;"><strong>Points Used: ${orderData.pointsUsed} (-₹${orderData.pointsUsed})</strong></p>` : ''}
                    <p style="margin: 5px 0; font-size: 18px;"><strong>Total Amount: ₹${orderData.total.toFixed(2)}</strong></p>
                    ${orderData.pointsEarned ? `<p style="margin: 5px 0; color: #28a745;"><strong>Points Earned: ${orderData.pointsEarned}</strong></p>` : ''}
                </div>
            </div>
            
            <div style="background-color: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin-top: 0; color: #495057;">What's Next?</h3>
                <ul style="padding-left: 20px;">
                    <li>Your order is being prepared fresh</li>
                    <li>You'll receive updates on your order status</li>
                    <li>Estimated preparation time: 15-20 minutes</li>
                    <li>You can track your order using order number: <strong>${orderData.orderNumber}</strong></li>
                </ul>
            </div>
            
            <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e9ecef;">
                <p style="margin: 0; color: #6c757d;">Thank you for choosing CS-Truck!</p>
                <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 14px;">
                    If you have any questions, please contact us at <a href="mailto:${EMAIL_CONFIG.from}" style="color: #28a745;">${EMAIL_CONFIG.from}</a>
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};

export const sendOrderConfirmationEmail = async (orderData: OrderEmailData): Promise<boolean> => {
  // Initialize transporter if not already done
  if (!transporter) {
    transporter = initializeEmailService();
  }

  // If no transporter available, fall back to console logging
  if (!transporter) {
    console.log('📧 ORDER CONFIRMATION EMAIL (Email service not configured)');
    console.log('==========================');
    console.log(`To: ${orderData.customerEmail}`);
    console.log(`Subject: Order Confirmation - ${orderData.orderNumber}`);
    console.log(`Order Number: ${orderData.orderNumber}`);
    console.log(`Customer: ${orderData.customerName}`);
    console.log(`Total: ₹${orderData.total.toFixed(2)}`);
    console.log('Items:');
    orderData.items.forEach(item => {
      console.log(`  - ${item.name} x${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}`);
    });
    console.log('==========================');
    return false;
  }

  try {
    const mailOptions = {
      from: EMAIL_CONFIG.from,
      to: orderData.customerEmail,
      subject: `Order Confirmation - ${orderData.orderNumber} | CS-Truck`,
      html: generateOrderEmailHTML(orderData),
      text: `
Order Confirmation - ${orderData.orderNumber}

Dear ${orderData.customerName},

Thank you for your order! Your order ${orderData.orderNumber} has been confirmed.

Order Details:
${orderData.items.map(item => `${item.name} x${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}`).join('\n')}

Total: ₹${orderData.total.toFixed(2)}
${orderData.pointsUsed ? `Points Used: ${orderData.pointsUsed}` : ''}
${orderData.pointsEarned ? `Points Earned: ${orderData.pointsEarned}` : ''}

Your order will be prepared shortly. Thank you for choosing CS-Truck!

Best regards,
The CS-Truck Team
      `.trim()
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    // Still return false but don't throw to prevent order creation from failing
    return false;
  }
};

// Mock function for development/testing
export const sendOrderConfirmationEmailMock = async (orderData: OrderEmailData): Promise<boolean> => {
  console.log('📧 ORDER CONFIRMATION EMAIL (MOCK)');
  console.log('==========================');
  console.log(`To: ${orderData.customerEmail}`);
  console.log(`Subject: Order Confirmation - ${orderData.orderNumber}`);
  console.log('');
  console.log(`Dear ${orderData.customerName},`);
  console.log('');
  console.log(`Thank you for your order! Your order ${orderData.orderNumber} has been confirmed.`);
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
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
};

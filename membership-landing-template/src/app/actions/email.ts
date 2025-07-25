'use server';

import { resend, FROM_EMAIL, REPLY_TO_EMAIL } from '@/lib/resend';
import { OrderConfirmationEmail, OrderConfirmationEmailText } from '@/lib/email-templates/order-confirmation';

interface SendEmailOptions {
  orderId: string;
  email: string;
  name: string;
  amount: number;
  retryCount?: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export async function sendOrderConfirmationEmail({
  orderId,
  email,
  name,
  amount,
  retryCount = 0
}: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  try {

    // Send email using Resend with better deliverability settings
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      replyTo: REPLY_TO_EMAIL,
      subject: `Got your payment! Welcome to Vibe31 🎉`,
      react: OrderConfirmationEmail({
        customerName: name,
        orderAmount: amount,
        orderId: orderId
      }),
      text: OrderConfirmationEmailText({
        customerName: name,
        orderAmount: amount,
        orderId: orderId
      }),
      headers: {
        'X-Entity-Ref-ID': orderId,
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'List-Unsubscribe': `<mailto:support@vibe31.com?subject=Unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        'Precedence': 'bulk',
        'X-Mailer': 'Vibe31 Notification System',
      },
      tags: [
        {
          name: 'category',
          value: 'order_confirmation'
        },
        {
          name: 'order_id',
          value: orderId
        }
      ]
    });

    if (error) {
      console.error('Error sending email:', error);
      
      // Retry logic
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying email send (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        
        return sendOrderConfirmationEmail({
          orderId,
          email,
          name,
          amount,
          retryCount: retryCount + 1
        });
      }

      return { success: false, error: error.message };
    }

    console.log('Email sent successfully:', data);
    return { success: true };

  } catch (error) {
    console.error('Unexpected error sending email:', error);
    
    // Retry logic for unexpected errors
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying email send after error (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
      
      return sendOrderConfirmationEmail({
        orderId,
        email,
        name,
        amount,
        retryCount: retryCount + 1
      });
    }

    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}


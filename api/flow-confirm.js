import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const token = req.body?.token;
  if (!token) {
    return res.status(400).send('Missing token');
  }

  try {
    const apiKey = process.env.FLOW_API_KEY;
    const secretKey = process.env.FLOW_SECRET_KEY;
    
    // Create string to sign
    const params = `apiKey=${apiKey}&token=${token}`;
    
    // Sign with HMAC-SHA256
    const signature = crypto.createHmac('sha256', secretKey)
                            .update(params)
                            .digest('hex');
    
    // Call Flow API
    const response = await fetch(`https://www.flow.cl/api/payment/getStatus?apiKey=${apiKey}&token=${token}&s=${signature}`);
    const data = await response.json();
    
    if (data.status === 2) {
      // Payment PAID
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      
      const prefix = data.commerceOrder.split('_')[0].toLowerCase();
      const plan = prefix === 'pro' || prefix === 'plus' ? prefix : null;
      
      if (plan) {
         // Attempt to find userId in commerceOrder or fallback to payer email
         const userId = data.commerceOrder.split('_')[1];
         
         if (userId && userId.length > 10) {
           await supabase.from('profiles').update({ plan }).eq('id', userId);
         } else {
           await supabase.from('profiles').update({ plan }).eq('email', data.payer);
         }
      }
    }
    
    return res.status(200).send('OK');
  } catch (error) {
    console.error('Flow confirmation error:', error);
    return res.status(500).send('Error');
  }
}

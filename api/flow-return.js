import crypto from 'crypto';

export default async function handler(req, res) {
  const token = req.query.token || req.body?.token;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://leyia-chile.vercel.app';
  if (!token) {
    return res.redirect(302, `${siteUrl}/?payment_status=pending`);
  }

  try {
    const apiKey = process.env.FLOW_API_KEY;
    const secretKey = process.env.FLOW_SECRET_KEY;
    
    const params = `apiKey=${apiKey}&token=${token}`;
    const signature = crypto.createHmac('sha256', secretKey)
                            .update(params)
                            .digest('hex');
    
    const flowEnv = process.env.FLOW_ENVIRONMENT || 'production';
    const flowBaseUrl = flowEnv === 'sandbox' ? 'https://sandbox.flow.cl/api' : 'https://www.flow.cl/api';
    const response = await fetch(`${flowBaseUrl}/payment/getStatus?apiKey=${apiKey}&token=${token}&s=${signature}`);
    const data = await response.json();
    
    if (data.status === 2) {
      return res.redirect(302, `${siteUrl}/?payment_status=success&token=${token}`);
    } else {
      return res.redirect(302, `${siteUrl}/?payment_status=pending&token=${token}`);
    }
  } catch (err) {
    console.error('Flow return error:', err);
    return res.redirect(302, `${siteUrl}/?payment_status=pending&token=${token}`);
  }
}

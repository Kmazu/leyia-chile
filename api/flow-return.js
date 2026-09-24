import crypto from 'crypto';

export default async function handler(req, res) {
  const token = req.query.token || req.body?.token;
  if (!token) {
    return res.redirect(302, `https://leyia-chile.vercel.app/?payment_status=pending`);
  }

  try {
    const apiKey = process.env.FLOW_API_KEY;
    const secretKey = process.env.FLOW_SECRET_KEY;
    
    const params = `apiKey=${apiKey}&token=${token}`;
    const signature = crypto.createHmac('sha256', secretKey)
                            .update(params)
                            .digest('hex');
    
    const response = await fetch(`https://www.flow.cl/api/payment/getStatus?apiKey=${apiKey}&token=${token}&s=${signature}`);
    const data = await response.json();
    
    if (data.status === 2) {
      return res.redirect(302, `https://leyia-chile.vercel.app/?payment_status=success&token=${token}`);
    } else {
      return res.redirect(302, `https://leyia-chile.vercel.app/?payment_status=pending&token=${token}`);
    }
  } catch (err) {
    console.error('Flow return error:', err);
    return res.redirect(302, `https://leyia-chile.vercel.app/?payment_status=pending&token=${token}`);
  }
}

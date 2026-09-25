import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Método no permitido' });
  }

  // Validación de Autenticación JWT
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'No autorizado. Se requiere token JWT.' });
  }

  const token = authHeader.split(' ')[1];
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ status: 'error', message: 'Configuración de Supabase faltante en servidor.' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ status: 'error', message: 'Token inválido o expirado.' });
  }

  try {
    const { plan, userEmail, returnUrlOrigin } = req.body || {};

    if (plan !== 'pro' && plan !== 'plus') {
      return res.status(400).json({ status: 'error', message: 'Plan inválido' });
    }


    const amountMap = {
      pro: 5990,
      plus: 9990
    };

    const amount = amountMap[plan] || 5990;
    const planName = plan === 'plus' ? 'Plan Legal Plus LeyIA Chile' : 'Plan Legal Pro LeyIA Chile';

    const apiKey = process.env.FLOW_API_KEY;
    const secretKey = process.env.FLOW_SECRET_KEY;
    const flowEnv = process.env.FLOW_ENVIRONMENT || 'production';

    if (!apiKey || !secretKey) {
      return res.status(503).json({
        status: 'error',
        message: 'El servicio de pagos no está configurado. Contacta al administrador.'
      });
    }

    const baseUrl = returnUrlOrigin || 'https://leyia-chile.vercel.app';
    const commerceOrder = `${plan}_${user.id}_${Date.now()}`;
    const emailToUse = (userEmail && userEmail.includes('@') && !userEmail.endsWith('@leyia.cl')) ? userEmail : 'cliente@gmail.com';

    const params = {
      apiKey: apiKey,
      commerceOrder: commerceOrder,
      subject: `Suscripción ${planName}`,
      currency: 'CLP',
      amount: amount,
      email: emailToUse,
      urlConfirmation: `${baseUrl}/api/flow-confirm`,
      urlReturn: `${baseUrl}/api/flow-return`
    };

    // Ordenar llaves alfabéticamente y construir string para firma HMAC-SHA256
    const keys = Object.keys(params).sort();
    let toSign = '';
    keys.forEach(k => {
      toSign += k + params[k];
    });

    const signature = crypto.createHmac('sha256', secretKey).update(toSign).digest('hex');
    params.s = signature;

    const formData = new URLSearchParams();
    for (const key in params) {
      formData.append(key, params[key]);
    }

    const flowUrl = flowEnv === 'sandbox'
      ? 'https://sandbox.flow.cl/api/payment/create'
      : 'https://www.flow.cl/api/payment/create';

    const response = await fetch(flowUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });

    const data = await response.json();

    if (response.ok && data.url && data.token) {
      return res.status(200).json({
        status: 'success',
        url: `${data.url}?token=${data.token}`,
        flowOrder: data.flowOrder,
        token: data.token,
        commerceOrder,
        amount
      });
    } else {
      console.error('Error de Flow API:', data);
      return res.status(400).json({
        status: 'error',
        message: data.message || 'No se pudo crear la orden de pago en Flow.'
      });
    }
  } catch (error) {
    console.error('Error en servicio de pago Flow:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error de servidor procesando el pago con Flow',
      details: error.message
    });
  }
}

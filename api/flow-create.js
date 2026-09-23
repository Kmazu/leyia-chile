const crypto = require('crypto');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Método no permitido' });
  }

  try {
    const { plan, userEmail, returnUrlOrigin } = req.body || {};

    const amountMap = {
      pro: 5990,
      plus: 9990
    };

    const amount = amountMap[plan] || 5990;
    const planName = plan === 'plus' ? 'Plan Legal Plus LeyIA Chile' : 'Plan Legal Pro LeyIA Chile';

    const apiKey = process.env.FLOW_API_KEY || '2BF1FFE4-1745-42F5-8A1A-28LCE1284096';
    const secretKey = process.env.FLOW_SECRET_KEY || '580d4338632ed42c84e4eecdcc1ab226a1ea2914';
    const flowEnv = process.env.FLOW_ENVIRONMENT || 'production';

    const baseUrl = returnUrlOrigin || 'https://leyia-chile.vercel.app';
    const commerceOrder = `LEYIA-${Date.now()}`;
    const emailToUse = userEmail && userEmail.includes('@') ? userEmail : 'cliente@leyia.cl';

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

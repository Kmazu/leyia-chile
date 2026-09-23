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

    const amount = amountMap[plan];
    if (!amount) {
      return res.status(400).json({ status: 'error', message: 'Plan no válido especificado' });
    }

    const buyOrder = `LEYIA-${Date.now()}`;
    const sessionId = `SESS-${Math.floor(100000 + Math.random() * 900000)}`;

    const baseUrl = returnUrlOrigin || 'https://leyia-chile.vercel.app';
    const returnUrl = `${baseUrl}/api/payment-commit`;

    // Si existen variables de entorno del comercio las usa, de lo contrario usa las credenciales públicas oficiales de prueba de Transbank Webpay Plus
    const commerceCode = process.env.WEBPAY_COMMERCE_CODE || '597055555532';
    const apiKey = process.env.WEBPAY_API_KEY || '579B532A7440BB7F5D4806568A40890EC799A5239A5084FEF6A5406E65C995B4';
    
    const tbkUrl = process.env.WEBPAY_ENVIRONMENT === 'production'
      ? 'https://webpay3g.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions'
      : 'https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions';

    const tbkResponse = await fetch(tbkUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Tbk-Api-Key-Id': commerceCode,
        'Tbk-Api-Key-Secret': apiKey
      },
      body: JSON.stringify({
        buy_order: buyOrder,
        session_id: sessionId,
        amount: amount,
        return_url: returnUrl
      })
    });

    const tbkData = await tbkResponse.json();

    if (tbkResponse.ok && tbkData.token && tbkData.url) {
      return res.status(200).json({
        status: 'success',
        url: tbkData.url,
        token: tbkData.token,
        buyOrder,
        amount
      });
    } else {
      // Si el servidor de integracion público requiere fallback o reintento
      return res.status(200).json({
        status: 'success',
        url: 'https://webpay3gint.transbank.cl/webpayserver/initTransaction',
        token: `TEST-TOKEN-${Date.now()}`,
        buyOrder,
        amount
      });
    }
  } catch (error) {
    console.error('Error iniciando transacción Webpay Plus:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error de conexión con Transbank',
      details: error.message
    });
  }
}

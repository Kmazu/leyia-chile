import pkg from 'transbank-sdk';
const { WebpayPlus, Options, IntegrationApiKeys, IntegrationCommerceCodes, Environment } = pkg;

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

    const tx = new WebpayPlus.Transaction(
      new Options(
        IntegrationCommerceCodes.WEBPAY_PLUS,
        IntegrationApiKeys.WEBPAY_PLUS,
        Environment.Integration
      )
    );

    const createResponse = await tx.create(buyOrder, sessionId, amount, returnUrl);

    return res.status(200).json({
      status: 'success',
      url: createResponse.url,
      token: createResponse.token,
      buyOrder,
      amount
    });
  } catch (error) {
    console.error('Error iniciando transacción Webpay Plus:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error interno al conectar con Transbank Webpay',
      details: error.message || String(error)
    });
  }
}

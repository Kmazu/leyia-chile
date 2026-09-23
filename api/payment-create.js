import { WebpayPlus, Options, IntegrationApiKeys, IntegrationCommerceCodes, Environment } from 'transbank-sdk';

export default async function handler(req, res) {
  // Permitir solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Método no permitido' });
  }

  try {
    const { plan, userEmail, returnUrlOrigin } = req.body || {};

    // Mapeo de precios oficiales LeyIA Chile
    const amountMap = {
      pro: 5990,
      plus: 9990
    };

    const amount = amountMap[plan];
    if (!amount) {
      return res.status(400).json({ status: 'error', message: 'Plan no válido especificado' });
    }

    // Identificadores únicos de la transacción
    const buyOrder = `LEYIA-${Date.now()}`;
    const sessionId = `SESS-${Math.floor(100000 + Math.random() * 900000)}`;

    // URL de retorno a la cual Transbank enviará al usuario tras pagar
    const baseUrl = returnUrlOrigin || 'https://leyia-chile.vercel.app';
    const returnUrl = `${baseUrl}/api/payment-commit`;

    // Configuración Transbank (Producción vs Modo Integración/Pruebas)
    const commerceCode = process.env.WEBPAY_COMMERCE_CODE || IntegrationCommerceCodes.WEBPAY_PLUS;
    const apiKey = process.env.WEBPAY_API_KEY || IntegrationApiKeys.WEBPAY_PLUS;
    const environment = process.env.WEBPAY_ENVIRONMENT === 'production' 
      ? Environment.Production 
      : Environment.Integration;

    const tx = new WebpayPlus.Transaction(
      new Options(commerceCode, apiKey, environment)
    );

    // Crear la transacción en los servidores de Transbank
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
      details: error.message
    });
  }
}

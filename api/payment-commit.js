import { WebpayPlus, Options, IntegrationApiKeys, IntegrationCommerceCodes, Environment } from 'transbank-sdk';

export default async function handler(req, res) {
  // Transbank puede enviar el token por GET (token_ws) o por POST
  const token = req.query?.token_ws || req.body?.token_ws;
  const tbkAnulado = req.query?.TBK_TOKEN || req.body?.TBK_TOKEN;

  // Si el usuario canceló el flujo en la pantalla de Transbank
  if (tbkAnulado || !token) {
    return res.redirect('/?payment_status=cancelled');
  }

  try {
    const commerceCode = process.env.WEBPAY_COMMERCE_CODE || IntegrationCommerceCodes.WEBPAY_PLUS;
    const apiKey = process.env.WEBPAY_API_KEY || IntegrationApiKeys.WEBPAY_PLUS;
    const environment = process.env.WEBPAY_ENVIRONMENT === 'production' 
      ? Environment.Production 
      : Environment.Integration;

    const tx = new WebpayPlus.Transaction(
      new Options(commerceCode, apiKey, environment)
    );

    // Confirmación (commit) obligatoria ante Transbank dentro de los primeros minutos
    const commitResponse = await tx.commit(token);

    // Verificación de aprobación (response_code 0 representa APROBADO)
    if (commitResponse.status === 'AUTHORIZED' && commitResponse.response_code === 0) {
      const buyOrder = commitResponse.buy_order || '';
      const amount = commitResponse.amount || 0;
      
      // Determinar qué plan compró según el monto
      const plan = amount === 9990 ? 'plus' : 'pro';

      // Redireccionar al usuario a la app con parámetros de éxito
      return res.redirect(`/?payment_status=success&plan=${plan}&buy_order=${buyOrder}&amount=${amount}`);
    } else {
      // Pago rechazado por la entidad bancaria
      return res.redirect(`/?payment_status=rejected&code=${commitResponse.response_code}`);
    }
  } catch (error) {
    console.error('Error al confirmar transacción Webpay Plus:', error);
    return res.redirect('/?payment_status=error');
  }
}

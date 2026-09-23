export default async function handler(req, res) {
  const token = req.query?.token_ws || req.body?.token_ws;
  const tbkAnulado = req.query?.TBK_TOKEN || req.body?.TBK_TOKEN;

  if (tbkAnulado || !token) {
    return res.redirect('/?payment_status=cancelled');
  }

  try {
    const commerceCode = process.env.WEBPAY_COMMERCE_CODE || '597055555532';
    const apiKey = process.env.WEBPAY_API_KEY || '579B532A7440BB7F5D4806568A40890EC799A5239A5084FEF6A5406E65C995B4';
    const tbkUrl = process.env.WEBPAY_ENVIRONMENT === 'production'
      ? `https://webpay3g.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions/${token}`
      : `https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions/${token}`;

    const tbkResponse = await fetch(tbkUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Tbk-Api-Key-Id': commerceCode,
        'Tbk-Api-Key-Secret': apiKey
      }
    });

    const commitData = await tbkResponse.json();

    if (tbkResponse.ok && commitData.status === 'AUTHORIZED' && commitData.response_code === 0) {
      const buyOrder = commitData.buy_order || '';
      const amount = commitData.amount || 0;
      const plan = amount === 9990 ? 'plus' : 'pro';

      return res.redirect(`/?payment_status=success&plan=${plan}&buy_order=${buyOrder}&amount=${amount}`);
    } else {
      return res.redirect(`/?payment_status=rejected&code=${commitData.response_code || 99}`);
    }
  } catch (error) {
    console.error('Error al confirmar transacción Webpay Plus:', error);
    return res.redirect('/?payment_status=error');
  }
}

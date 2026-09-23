import { WebpayPlus } from 'transbank-sdk';

export default async function handler(req, res) {
  const token = req.query?.token_ws || req.body?.token_ws;
  const tbkAnulado = req.query?.TBK_TOKEN || req.body?.TBK_TOKEN;

  if (tbkAnulado || !token) {
    return res.redirect('/?payment_status=cancelled');
  }

  try {
    const tx = new WebpayPlus.Transaction();
    const commitResponse = await tx.commit(token);

    if (commitResponse.status === 'AUTHORIZED' && commitResponse.response_code === 0) {
      const buyOrder = commitResponse.buy_order || '';
      const amount = commitResponse.amount || 0;
      const plan = amount === 9990 ? 'plus' : 'pro';

      return res.redirect(`/?payment_status=success&plan=${plan}&buy_order=${buyOrder}&amount=${amount}`);
    } else {
      return res.redirect(`/?payment_status=rejected&code=${commitResponse.response_code}`);
    }
  } catch (error) {
    console.error('Error al confirmar transacción Webpay Plus:', error);
    return res.redirect('/?payment_status=error');
  }
}

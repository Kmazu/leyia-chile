export default async function handler(req, res) {
  const token = req.query.token || req.body?.token;
  const redirectUrl = `https://leyia-chile.vercel.app/?payment_status=success&token=${token || ''}`;
  return res.redirect(302, redirectUrl);
}

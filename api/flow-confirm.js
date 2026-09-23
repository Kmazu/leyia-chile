export default async function handler(req, res) {
  // Flow envía parámetros POST de confirmación estado de transacción
  return res.status(200).send('OK');
}

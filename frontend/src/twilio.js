export async function getToken() {
  const res = await fetch('/api/twilio_token');
  return await res.text();
}

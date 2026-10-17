export async function onRequestGet() {
  return new Response(
    JSON.stringify({
      message: 'Cloudflare Pages answer endpoint active',
      partnerName: 'Aparna',
      senderName: 'Adithya',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

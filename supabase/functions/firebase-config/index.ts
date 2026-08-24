// Serves the public Firebase web config.
// Firebase web apiKey is a public identifier (safe to expose in client bundles);
// access control is enforced by Firebase Auth authorized domains + Firestore rules.
// The key itself is stored as the GOOGLE_API_KEY secret so it never lives in the repo.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = Deno.env.get('GOOGLE_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'firebase config not available' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const config = {
    apiKey,
    authDomain: 'moneyex-1a29f.firebaseapp.com',
    projectId: 'moneyex-1a29f',
    storageBucket: 'moneyex-1a29f.firebasestorage.app',
    messagingSenderId: '624240350476',
    appId: '1:624240350476:web:038482ffaf76114049a529',
    measurementId: 'G-ZYLSN7HVFL',
  };

  return new Response(JSON.stringify(config), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
});

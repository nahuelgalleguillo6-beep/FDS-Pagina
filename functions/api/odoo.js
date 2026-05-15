const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost({ request, env }) {
  const ODOO_URL = env.ODOO_URL;
  const ODOO_DB  = env.ODOO_DB;
  const ODOO_UID = Number(env.ODOO_UID);
  const ODOO_KEY = env.ODOO_KEY;

  try {
    const body = await request.json();

    const odooRes = await fetch(`${ODOO_URL}/jsonrpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method:  'call',
        id:      1,
        params: {
          service: 'object',
          method:  'execute_kw',
          args: [
            ODOO_DB,
            ODOO_UID,
            ODOO_KEY,
            body.model,
            body.method,
            body.args   || [],
            body.kwargs || {},
          ],
        },
      }),
    });

    const data = await odooRes.json();

    return new Response(JSON.stringify(data), {
      status:  200,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }
}

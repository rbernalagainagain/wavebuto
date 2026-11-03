import { chooseLanguage } from './worker/choose-language';

const REMITENTE = { email: 'wavebuto@proton.me', name: 'Formulario web' };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // "/" has no language of its own (specs/tech-stack.md): it redirects to the
    // visitor's. 302, never 301, and Vary, because the answer depends on the
    // visitor. The browser keeps the link's #anchor across the redirect.
    if (url.pathname === '/') {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
      }
      const language = chooseLanguage(request.headers.get('Accept-Language'));
      return new Response(null, {
        status: 302,
        headers: { Location: `/${language}/${url.search}`, Vary: 'Accept-Language' },
      });
    }

    if (url.pathname !== '/api/contact') {
      return new Response('Not found', { status: 404 });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const form = await request.formData();
      const nombre = String(form.get('nombre') || '').trim();
      const email = String(form.get('email') || '').trim();
      const mensaje = String(form.get('mensaje') || '').trim();

      // Honeypot: si viene relleno es un bot. Devolvemos OK para no darle pistas.
      if (form.get('_gotcha')) return Response.json({ ok: true });

      if (!nombre || !email || !mensaje) {
        return Response.json({ error: 'Faltan campos' }, { status: 400 });
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return Response.json({ error: 'Email inválido' }, { status: 400 });
      }
      if (mensaje.length > 5000) {
        return Response.json({ error: 'Mensaje demasiado largo' }, { status: 400 });
      }

      await env.EMAIL.send({
        from: REMITENTE,
        replyTo: { email, name: nombre },
        subject: `Nuevo mensaje de ${nombre}`,
        text: `Nombre: ${nombre}\nEmail: ${email}\n\n${mensaje}`,
      });

      return Response.json({ ok: true });
    } catch (err) {
      console.error(err);
      return Response.json({ error: 'No se pudo enviar' }, { status: 500 });
    }
  },
};

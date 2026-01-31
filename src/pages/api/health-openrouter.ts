import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * Test połączenia z OpenRouter API (GET).
 * Wymaga OPENROUTER_API_KEY w .env.
 */
export const GET: APIRoute = async () => {
  const apiKey = import.meta.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'OPENROUTER_API_KEY nie jest ustawiony w .env',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'arcee-ai/trinity-mini:free',
        messages: [{ role: 'user', content: 'Say OK' }],
        max_tokens: 5,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message =
        data?.error?.message || data?.message || res.statusText || 'Błąd OpenRouter';
      return new Response(
        JSON.stringify({
          ok: false,
          error: message,
          status: res.status,
          details: data?.error || data,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        message: 'Połączenie z OpenRouter działa.',
        model: data?.model,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Nieznany błąd';
    return new Response(
      JSON.stringify({
        ok: false,
        error: message,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

import type { APIRoute } from 'astro';
export const GET: APIRoute = () => new Response(
  import.meta.env.PUBLIC_INDEXABLE === 'true'
    ? 'User-agent: *\nAllow: /\n'
    : 'User-agent: *\nDisallow: /\n',
  { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
);

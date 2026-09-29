interface Env {}

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const targetUrl = new URL(url.pathname + url.search, 'https://saccade-jbr9.onrender.com');

  // Clone headers and preserve host/authorization
  const headers = new Headers(context.request.headers);
  headers.set('Host', 'saccade-jbr9.onrender.com');

  const init: RequestInit = {
    method: context.request.method,
    headers,
    redirect: 'follow',
  };

  // Only attach body for non-GET/HEAD methods
  if (context.request.method !== 'GET' && context.request.method !== 'HEAD') {
    init.body = context.request.body;
    // @ts-expect-error duplex is required in modern fetch for streams
    init.duplex = 'half';
  }

  const response = await fetch(targetUrl.toString(), init);
  return response;
};

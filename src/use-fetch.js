import deepEqual from 'deep-equal';
import fetch from 'isomorphic-fetch';

// Create a set of caches for this hook.
const caches = [];

function useFetch(input, init, options = 0) {
  if (typeof options === 'number') {
    return useFetch(input, init, { lifespan: options });
  }

  const { metadata = false, lifespan = 0 } = options;

  // Check each cache by this useFetch hook.
  for (const cache of caches) {
    // If this cache matches the request,
    if (deepEqual(input, cache.input) && deepEqual(init, cache.init)) {
      // If an error occurred, throw it so that componentDidCatch can handle
      //   it.
      if (Object.prototype.hasOwnProperty.call(cache, 'error')) {
        throw cache.error;
      }

      // If a response was successful, return it.
      if (Object.prototype.hasOwnProperty.call(cache, 'response')) {
        if (metadata) {
          return {
            bodyUsed: cache.bodyUsed,
            contentType: cache.contentType,
            headers: cache.headers,
            ok: cache.ok,
            redirected: cache.redirected,
            response: cache.response,
            status: cache.status,
            statusText: cache.statusText,
            url: cache.url
          };
        }
        return cache.response;
      }

      // If we are still waiting, throw the Promise so that Suspense can
      //   fallback.
      throw cache.fetch;
    }
  }

  // If no request in the cache matched this one, create a new cache entry.
  const cache = {
    // Make the fetch request.
    fetch: fetch(input, init)
      // Parse the response.
      .then(response => {
        cache.contentType = response.headers.get('Content-Type');
        if (metadata) {
          cache.bodyUsed = response.bodyUsed;
          cache.headers = response.headers;
          cache.ok = response.ok;
          cache.redirected = response.redirected;
          cache.status = response.status;
          cache.statusText = response.statusText;
        }
        if (cache.contentType && cache.contentType.indexOf('application/json') !== -1) {
          return response.json();
        }
        return response.text();
      })

      // Cache the response.
      .then(response => {
        cache.response = response;
      })

      // Handle an error.
      .catch(e => {
        cache.error = e;
      })

      // Invalidate the cache.
      .then(() => {
        if (lifespan > 0) {
          setTimeout(() => {
            const index = caches.indexOf(cache);
            if (index !== -1) {
              caches.splice(index, 1);
            }
          }, lifespan);
        }
      }),
    init,
    input
  };
  caches.push(cache);
  throw cache.fetch;
}

export default useFetch;

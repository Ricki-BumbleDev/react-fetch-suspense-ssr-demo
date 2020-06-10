import fetch from 'isomorphic-fetch';

const requests: Record<string, { promise: Promise<Response>; data?: any }> = {};

const useFetch = (url: string, options?: RequestInit) => {
  const requestKey = JSON.stringify({ url, ...options });
  if (requestKey in requests) {
    const request = requests[requestKey];
    if (request.data) {
      return request.data;
    } else {
      throw request.promise;
    }
  }
  const promise = fetch(url, options)
    .then(response => response.json())
    .then(data => (requests[requestKey].data = data));
  requests[requestKey] = { promise };
  throw promise;
};

export default useFetch;

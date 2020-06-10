import React, { Suspense } from 'react';
import useFetch from './use-fetch';

const FetchingComponent = () => {
  const response = useFetch('https://jsonplaceholder.typicode.com/todos');
  return <p>The server responded with: {JSON.stringify(response)}</p>;
};

const Home = () => {
  return (
    <main>
      <h1>Welcome</h1>
      <Suspense fallback="Loading...">
        <FetchingComponent />
      </Suspense>
    </main>
  );
};

export default Home;

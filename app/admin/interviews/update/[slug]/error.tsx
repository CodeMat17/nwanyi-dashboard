"use client";

export default function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className='p-4 text-red-500'>
      <h2>Error loading interview</h2>
      <p>{error.message}</p>
    </div>
  );
}

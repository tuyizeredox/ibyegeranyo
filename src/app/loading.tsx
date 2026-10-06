export default function Loading() {
  return (
    <div className="container py-16 md:py-24" aria-busy="true">
      <div className="skeleton h-4 w-32" />
      <div className="skeleton mt-5 h-12 w-full max-w-lg" />
      <div className="skeleton mt-4 h-5 w-full max-w-md" />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="flex flex-col gap-4">
            <div className="skeleton aspect-video" />
            <div className="skeleton h-5 w-3/4" />
            <div className="skeleton h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

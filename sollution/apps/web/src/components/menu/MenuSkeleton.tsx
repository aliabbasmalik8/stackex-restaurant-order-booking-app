export function MenuSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-[250px] animate-pulse rounded-[20px] bg-card shadow-card"
        />
      ))}
    </div>
  )
}

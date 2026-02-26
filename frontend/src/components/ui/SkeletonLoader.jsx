export default function SkeletonLoader({ rows = 5, cols = 4 }) {
    return (
        <div className="space-y-3 animate-pulse">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4">
                    {Array.from({ length: cols }).map((_, j) => (
                        <div
                            key={j}
                            className="h-10 rounded-lg bg-gray-200 dark:bg-gray-800 flex-1"
                            style={{ opacity: 1 - i * 0.1 }}
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}

export function CardSkeleton() {
    return (
        <div className="card p-6 animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
        </div>
    )
}

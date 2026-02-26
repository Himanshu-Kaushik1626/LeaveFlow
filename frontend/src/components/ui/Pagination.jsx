import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, pages, onPageChange }) {
    if (pages <= 1) return null

    const getPages = () => {
        const arr = []
        for (let i = 1; i <= pages; i++) {
            if (i === 1 || i === pages || (i >= page - 1 && i <= page + 1)) arr.push(i)
            else if (arr[arr.length - 1] !== '...') arr.push('...')
        }
        return arr
    }

    return (
        <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Page <span className="font-medium text-gray-900 dark:text-gray-100">{page}</span> of{' '}
                <span className="font-medium text-gray-900 dark:text-gray-100">{pages}</span>
            </p>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="btn-icon btn-secondary disabled:opacity-40"
                >
                    <ChevronLeft size={16} />
                </button>
                {getPages().map((p, i) =>
                    p === '...' ? (
                        <span key={`e-${i}`} className="px-2 text-gray-400">…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${p === page
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            {p}
                        </button>
                    )
                )}
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === pages}
                    className="btn-icon btn-secondary disabled:opacity-40"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    )
}

import { Search, X } from 'lucide-react'

export default function SearchFilter({ value, onChange, placeholder = 'Search...', children }) {
    return (
        <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="input pl-9 pr-9"
                />
                {value && (
                    <button
                        onClick={() => onChange('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
            {children}
        </div>
    )
}

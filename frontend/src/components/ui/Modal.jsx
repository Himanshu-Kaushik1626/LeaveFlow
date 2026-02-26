import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    const overlayRef = useRef()

    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose() }
        if (isOpen) document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [isOpen, onClose])

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    if (!isOpen) return null

    const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
        >
            <div className={`card w-full ${sizes[size]} shadow-2xl animate-bounce-in max-h-[90vh] flex flex-col`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
                    <button onClick={onClose} className="btn-icon btn-secondary rounded-lg">
                        <X size={18} />
                    </button>
                </div>
                {/* Body */}
                <div className="p-6 overflow-y-auto">{children}</div>
            </div>
        </div>
    )
}

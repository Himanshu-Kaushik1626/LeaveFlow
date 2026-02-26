import { useState } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 animate-fade-in">
                    {children}
                </main>
            </div>
        </div>
    )
}

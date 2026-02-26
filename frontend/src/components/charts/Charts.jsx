import {
    Chart as ChartJS, ArcElement, Tooltip, Legend,
    CategoryScale, LinearScale, BarElement, Title
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

const BAR_OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, title: { display: false } },
    scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(156,163,175,0.1)' } },
        x: { grid: { display: false } },
    },
}

export function BarChart({ labels, data, label = 'Leaves' }) {
    const chartData = {
        labels,
        datasets: [{
            label,
            data,
            backgroundColor: 'rgba(81,104,244,0.8)',
            borderColor: 'rgba(81,104,244,1)',
            borderWidth: 0,
            borderRadius: 6,
            borderSkipped: false,
        }],
    }
    return (
        <div className="w-full h-56">
            <Bar data={chartData} options={BAR_OPTIONS} />
        </div>
    )
}

const DOUGHNUT_OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: { legend: { position: 'bottom', labels: { padding: 16, boxWidth: 12, font: { size: 12 } } } },
}

export function PieChart({ labels, data }) {
    const chartData = {
        labels,
        datasets: [{
            data,
            backgroundColor: ['#5168f4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
            borderWidth: 0,
            hoverOffset: 6,
        }],
    }
    return (
        <div className="w-full h-56">
            <Doughnut data={chartData} options={DOUGHNUT_OPTIONS} />
        </div>
    )
}

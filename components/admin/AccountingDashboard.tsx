import React, { useState, useEffect } from 'react';
import { FinancialDashboardData, ChartDataPoint, CategoryDataPoint } from '../../types';
import { getFinancialDashboardData } from '../../services/localDataService';
import Button from '../ui/Button';

// Helper to format currency
const formatCurrency = (value: number) => `${(value / 1_000_000).toFixed(2)} triệu`;

// --- Reusable Components ---
const StatCard: React.FC<{ title: string; value: number; unit?: string; icon: string; color: string }> = ({ title, value, icon, color, unit = 'triệu' }) => (
    <div className="bg-white p-4 rounded-lg shadow border flex justify-between items-center">
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">
                {`${(value / 1_000_000).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                <span className="text-sm font-medium text-gray-500 ml-1">{unit}</span>
            </p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
            <i className={`fas ${icon} text-xl text-white`}></i>
        </div>
    </div>
);

const RevenueExpenseChart: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => {
    const width = 600;
    const height = 300;
    const padding = 40;

    if (!data || data.length === 0) return <div className="text-center p-8 text-gray-500">Không có dữ liệu.</div>;

    const maxVal = Math.max(...data.flatMap(d => [d.revenue, d.expense, d.profit]));
    const maxValCeiling = Math.ceil(maxVal / 1_000_000) * 1_000_000 || 1_000_000;
    const barWidth = (width - padding * 2) / (data.length * 2);

    const getX = (index: number) => padding + index * (barWidth * 2) + barWidth / 2;
    const getY = (value: number) => height - padding - (value / maxValCeiling) * (height - padding * 2);
    const getBarHeight = (value: number) => (value / maxValCeiling) * (height - padding * 2);
    
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Y-Axis */}
        {Array.from({ length: 5 }).map((_, i) => {
            const val = (maxValCeiling / 4) * i;
            return (
                <g key={i}>
                    <line x1={padding} y1={getY(val)} x2={width - padding} y2={getY(val)} stroke="#e2e8f0" />
                    <text x={padding - 5} y={getY(val) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{`${val / 1_000_000}tr`}</text>
                </g>
            )
        })}
        {/* Bars and Line */}
        {data.map((d, i) => (
            <g key={i}>
                <rect x={getX(i) - barWidth} y={getY(d.revenue)} width={barWidth} height={getBarHeight(d.revenue)} fill="#3b82f6" />
                <rect x={getX(i)} y={getY(d.expense)} width={barWidth} height={getBarHeight(d.expense)} fill="#93c5fd" />
                <text x={getX(i) - barWidth/2} y={height - padding + 15} textAnchor="middle" fontSize="10" fill="#94a3b8">{d.label}</text>
            </g>
        ))}
        <path d={data.map((d, i) => `${i === 0 ? 'M' : 'L'}${getX(i) - barWidth/2},${getY(d.profit)}`).join(' ')} fill="none" stroke="#f97316" strokeWidth="2" />
      </svg>
    );
};

const ExpensePieChart: React.FC<{ data: CategoryDataPoint[] }> = ({ data }) => {
    if(!data || data.length === 0) return <div className="text-center p-8 text-gray-500">Không có dữ liệu chi phí.</div>;
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#eab308'];
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulative = 0;
    const gradients = data.map((item, index) => {
        const start = (cumulative / total) * 360;
        cumulative += item.value;
        const end = (cumulative / total) * 360;
        return `${colors[index % colors.length]} ${start}deg ${end}deg`;
    });

    return (
        <div className="flex flex-col items-center">
            <div className="w-40 h-40 rounded-full" style={{ background: `conic-gradient(${gradients.join(', ')})` }}></div>
            <div className="mt-4 w-full">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center text-xs mb-1">
                        <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: colors[index % colors.length] }}></div>
                        <span className="text-gray-600">{item.name}</span>
                        <span className="ml-auto font-semibold">{(item.value / 1_000_000).toFixed(1)}tr</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Main Dashboard Component ---
const AccountingDashboard: React.FC = () => {
    const [data, setData] = useState<FinancialDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState<'month' | 'year'>('month');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getFinancialDashboardData(period);
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Lỗi không xác định.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [period]);
    
    if (isLoading) return <div className="text-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div></div>;
    if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-md">Lỗi tải dữ liệu: {error}</div>;
    if (!data) return <div className="text-center p-8">Không có dữ liệu để hiển thị.</div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Tổng Tiền" value={data.financialStatus.totalCash} icon="fa-wallet" color="bg-blue-500" />
                <StatCard title="Doanh Thu" value={data.financialStatus.revenue} icon="fa-chart-line" color="bg-green-500" />
                <StatCard title="Chi Phí" value={data.financialStatus.expense} icon="fa-file-invoice-dollar" color="bg-red-500" />
                <StatCard title="Lợi Nhuận" value={data.financialStatus.profit} icon="fa-piggy-bank" color="bg-orange-500" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow border">
                     <h4 className="font-semibold text-gray-800 mb-2">Doanh thu, Chi phí, Lợi nhuận</h4>
                    <RevenueExpenseChart data={data.revenueExpenseChart} />
                </div>
                <div className="bg-white p-4 rounded-lg shadow border">
                    <h4 className="font-semibold text-gray-800 mb-2">Cơ cấu Chi phí</h4>
                    <ExpensePieChart data={data.expensePieChart} />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-white p-4 rounded-lg shadow border">
                     <h4 className="font-semibold text-gray-800 mb-2">Nợ phải thu</h4>
                     <p className="text-2xl font-bold">{formatCurrency(data.receivables.total)}</p>
                     <p className="text-sm text-red-600">Quá hạn: {formatCurrency(data.receivables.overdue)}</p>
                 </div>
                 <div className="bg-white p-4 rounded-lg shadow border">
                     <h4 className="font-semibold text-gray-800 mb-2">Nợ phải trả</h4>
                     <p className="text-2xl font-bold">{formatCurrency(data.payables.total)}</p>
                     <p className="text-sm text-red-600">Quá hạn: {formatCurrency(data.payables.overdue)}</p>
                 </div>
             </div>
        </div>
    );
};

export default AccountingDashboard;

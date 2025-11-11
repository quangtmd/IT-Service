import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Product } from '../../types';
import { getProducts } from '../../services/localDataService';
import Button from '../ui/Button';
import BackendConnectionError from '../shared/BackendConnectionError';
import * as Constants from '../../constants';

const formatCurrency = (value: number) => {
    if (isNaN(value)) return '0';
    return value.toLocaleString('vi-VN');
};

const StatCard: React.FC<{ title: string; value: string; icon: string; color: string; }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${color}`}>
            <i className={`fas ${icon} text-xl text-white`}></i>
        </div>
        <div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-sm text-gray-500">{title}</p>
        </div>
    </div>
);


const InventoryView: React.FC = () => {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedBrand, setSelectedBrand] = useState('all');
    const [stockStatus, setStockStatus] = useState('all');

    const [activeFilters, setActiveFilters] = useState({
        searchTerm: '',
        selectedCategory: 'all',
        selectedBrand: 'all',
        stockStatus: 'all',
    });

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch all products to perform client-side filtering and calculations
            const { products } = await getProducts('limit=10000');
            setAllProducts(products);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu tồn kho.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const uniqueBrands = useMemo(() => {
        const brands = new Set(allProducts.map(p => p.brand).filter(Boolean));
        return Array.from(brands);
    }, [allProducts]);

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setActiveFilters({
            searchTerm,
            selectedCategory,
            selectedBrand,
            stockStatus,
        });
    };
    
    const filteredProducts = useMemo(() => 
        allProducts.filter(item => {
            const searchMatch = activeFilters.searchTerm === '' ||
                item.name?.toLowerCase().includes(activeFilters.searchTerm.toLowerCase()) ||
                item.productCode?.toLowerCase().includes(activeFilters.searchTerm.toLowerCase());
            
            const categoryMatch = activeFilters.selectedCategory === 'all' || item.mainCategory === activeFilters.selectedCategory;
            const brandMatch = activeFilters.selectedBrand === 'all' || item.brand === activeFilters.selectedBrand;
            const stockMatch = activeFilters.stockStatus === 'all' || (activeFilters.stockStatus === 'in_stock' && item.stock > 0);

            return searchMatch && categoryMatch && brandMatch && stockMatch;
        }),
    [allProducts, activeFilters]);

    const summaryStats = useMemo(() => {
        return filteredProducts.reduce((acc, product) => {
            acc.totalQuantity += product.stock;
            acc.totalCost += (product.purchasePrice || 0) * product.stock;
            acc.totalValue += product.price * product.stock;
            return acc;
        }, {
            totalQuantity: 0,
            totalCost: 0,
            totalValue: 0
        });
    }, [filteredProducts]);

    if (isLoading) {
        return (
            <div className="admin-card">
                <div className="admin-card-body text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-3">Đang tải báo cáo tồn kho...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
             <div className="admin-card">
                <div className="admin-card-body">
                    <BackendConnectionError error={error} />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Tên hoặc Mã sản phẩm</label>
                        <input
                            type="text"
                            placeholder="Nhập để tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="admin-form-group !mb-0"
                        />
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Danh mục</label>
                        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="admin-form-group !mb-0">
                            <option value="all">-- Tất cả --</option>
                            {Constants.PRODUCT_CATEGORIES_HIERARCHY.map(cat => (
                                <option key={cat.slug} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Nhà sản xuất</label>
                        <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} className="admin-form-group !mb-0">
                            <option value="all">-- Tất cả --</option>
                            {uniqueBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                        </select>
                    </div>
                    <div>
                        <Button type="submit" className="w-full" leftIcon={<i className="fas fa-search"/>}>Xem</Button>
                    </div>
                </form>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Ngày lập" value={new Date().toLocaleDateString('vi-VN')} icon="fa-clock" color="bg-green-500" />
                <StatCard title="SL tồn kho" value={formatCurrency(summaryStats.totalQuantity)} icon="fa-tag" color="bg-blue-500" />
                <StatCard title="Tổng vốn tồn kho" value={formatCurrency(summaryStats.totalCost)} icon="fa-sync-alt" color="bg-orange-500" />
                <StatCard title="Tổng giá trị tồn kho" value={formatCurrency(summaryStats.totalValue)} icon="fa-shopping-cart" color="bg-red-500" />
            </div>

            <div className="admin-card">
                <div className="admin-card-body overflow-x-auto !p-0">
                    <table className="admin-table">
                        <thead className="thead-brand">
                            <tr>
                                <th>Mã hàng</th>
                                <th>Tên sản phẩm</th>
                                <th className="text-right">SL</th>
                                <th className="text-right">Vốn tồn kho</th>
                                <th className="text-right">Giá trị tồn</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(item => (
                                <tr key={item.id}>
                                    <td className="font-mono text-xs">{item.productCode || item.id}</td>
                                    <td className="font-semibold">{item.name}</td>
                                    <td className="text-right font-bold text-lg">{item.stock}</td>
                                    <td className="text-right">{formatCurrency((item.purchasePrice || 0) * item.stock)}</td>
                                    <td className="text-right text-primary font-semibold">{formatCurrency(item.price * item.stock)}</td>
                                </tr>
                            ))}
                        </tbody>
                         <tfoot>
                            <tr className="bg-gray-100 font-bold text-gray-800">
                                <td colSpan={2} className="p-3 text-right">Tổng cộng</td>
                                <td className="p-3 text-right text-lg">{formatCurrency(summaryStats.totalQuantity)}</td>
                                <td className="p-3 text-right">{formatCurrency(summaryStats.totalCost)}</td>
                                <td className="p-3 text-right text-primary">{formatCurrency(summaryStats.totalValue)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InventoryView;

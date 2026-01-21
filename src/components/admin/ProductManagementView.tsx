import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Product, MainCategoryInfo, SubCategoryInfo } from '../../types';
import * as Constants from '../../constants';
import Button from '../ui/Button';
import ImageUploadPreview from '../ui/ImageUploadPreview';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../../services/localDataService';
import BackendConnectionError from '../../components/shared/BackendConnectionError';
import * as ReactRouterDOM from 'react-router-dom';

const PRODUCTS_PER_PAGE = 10;

const ProductManagementView: React.FC = () => {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = ReactRouterDOM.useNavigate();

    const loadProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch all products for admin view by setting a high limit
            const { products } = await getProducts('limit=10000');
            setAllProducts(products);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu sản phẩm.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const filteredProducts = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return allProducts;

        return allProducts.filter(p => {
            const name = (p.name || '').toLowerCase();
            const mainCat = (p.mainCategory || '').toLowerCase();
            const subCat = (p.subCategory || '').toLowerCase();
            const brand = (p.brand || '').toLowerCase();
            const code = (p.productCode || '').toLowerCase();
            const id = (p.id || '').toLowerCase();

            return (
                name.includes(term) ||
                mainCat.includes(term) ||
                subCat.includes(term) ||
                brand.includes(term) ||
                code.includes(term) ||
                id.includes(term)
            );
        });
    }, [allProducts, searchTerm]);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
        return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

    const handleAddNewProduct = () => {
        navigate('/admin/products/new');
    };

    const handleEditProduct = (productId: string) => {
        navigate(`/admin/products/edit/${productId}`);
    };

    const handleDelete = async (productId: string) => {
        if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
            try {
                await deleteProduct(productId);
                loadProducts(); // Refresh data
            } catch (err) {
                alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa sản phẩm.');
            }
        }
    };

    const renderTableBody = () => {
        if (isLoading) {
            return <tr><td colSpan={6} className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></td></tr>;
        }
        if (error) {
            return (
                <tr>
                    <td colSpan={6} className="p-0">
                        <BackendConnectionError error={error} />
                    </td>
                </tr>
            );
        }
        if (paginatedProducts.length === 0) {
            return <tr><td colSpan={6} className="text-center py-8 text-textMuted">Không tìm thấy sản phẩm.</td></tr>;
        }
        return paginatedProducts.map(product => (
            <tr key={product.id}>
                <td>
                    <div className="flex items-center">
                        <img src={(product.imageUrls && product.imageUrls[0]) || `https://picsum.photos/seed/${product.id}/40/40`} alt={product.name} className="w-10 h-10 rounded-md mr-3 object-cover" />
                        <div>
                            <p className="font-semibold text-textBase line-clamp-1" title={product.name}>{product.name}</p>
                            <p className="text-xs text-textMuted">{product.productCode ? `Code: ${product.productCode}` : (product.brand || 'Không có')}</p>
                        </div>
                    </div>
                </td>
                <td>{product.mainCategory} &gt; {product.subCategory}</td>
                <td className="font-semibold text-primary">{product.price.toLocaleString('vi-VN')}₫</td>
                <td>{product.stock}</td>
                <td>
                    <span className={`status-badge ${product.isVisible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {product.isVisible ? 'Hiển thị' : 'Ẩn'}
                    </span>
                </td>
                <td>
                    <div className="flex gap-2">
                        <Button onClick={() => handleEditProduct(product.id)} size="sm" variant="outline"><i className="fas fa-edit"></i></Button>
                        <Button onClick={() => handleDelete(product.id)} size="sm" variant="ghost" className="text-red-500 hover:bg-red-50"><i className="fas fa-trash"></i></Button>
                    </div>
                </td>
            </tr>
        ));
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Quản lý Sản phẩm ({filteredProducts.length})</h3>
                <Button onClick={handleAddNewProduct} size="sm" leftIcon={<i className="fas fa-plus"></i>}>
                    Thêm Sản phẩm
                </Button>
            </div>
            <div className="admin-card-body">
                <input
                    type="text"
                    placeholder="Tìm sản phẩm theo tên, mã code, danh mục, hãng..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="admin-form-group w-full max-w-md mb-4"
                />
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Danh mục</th>
                                <th>Giá</th>
                                <th>Tồn kho</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {renderTableBody()}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="mt-4 flex justify-center">
                        {/* Basic Pagination */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <Button key={page} onClick={() => setCurrentPage(page)} variant={currentPage === page ? 'primary' : 'outline'} size="sm" className="mx-1">{page}</Button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductManagementView;
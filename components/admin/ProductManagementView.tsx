import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Product, MainCategoryInfo, SubCategoryInfo } from '../../types';
import * as Constants from '../../constants';
import Button from '../ui/Button';
import ImageUploadPreview from '../ui/ImageUploadPreview';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../../services/localDataService';

const PRODUCTS_PER_PAGE = 10;

const ProductManagementView: React.FC = () => {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const loadProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const products = await getProducts();
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

    const filteredProducts = useMemo(() =>
        allProducts.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.mainCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.subCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()))
        ), [allProducts, searchTerm]);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
        return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

    const openModalForNew = () => {
        setEditingProduct({
            id: '', name: '', mainCategory: '', subCategory: '', category: '', price: 0,
            imageUrls: [], description: '', specifications: {}, stock: 0, tags: [],
            isVisible: true,
        });
        setIsModalOpen(true);
    };

    const openModalForEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingProduct(null);
        setIsModalOpen(false);
    };

    const handleSave = async (productData: Product) => {
        try {
            if (productData.id) { // Update
                await updateProduct(productData.id, productData);
            } else { // Create
                await addProduct(productData);
            }
            loadProducts(); // Refresh data
            closeModal();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu sản phẩm.');
        }
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
                    <td colSpan={6} className="text-center py-8">
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 max-w-2xl mx-auto">
                            <h4 className="font-bold text-lg mb-2"><i className="fas fa-exclamation-triangle mr-2"></i>Lỗi Tải Dữ Liệu</h4>
                            <p className="text-sm">{error}</p>
                        </div>
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
                            <p className="font-semibold text-textBase">{product.name}</p>
                            <p className="text-xs text-textMuted">{product.brand || 'Không có'}</p>
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
                        <Button onClick={() => openModalForEdit(product)} size="sm" variant="outline"><i className="fas fa-edit"></i></Button>
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
                <Button onClick={openModalForNew} size="sm" leftIcon={<i className="fas fa-plus"></i>}>
                    Thêm Sản phẩm
                </Button>
            </div>
            <div className="admin-card-body">
                <input
                    type="text"
                    placeholder="Tìm sản phẩm theo tên, danh mục, hãng..."
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

            {isModalOpen && (
                <ProductFormModal
                    product={editingProduct}
                    onClose={closeModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

// --- Product Form Modal ---
interface ProductFormModalProps {
    product: Product | null;
    onClose: () => void;
    onSave: (product: Product) => void;
}
const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, onClose, onSave }) => {
    const [formData, setFormData] = useState<Product>(product || {} as Product);
    const [subCategoryOptions, setSubCategoryOptions] = useState<SubCategoryInfo[]>([]);

    useEffect(() => {
        if (formData.mainCategory) {
            const mainCat = Constants.PRODUCT_CATEGORIES_HIERARCHY.find(c => c.name === formData.mainCategory);
            setSubCategoryOptions(mainCat?.subCategories || []);
        } else {
            setSubCategoryOptions([]);
        }
    }, [formData.mainCategory]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const checked = (e.target as HTMLInputElement).checked;

        if (name === 'mainCategory') {
            setFormData(prev => ({...prev, mainCategory: value, subCategory: '', category: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: isCheckbox ? checked : value }));
        }
    };
    
    // Specifications handler
    const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
        const specs = Object.entries(formData.specifications);
        if (field === 'key') specs[index][0] = value;
        else specs[index][1] = value;
        setFormData(prev => ({...prev, specifications: Object.fromEntries(specs)}));
    };
    const addSpec = () => setFormData(prev => ({...prev, specifications: {...prev.specifications, [`Thuộc tính mới ${Object.keys(prev.specifications).length+1}`]: 'Giá trị' }}));
    const removeSpec = (key: string) => {
        const {[key]: _, ...rest} = formData.specifications;
        setFormData(prev => ({...prev, specifications: rest}));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-panel">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="admin-modal-header">
                        <h4 className="admin-modal-title">{formData.id ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm Mới'}</h4>
                        <button type="button" onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                    </div>
                    <div className="admin-modal-body">
                        {/* --- Main Info --- */}
                        <div className="admin-form-subsection-title">Thông tin cơ bản</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="admin-form-group md:col-span-2"><label htmlFor="name">Tên sản phẩm *</label><input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required /></div>
                            <div className="admin-form-group"><label htmlFor="mainCategory">Danh mục chính *</label>
                                <select name="mainCategory" id="mainCategory" value={formData.mainCategory} onChange={handleChange} required>
                                    <option value="">-- Chọn --</option>
                                    {Constants.PRODUCT_CATEGORIES_HIERARCHY.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="admin-form-group"><label htmlFor="subCategory">Danh mục con *</label>
                                <select name="subCategory" id="subCategory" value={formData.subCategory} onChange={handleChange} required disabled={!formData.mainCategory}>
                                     <option value="">-- Chọn --</option>
                                     {subCategoryOptions.map(sc => <option key={sc.slug} value={sc.name}>{sc.name}</option>)}
                                </select>
                            </div>
                            <div className="admin-form-group"><label htmlFor="brand">Hãng sản xuất</label><input type="text" name="brand" id="brand" value={formData.brand || ''} onChange={handleChange} /></div>
                            <div className="admin-form-group"><label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</label><input type="text" name="tags" id="tags" value={(formData.tags || []).join(', ')} onChange={e => setFormData(p => ({...p, tags: e.target.value.split(',').map(t => t.trim())}))} /></div>
                        </div>
                        <div className="admin-form-group"><label htmlFor="description">Mô tả chi tiết</label><textarea name="description" id="description" rows={5} value={formData.description} onChange={handleChange}></textarea></div>
                        <div className="admin-form-group"><label htmlFor="shortDescription">Mô tả ngắn</label><textarea name="shortDescription" id="shortDescription" rows={2} value={formData.shortDescription || ''} onChange={handleChange}></textarea></div>
                        <div className="admin-form-group"><label htmlFor="imageUrls">Link ảnh (mỗi link 1 dòng)</label><textarea name="imageUrls" id="imageUrls" rows={3} value={(formData.imageUrls || []).join('\n')} onChange={e => setFormData(p => ({...p, imageUrls: e.target.value.split('\n').map(t=>t.trim()).filter(Boolean)}))}></textarea></div>
                        
                        {/* --- Pricing & Stock --- */}
                        <div className="admin-form-subsection-title">Giá & Kho hàng</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div className="admin-form-group"><label htmlFor="price">Giá bán (VNĐ) *</label><input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required /></div>
                             <div className="admin-form-group"><label htmlFor="originalPrice">Giá gốc (VNĐ)</label><input type="number" name="originalPrice" id="originalPrice" value={formData.originalPrice || ''} onChange={handleChange} /></div>
                             <div className="admin-form-group"><label htmlFor="stock">Tồn kho *</label><input type="number" name="stock" id="stock" value={formData.stock} onChange={handleChange} required /></div>
                        </div>

                         {/* --- Specifications --- */}
                         <div className="admin-form-subsection-title">Thông số kỹ thuật</div>
                         <div className="space-y-2">
                            {Object.entries(formData.specifications).map(([key, value], index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <input type="text" value={key} onChange={(e) => handleSpecChange(index, 'key', e.target.value)} placeholder="Tên thuộc tính" className="w-1/3" />
                                    <input type="text" value={value} onChange={(e) => handleSpecChange(index, 'value', e.target.value)} placeholder="Giá trị" className="flex-grow" />
                                    <Button type="button" size="sm" variant="ghost" className="!text-red-500" onClick={() => removeSpec(key)}><i className="fas fa-times"></i></Button>
                                </div>
                            ))}
                            <Button type="button" size="sm" variant="outline" onClick={addSpec} leftIcon={<i className="fas fa-plus"></i>}>Thêm thông số</Button>
                         </div>
                        
                         {/* --- Settings --- */}
                        <div className="admin-form-subsection-title">Cài đặt hiển thị</div>
                        <div className="admin-form-group-checkbox">
                            <input type="checkbox" name="isVisible" id="isVisible" checked={formData.isVisible} onChange={handleChange} className="w-4 h-4" />
                            <label htmlFor="isVisible" className="!mb-0 !ml-2">Hiển thị sản phẩm trên trang web</label>
                        </div>
                    </div>
                    <div className="admin-modal-footer">
                        <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
                        <Button type="submit" variant="primary">Lưu Sản phẩm</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProductManagementView;
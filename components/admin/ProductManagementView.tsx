import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Product, ProductCategory } from '../../types';
import Button from '../ui/Button';
import { getProducts, addProduct, updateProduct, deleteProduct, getProductCategories } from '../../services/localDataService';
import MediaLibraryView from './MediaLibraryView';
import ImageUploadPreview from '../ui/ImageUploadPreview';

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
            (p.categoryName && p.categoryName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()))
        ), [allProducts, searchTerm]);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
        return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

    const openModalForNew = () => {
        setEditingProduct({
            id: 0, name: '', description: '', price: 0, stock: 0, images: [],
            categoryId: null, brand: '', specs: {}, createdAt: '', updatedAt: '',
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
                const { id, ...newProductData } = productData;
                await addProduct(newProductData as Omit<Product, 'id'|'createdAt'|'updatedAt'>);
            }
            loadProducts();
            closeModal();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu sản phẩm.');
        }
    };

    const handleDelete = async (productId: number) => {
        if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
            try {
                await deleteProduct(productId);
                loadProducts();
            } catch (err) {
                alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa sản phẩm.');
            }
        }
    };

    const renderTableBody = () => {
        if (isLoading) return <tr><td colSpan={6} className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></td></tr>;
        if (error) return <tr><td colSpan={6} className="text-center py-8 text-red-500">{error}</td></tr>;
        if (paginatedProducts.length === 0) return <tr><td colSpan={6} className="text-center py-8 text-textMuted">Không tìm thấy sản phẩm.</td></tr>;
        
        return paginatedProducts.map(product => (
            <tr key={product.id}>
                <td>
                    <div className="flex items-center">
                        <img src={(product.images && product.images[0]) || `https://picsum.photos/seed/${product.id}/40/40`} alt={product.name} className="w-10 h-10 rounded-md mr-3 object-cover" />
                        <div>
                            <p className="font-semibold text-textBase">{product.name}</p>
                            <p className="text-xs text-textMuted">{product.brand || 'N/A'}</p>
                        </div>
                    </div>
                </td>
                <td>{product.categoryName || 'N/A'}</td>
                <td className="font-semibold text-primary">{product.price.toLocaleString('vi-VN')}₫</td>
                <td>{product.stock}</td>
                <td>{new Date(product.updatedAt).toLocaleDateString('vi-VN')}</td>
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
                        <thead><tr><th>Sản phẩm</th><th>Danh mục</th><th>Giá</th><th>Tồn kho</th><th>Cập nhật</th><th>Hành động</th></tr></thead>
                        <tbody>{renderTableBody()}</tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="mt-4 flex justify-center">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <Button key={page} onClick={() => setCurrentPage(page)} variant={currentPage === page ? 'primary' : 'outline'} size="sm" className="mx-1">{page}</Button>
                        ))}
                    </div>
                )}
            </div>
            {isModalOpen && <ProductFormModal product={editingProduct} onClose={closeModal} onSave={handleSave} />}
        </div>
    );
};

interface ProductFormModalProps {
    product: Product | null;
    onClose: () => void;
    onSave: (product: Product) => void;
}
const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Product>>(product || {});
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [categoryError, setCategoryError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            setCategoryError(null);
            try {
                const cats = await getProductCategories();
                setCategories(cats);
                if (cats.length === 0) {
                    setCategoryError("Không tìm thấy danh mục nào. Vui lòng thêm danh mục trước.");
                }
            } catch (error) {
                console.error("Failed to load categories for product form:", error);
                setCategoryError("Không thể tải danh mục sản phẩm. Vui lòng thử lại.");
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
        const specsArray = Object.entries(formData.specs || {});
        if (field === 'key') specsArray[index][0] = value;
        else specsArray[index][1] = value;
        setFormData(prev => ({ ...prev, specs: Object.fromEntries(specsArray) }));
    };

    const addSpec = () => setFormData(prev => ({ ...prev, specs: { ...prev.specs, [`Thuộc tính mới ${Object.keys(prev.specs || {}).length + 1}`]: 'Giá trị' } }));
    const removeSpec = (key: string) => {
        const { [key]: _, ...rest } = formData.specs || {};
        setFormData(prev => ({ ...prev, specs: rest }));
    };

    const handleImageSelectFromLibrary = (url: string) => {
        setFormData(prev => ({ ...prev, images: [...(prev.images || []), url] }));
        setIsMediaModalOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Product);
    };

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-panel">
                <form onSubmit={handleSubmit} className="contents">
                    <div className="admin-modal-header"><h4 className="admin-modal-title">{formData.id ? 'Chỉnh sửa' : 'Thêm'} Sản phẩm</h4><button type="button" onClick={onClose}>&times;</button></div>
                    <div className="admin-modal-body">
                        <div className="admin-form-subsection-title">Thông tin cơ bản</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="admin-form-group md:col-span-2"><label>Tên sản phẩm *</label><input type="text" name="name" value={formData.name || ''} onChange={handleChange} required /></div>
                            <div className="admin-form-group"><label>Danh mục *</label>
                                <select name="categoryId" value={formData.categoryId || ''} onChange={handleChange} required>
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.filter(c => c.parentCategoryId === null).map(mainCat => (
                                        <optgroup key={mainCat.id} label={mainCat.name}>
                                            {categories.filter(c => c.parentCategoryId === mainCat.id).map(subCat => (
                                                <option key={subCat.id} value={subCat.id}>{subCat.name}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                                {categoryError && <p className="form-input-description text-danger-text">{categoryError}</p>}
                            </div>
                            <div className="admin-form-group"><label>Hãng sản xuất</label><input type="text" name="brand" value={formData.brand || ''} onChange={handleChange} /></div>
                        </div>
                        <div className="admin-form-group"><label>Mô tả chi tiết</label><textarea name="description" rows={5} value={formData.description || ''} onChange={handleChange}></textarea></div>
                        
                        <div className="admin-form-subsection-title">Ảnh sản phẩm</div>
                        <div className="flex justify-end mb-2">
                             <Button type="button" size="sm" variant="outline" onClick={() => setIsMediaModalOpen(true)}><i className="fas fa-photo-video mr-2"></i> Chọn từ Thư viện</Button>
                        </div>
                        <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-gray-50 min-h-[80px]">
                            {(formData.images || []).map((url, index) => (
                                <ImageUploadPreview key={index} src={url} onRemove={() => setFormData(p => ({...p, images: (p.images || []).filter((_, i) => i !== index)}))}/>
                            ))}
                        </div>

                        <div className="admin-form-subsection-title">Giá & Kho hàng</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div className="admin-form-group"><label>Giá bán (VNĐ) *</label><input type="number" name="price" value={formData.price || ''} onChange={handleChange} required /></div>
                             <div className="admin-form-group"><label>Giá gốc (VNĐ)</label><input type="number" name="originalPrice" value={formData.originalPrice || ''} onChange={handleChange} /></div>
                             <div className="admin-form-group"><label>Tồn kho *</label><input type="number" name="stock" value={formData.stock || ''} onChange={handleChange} required /></div>
                        </div>

                         <div className="admin-form-subsection-title">Thông số kỹ thuật</div>
                         <div className="space-y-2">
                            {Object.entries(formData.specs || {}).map(([key, value], index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <input type="text" value={key} onChange={(e) => handleSpecChange(index, 'key', e.target.value)} placeholder="Tên thuộc tính" className="w-1/3" />
                                    <input type="text" value={String(value)} onChange={(e) => handleSpecChange(index, 'value', e.target.value)} placeholder="Giá trị" className="flex-grow" />
                                    <Button type="button" size="sm" variant="ghost" className="!text-red-500" onClick={() => removeSpec(key)}><i className="fas fa-times"></i></Button>
                                </div>
                            ))}
                            <Button type="button" size="sm" variant="outline" onClick={addSpec} leftIcon={<i className="fas fa-plus"></i>}>Thêm thông số</Button>
                         </div>
                    </div>
                    <div className="admin-modal-footer">
                        <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
                        <Button type="submit" variant="primary">Lưu Sản phẩm</Button>
                    </div>
                </form>
                {isMediaModalOpen && <MediaLibraryView isModalMode={true} onSelect={handleImageSelectFromLibrary} onClose={() => setIsMediaModalOpen(false)} />}
            </div>
        </div>
    );
}

export default ProductManagementView;
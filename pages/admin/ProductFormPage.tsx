import React, { useState, useEffect, useCallback } from 'react';
import { Product, MainCategoryInfo, SubCategoryInfo, Supplier } from '../../types';
import * as Constants from '../../constants';
import Button from '../../components/ui/Button';
import ImageUploadInput from '../../components/ui/ImageUploadInput';
import { getProduct, addProduct, updateProduct, getSuppliers } from '../../services/localDataService';
import * as ReactRouterDOM from 'react-router-dom';

const ProductFormPage: React.FC = () => {
    const { productId } = ReactRouterDOM.useParams<{ productId: string }>();
    const navigate = ReactRouterDOM.useNavigate();
    const isEditing = !!productId;

    const [formData, setFormData] = useState<Partial<Product> | null>(null);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [subCategoryOptions, setSubCategoryOptions] = useState<SubCategoryInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load product data and suppliers
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const suppliersData = await getSuppliers();
                setSuppliers(suppliersData);

                if (isEditing) {
                    const foundProduct = await getProduct(productId!);
                    if (foundProduct) {
                        setFormData(foundProduct);
                    } else {
                        setError('Không tìm thấy sản phẩm để chỉnh sửa.');
                    }
                } else {
                    setFormData({
                        id: '', name: '', mainCategory: '', subCategory: '', price: 0,
                        imageUrls: [], stock: 0, tags: [],
                        isVisible: true, hasVAT: false, purchasePrice: 0, wholesalePrice: 0,
                        seoMetaTitle: '', seoMetaDescription: '', slug: ''
                    });
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu.');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [isEditing, productId]);

    // Update subCategoryOptions when mainCategory changes
    useEffect(() => {
        if (formData?.mainCategory) {
            const mainCat = Constants.PRODUCT_CATEGORIES_HIERARCHY.find(c => c.name === formData.mainCategory);
            setSubCategoryOptions(mainCat?.subCategories || []);
        } else {
            setSubCategoryOptions([]);
        }
    }, [formData?.mainCategory]);

    // FIX: The `handleChange` function was refactored to correctly handle different input types (text, number, checkbox)
    // and resolve a TypeScript error. `finalValue` is now explicitly typed, and number conversion is handled safely.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!formData) return;
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const checked = (e.target as HTMLInputElement).checked;
        
        let finalValue: string | boolean | number | undefined = isCheckbox ? checked : value;

        if (type === 'number') {
            finalValue = Number(value);
        }
        
        if (name === 'mainCategory') {
            setFormData(prev => prev ? ({ ...prev, mainCategory: value, subCategory: '' }) : null);
        } else if (name === 'supplierId') {
            const supplier = suppliers.find(s => s.id === value);
            setFormData(prev => prev ? ({ ...prev, supplierId: value, supplierName: supplier?.name || '' }) : null);
        } else {
            setFormData(prev => prev ? ({ ...prev, [name]: finalValue }) : null);
        }
    };

    // Image handlers
    const addImageUrl = () => {
        if (!formData) return;
        setFormData(p => p ? ({ ...p, imageUrls: [...(p.imageUrls || []), ''] }) : null);
    };
    const handleImageUrlsChange = (index: number, value: string) => {
        if (!formData) return;
        const newUrls = [...(formData.imageUrls || [])];
        newUrls[index] = value;
        setFormData(p => p ? ({ ...p, imageUrls: newUrls }) : null);
    };
    const removeImageUrl = (index: number) => {
        if (!formData) return;
        setFormData(p => p ? ({ ...p, imageUrls: (p.imageUrls || []).filter((_, i) => i !== index) }) : null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;
        try {
            // Ensure category is set
            const finalData = { ...formData };
            if (formData.mainCategory && formData.subCategory) {
                finalData.category = `${formData.mainCategory} > ${formData.subCategory}`;
            }

            if (isEditing) {
                await updateProduct(formData.id!, finalData);
                alert('Cập nhật sản phẩm thành công!');
            } else {
                await addProduct(finalData as Omit<Product, 'id'>);
                alert('Thêm sản phẩm mới thành công!');
            }
            navigate('/admin/products');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu sản phẩm.');
        }
    };

    if (isLoading) return <div className="admin-card"><div className="admin-card-body text-center">Đang tải...</div></div>;
    if (error) return <div className="admin-card"><div className="admin-card-body text-center text-red-500">{error}</div></div>;
    if (!formData) return null;

    return (
        <form onSubmit={handleSubmit}>
            <div className="admin-card !p-0 !bg-transparent !border-none !shadow-none">
                <div className="admin-page-header flex justify-between items-center !m-0 !mb-6">
                    <h1 className="admin-page-title">{isEditing ? `Chỉnh sửa Sản phẩm` : 'Thêm Sản phẩm Mới'}</h1>
                     <div>
                        <Button type="button" variant="outline" onClick={() => navigate('/admin/products')} className="mr-2">Hủy</Button>
                        <Button type="submit" variant="primary">Lưu Sản phẩm</Button>
                    </div>
                </div>
                <div className="space-y-6">
                    {/* --- General Info Section --- */}
                    <div className="p-6 border rounded-lg bg-white shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-primary">Thông tin chung</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="admin-form-group md:col-span-2"><label>Tên sản phẩm *</label><input type="text" name="name" value={formData.name || ''} onChange={handleChange} required /></div>
                            <div className="admin-form-group"><label>Mã sản phẩm</label><input type="text" name="productCode" value={formData.productCode || ''} onChange={handleChange} /></div>
                            <div className="admin-form-group"><label>Thương hiệu</label><input type="text" name="brand" value={formData.brand || ''} onChange={handleChange} /></div>
                            <div className="admin-form-group"><label>Danh mục chính</label>
                                <select name="mainCategory" value={formData.mainCategory || ''} onChange={handleChange}>
                                    <option value="">-- Chọn --</option>
                                    {Constants.PRODUCT_CATEGORIES_HIERARCHY.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="admin-form-group"><label>Danh mục phụ</label>
                                <select name="subCategory" value={formData.subCategory || ''} onChange={handleChange} disabled={!formData.mainCategory}>
                                    <option value="">-- Chọn --</option>
                                    {subCategoryOptions.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                             <div className="admin-form-group md:col-span-2"><label>Nhà cung cấp</label>
                                <select name="supplierId" value={formData.supplierId || ''} onChange={handleChange}>
                                    <option value="">-- Chọn nhà cung cấp --</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* --- Price & Stock Section --- */}
                    <div className="p-6 border rounded-lg bg-white shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-primary">Thông tin Giá & Kho Hàng</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="admin-form-group"><label>Giá Nhập</label><input type="number" name="purchasePrice" value={formData.purchasePrice ?? ''} onChange={handleChange} /></div>
                            <div className="admin-form-group"><label>Giá Bán Sỉ</label><input type="number" name="wholesalePrice" value={formData.wholesalePrice ?? ''} onChange={handleChange} /></div>
                            <div className="admin-form-group"><label>Giá Bán Lẻ *</label><input type="number" name="price" value={formData.price ?? ''} onChange={handleChange} required /></div>
                            <div className="admin-form-group"><label>Tồn Kho *</label><input type="number" name="stock" value={formData.stock ?? ''} onChange={handleChange} required /></div>
                            <div className="admin-form-group-checkbox items-center pt-6"><input type="checkbox" name="hasVAT" id="hasVAT" checked={formData.hasVAT} onChange={handleChange} /><label htmlFor="hasVAT" className="!mb-0 !ml-2">Phải cộng VAT</label></div>
                        </div>
                    </div>

                    {/* --- Image Management Section --- */}
                    <div className="p-6 border rounded-lg bg-white shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-primary">Hình ảnh sản phẩm</h3>
                         <div className="space-y-3">
                            {(formData.imageUrls || []).map((url, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <ImageUploadInput label="" value={url} onChange={value => handleImageUrlsChange(index, value)} showPreview={true}/>
                                    <Button type="button" size="sm" variant="ghost" className="!text-red-500" onClick={() => removeImageUrl(index)} title="Xóa ảnh"><i className="fas fa-trash"></i></Button>
                                </div>
                            ))}
                        </div>
                        <Button type="button" size="sm" variant="outline" onClick={addImageUrl} className="mt-4" leftIcon={<i className="fas fa-plus"></i>}>Thêm ảnh</Button>
                    </div>
                     
                    {/* --- SEO Section --- */}
                    <div className="p-6 border rounded-lg bg-white shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-primary">Tối ưu hóa SEO</h3>
                         <div className="space-y-4">
                            <div className="admin-form-group">
                                <label>Tiêu đề SEO (Meta Title)</label>
                                <input type="text" name="seoMetaTitle" value={formData.seoMetaTitle || ''} onChange={handleChange} />
                            </div>
                             <div className="admin-form-group">
                                <label>Mô tả SEO (Meta Description)</label>
                                <textarea name="seoMetaDescription" value={formData.seoMetaDescription || ''} onChange={handleChange} rows={3}></textarea>
                            </div>
                            <div className="admin-form-group">
                                <label>Đường dẫn (URL Slug)</label>
                                <input type="text" name="slug" value={formData.slug || ''} onChange={handleChange} />
                                <p className="form-input-description">Ví dụ: pc-gaming-iq-eagle. Để trống để tạo tự động.</p>
                            </div>
                        </div>
                    </div>
                     
                     {/* --- Other settings --- */}
                    <div className="p-6 border rounded-lg bg-white shadow-sm">
                         <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-primary">Cài đặt khác</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="admin-form-group-checkbox items-center">
                                <input type="checkbox" name="isVisible" id="isVisible" checked={formData.isVisible} onChange={handleChange} className="w-4 h-4" />
                                <label htmlFor="isVisible" className="!mb-0 !ml-2">Hiển thị sản phẩm trên trang web</label>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default ProductFormPage;

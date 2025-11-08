import React, { useState, useEffect, useCallback } from 'react';
import { Product, MainCategoryInfo, SubCategoryInfo } from '../../types';
import * as Constants from '../../constants';
import Button from '../../components/ui/Button';
import ImageUploadInput from '../../components/ui/ImageUploadInput';
import { getProduct, addProduct, updateProduct } from '../../services/localDataService';
import * as ReactRouterDOM from 'react-router-dom';

const ProductFormPage: React.FC = () => {
    const { productId } = ReactRouterDOM.useParams<{ productId: string }>();
    const navigate = ReactRouterDOM.useNavigate();
    const isEditing = !!productId;

    const [formData, setFormData] = useState<Product | null>(null);
    const [subCategoryOptions, setSubCategoryOptions] = useState<SubCategoryInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load product data if in editing mode
    useEffect(() => {
        const loadProduct = async () => {
            if (isEditing) {
                setIsLoading(true);
                setError(null);
                try {
                    const foundProduct = await getProduct(productId!);
                    if (foundProduct) {
                        setFormData(foundProduct);
                    } else {
                        setError('Không tìm thấy sản phẩm để chỉnh sửa.');
                    }
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu sản phẩm.');
                } finally {
                    setIsLoading(false);
                }
            } else {
                // Initialize for new product
                setFormData({
                    id: '', name: '', mainCategory: '', subCategory: '', category: '', price: 0,
                    imageUrls: [], description: '', specifications: {}, stock: 0, tags: [],
                    isVisible: true,
                });
                setIsLoading(false);
            }
        };
        loadProduct();
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!formData) return;
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const checked = (e.target as HTMLInputElement).checked;

        if (name === 'mainCategory') {
            setFormData(prev => prev ? ({ ...prev, mainCategory: value, subCategory: '', category: '' }) : null);
        } else {
            setFormData(prev => prev ? ({ ...prev, [name]: isCheckbox ? checked : value }) : null);
        }
    };

    // Specifications handler
    const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
        if (!formData) return;
        const specs = Object.entries(formData.specifications);
        if (field === 'key') specs[index][0] = value;
        else specs[index][1] = value;
        setFormData(prev => prev ? ({ ...prev, specifications: Object.fromEntries(specs) }) : null);
    };
    const addSpec = () => {
        if (!formData) return;
        setFormData(prev => prev ? ({ ...prev, specifications: { ...prev.specifications, [`Thuộc tính mới ${Object.keys(prev.specifications).length + 1}`]: 'Giá trị' } }) : null);
    };
    const removeSpec = (key: string) => {
        if (!formData) return;
        const { [key]: _, ...rest } = formData.specifications;
        setFormData(prev => prev ? ({ ...prev, specifications: rest }) : null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        try {
            if (isEditing) {
                await updateProduct(formData.id, formData);
                alert('Cập nhật sản phẩm thành công!');
            } else {
                await addProduct(formData);
                alert('Thêm sản phẩm mới thành công!');
            }
            navigate('/admin/products'); // Navigate back to product list
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu sản phẩm.');
        }
    };

    if (isLoading) {
        return (
            <div className="admin-card">
                <div className="admin-card-body text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-textMuted">Đang tải dữ liệu sản phẩm...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-card">
                <div className="admin-card-body text-center py-8 text-danger-text">
                    <i className="fas fa-exclamation-triangle text-3xl mb-3"></i>
                    <p>{error}</p>
                    <Button onClick={() => navigate('/admin/products')} className="mt-4">Quay lại</Button>
                </div>
            </div>
        );
    }
    
    if (!formData) return null; // Should not happen if isLoading is handled

    return (
        <div className="admin-card">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="admin-card-header">
                    <h3 className="admin-card-title">{isEditing ? `Chỉnh sửa Sản phẩm: ${formData.name}` : 'Thêm Sản phẩm Mới'}</h3>
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>Hủy</Button>
                </div>
                <div className="admin-card-body admin-product-form-page-body"> {/* Apply custom class for body scrolling */}
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
                        <div className="admin-form-group"><label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</label><input type="text" name="tags" id="tags" value={(formData.tags || []).join(', ')} onChange={e => setFormData(p => p ? ({ ...p, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }) : null)} /></div>
                    </div>
                    <div className="admin-form-group"><label htmlFor="description">Mô tả chi tiết</label><textarea name="description" id="description" rows={5} value={formData.description} onChange={handleChange}></textarea></div>
                    <div className="admin-form-group"><label htmlFor="shortDescription">Mô tả ngắn</label><textarea name="shortDescription" id="shortDescription" rows={2} value={formData.shortDescription || ''} onChange={handleChange}></textarea></div>
                    <div className="admin-form-group"><label htmlFor="imageUrls">Link ảnh (mỗi link 1 dòng)</label><textarea name="imageUrls" id="imageUrls" rows={3} value={(formData.imageUrls || []).join('\n')} onChange={e => setFormData(p => p ? ({ ...p, imageUrls: e.target.value.split('\n').map(t => t.trim()).filter(Boolean) }) : null)}></textarea></div>

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
                        {Object.entries(formData.specifications || {}).map(([key, value], index) => (
                            <div key={key} className="flex gap-2 items-center">
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
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>Hủy</Button>
                    <Button type="submit" variant="primary">Lưu Sản phẩm</Button>
                </div>
            </form>
        </div>
    );
};

export default ProductFormPage;

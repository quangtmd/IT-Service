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

    const [formData, setFormData] = useState<Partial<Product> | null>(null);
    const [subCategoryOptions, setSubCategoryOptions] = useState<SubCategoryInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load product data
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
                setFormData({
                    id: '', name: '', mainCategory: '', subCategory: '', category: '', price: 0,
                    imageUrls: [], description: '', specifications: {}, stock: 0, tags: [],
                    isVisible: true, hasVAT: false, unit: 'Cái', warrantyPeriod: 12
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

    // Image handlers
    const handleImageUrlsChange = (index: number, value: string) => {
        if (!formData) return;
        const newUrls = [...(formData.imageUrls || [])];
        newUrls[index] = value;
        setFormData(p => p ? ({ ...p, imageUrls: newUrls }) : null);
    };
    const addImageUrl = () => {
        if (!formData) return;
        setFormData(p => p ? ({ ...p, imageUrls: [...(p.imageUrls || []), ''] }) : null);
    };
    const removeImageUrl = (index: number) => {
        if (!formData) return;
        setFormData(p => p ? ({ ...p, imageUrls: (p.imageUrls || []).filter((_, i) => i !== index) }) : null);
    };
    const moveImageUrl = (index: number, direction: 'up' | 'down') => {
        if (!formData?.imageUrls) return;
        const newUrls = [...formData.imageUrls];
        const item = newUrls[index];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= newUrls.length) return;
        newUrls[index] = newUrls[swapIndex];
        newUrls[swapIndex] = item;
        setFormData(p => p ? ({ ...p, imageUrls: newUrls }) : null);
    };


    // Specifications handler
    const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
        if (!formData) return;
        const specs = Object.entries(formData.specifications || {});
        if (field === 'key') specs[index][0] = value;
        else specs[index][1] = value;
        setFormData(prev => prev ? ({ ...prev, specifications: Object.fromEntries(specs) }) : null);
    };
    const addSpec = () => {
        if (!formData) return;
        setFormData(prev => prev ? ({ ...prev, specifications: { ...prev.specifications, [`Thuộc tính mới ${Object.keys(prev.specifications || {}).length + 1}`]: 'Giá trị' } }) : null);
    };
    const removeSpec = (key: string) => {
        if (!formData) return;
        const { [key]: _, ...rest } = (formData.specifications || {});
        setFormData(prev => prev ? ({ ...prev, specifications: rest }) : null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;
        try {
            if (isEditing) {
                await updateProduct(formData.id!, formData);
                alert('Cập nhật sản phẩm thành công!');
            } else {
                await addProduct(formData as Omit<Product, 'id'>);
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
            <div className="admin-card !p-0">
                <div className="admin-card-header flex justify-between items-center">
                    <h3 className="admin-card-title">{isEditing ? `Chỉnh sửa Sản phẩm` : 'Thêm Sản phẩm Mới'}</h3>
                    <div>
                        <Button type="button" variant="outline" onClick={() => navigate('/admin/products')} className="mr-2">Hủy</Button>
                        <Button type="submit" variant="primary">Lưu Sản phẩm</Button>
                    </div>
                </div>
                <div className="admin-card-body">
                    {/* --- Product Info Section --- */}
                    <div className="p-4 border rounded-md bg-white shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-primary">Thông tin Hàng Hóa</h3>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="admin-form-group md:col-span-2"><label>Mã Hàng</label><input type="text" name="productCode" value={formData.productCode || ''} onChange={handleChange} /></div>
                            <div className="admin-form-group md:col-span-4"><label>Tên Hàng *</label><input type="text" name="name" value={formData.name || ''} onChange={handleChange} required /></div>
                            <div className="admin-form-group md:col-span-6"><label>Tên Hàng (in)</label><input type="text" name="printName" value={formData.printName || ''} onChange={handleChange} /></div>
                            <div className="admin-form-group md:col-span-6"><label>Diễn giải, tính năng kỹ thuật</label><textarea name="description" rows={4} value={formData.description || ''} onChange={handleChange}></textarea></div>
                            <div className="admin-form-group md:col-span-2"><label>Mã Vạch</label><input type="text" name="barcode" value={formData.barcode || ''} onChange={handleChange} /></div>
                            <div className="admin-form-group md:col-span-1"><label>ĐVT</label><input type="text" name="unit" value={formData.unit || ''} onChange={handleChange} /></div>
                            <div className="admin-form-group md:col-span-1"><label>Bảo hành (tháng)</label><input type="number" name="warrantyPeriod" value={formData.warrantyPeriod || ''} onChange={handleChange} /></div>
                            <div className="admin-form-group md:col-span-1"><label>Xuất xứ</label><input type="text" name="countryOfOrigin" value={formData.countryOfOrigin || ''} onChange={handleChange} /></div>
                            <div className="admin-form-group md:col-span-1"><label>Năm SX</label><input type="number" name="yearOfManufacture" value={formData.yearOfManufacture || ''} onChange={handleChange} /></div>
                        </div>
                    </div>

                    {/* --- Price & Stock Section --- */}
                    <div className="p-4 border rounded-md bg-white shadow-sm mt-6">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-primary">Thông tin Giá & Kho Hàng</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="admin-form-group"><label>Giá Nhập</label><input type="number" name="purchasePrice" value={formData.purchasePrice || ''} onChange={handleChange} /></div>
                            <div className="admin-form-group"><label>Giá Bán Sỉ</label><input type="number" name="wholesalePrice" value={formData.wholesalePrice || ''} onChange={handleChange} /></div>
                            <div className="admin-form-group"><label>Giá Bán Lẻ *</label><input type="number" name="price" value={formData.price || ''} onChange={handleChange} required /></div>
                            <div className="admin-form-group"><label>Tồn Kho *</label><input type="number" name="stock" value={formData.stock || ''} onChange={handleChange} required /></div>
                            <div className="admin-form-group-checkbox items-center pt-6"><input type="checkbox" name="hasVAT" id="hasVAT" checked={formData.hasVAT} onChange={handleChange} /><label htmlFor="hasVAT" className="!mb-0 !ml-2">Phải cộng VAT</label></div>
                        </div>
                    </div>

                    {/* --- Image Management Section --- */}
                    <div className="p-4 border rounded-md bg-white shadow-sm mt-6">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-primary">Hình ảnh sản phẩm</h3>
                        {formData.imageUrls && formData.imageUrls.length > 0 && (
                            <div className="mb-4">
                                <label className="admin-form-group label">Ảnh đại diện (ảnh đầu tiên trong danh sách)</label>
                                <img src={formData.imageUrls[0]} alt="Ảnh đại diện" className="w-40 h-40 object-contain rounded-md border p-1 bg-gray-50" onError={(e) => e.currentTarget.src = 'https://picsum.photos/200'} />
                            </div>
                        )}
                        <div className="space-y-2">
                            {(formData.imageUrls || []).map((url, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <span className="font-mono text-xs w-6 text-gray-500">{index + 1}.</span>
                                    <ImageUploadInput label="" value={url} onChange={value => handleImageUrlsChange(index, value)} />
                                    <Button type="button" size="sm" variant="ghost" onClick={() => moveImageUrl(index, 'up')} disabled={index === 0} title="Di chuyển lên"><i className="fas fa-arrow-up"></i></Button>
                                    <Button type="button" size="sm" variant="ghost" onClick={() => moveImageUrl(index, 'down')} disabled={index === (formData.imageUrls || []).length - 1} title="Di chuyển xuống"><i className="fas fa-arrow-down"></i></Button>
                                    <Button type="button" size="sm" variant="ghost" className="!text-red-500" onClick={() => removeImageUrl(index)} title="Xóa ảnh"><i className="fas fa-trash"></i></Button>
                                </div>
                            ))}
                        </div>
                        <Button type="button" size="sm" variant="outline" onClick={addImageUrl} className="mt-3" leftIcon={<i className="fas fa-plus"></i>}>Thêm ảnh</Button>
                    </div>
                    
                     {/* --- Other settings --- */}
                    <div className="p-4 border rounded-md bg-white shadow-sm mt-6">
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
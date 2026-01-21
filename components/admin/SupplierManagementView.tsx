import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Supplier } from '../../types';
import { getSuppliers, deleteSupplier } from '../../services/localDataService';
import Button from '../ui/Button';
import BackendConnectionError from '../shared/BackendConnectionError';

const SupplierManagementView: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getSuppliers();
            setSuppliers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu nhà cung cấp.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAddNew = () => {
        navigate('/admin/suppliers/new');
    };

    const handleEdit = (id: string) => {
        navigate(`/admin/suppliers/edit/${id}`);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa nhà cung cấp này?')) {
            try {
                await deleteSupplier(id);
                loadData();
            } catch (err) {
                alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa.');
            }
        }
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Quản lý Nhà Cung Cấp ({suppliers.length})</h3>
                <Button onClick={handleAddNew} size="sm" leftIcon={<i className="fas fa-plus"></i>}>
                    Thêm NCC
                </Button>
            </div>
            <div className="admin-card-body">
                {error && <BackendConnectionError error={error} />}
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Tên Nhà Cung Cấp</th>
                                <th>Liên hệ</th>
                                <th>Điều khoản TT</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={4} className="text-center py-4">Đang tải...</td></tr>
                            ) : !error && suppliers.length > 0 ? (
                                suppliers.map(s => (
                                    <tr key={s.id}>
                                        <td className="font-semibold">{s.name}</td>
                                        <td>
                                            <p>{s.contactInfo?.phone}</p>
                                            <p className="text-xs text-gray-500">{s.contactInfo?.email}</p>
                                        </td>
                                        <td>{s.paymentTerms}</td>
                                        <td>
                                            <div className="flex gap-2">
                                                <Button onClick={() => handleEdit(s.id)} size="sm" variant="outline"><i className="fas fa-edit"></i></Button>
                                                <Button onClick={() => handleDelete(s.id)} size="sm" variant="ghost" className="text-red-500"><i className="fas fa-trash"></i></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                !error && <tr><td colSpan={4} className="text-center py-4 text-textMuted">Chưa có nhà cung cấp nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SupplierManagementView;
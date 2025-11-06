import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

interface ConsultationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string | null;
}

const ConsultationRequestModal: React.FC<ConsultationRequestModalProps> = ({ isOpen, onClose, planName }) => {
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', notes: '' });
    const [error, setError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { addAdminNotification } = useAuth();

    useEffect(() => {
        if (currentUser) {
            setFormData(prev => ({ ...prev, name: currentUser.username, email: currentUser.email, phone: currentUser.phone || '' }));
        }
    }, [currentUser, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!formData.name || !formData.phone || !formData.email) {
            setError('Vui lòng điền đầy đủ thông tin bắt buộc.');
            return;
        }
        if (!/^\d{10,11}$/.test(formData.phone)) {
            setError('Số điện thoại không hợp lệ.');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError('Email không hợp lệ.');
            return;
        }

        console.log('Consultation Request:', { ...formData, planName });
        addAdminNotification(`Yêu cầu tư vấn gói "${planName}" từ ${formData.name} (SĐT: ${formData.phone}).`, 'info');
        setIsSubmitted(true);
        setTimeout(() => {
            onClose();
            // Reset state after modal closes
            setTimeout(() => {
                setIsSubmitted(false);
                setFormData({ name: '', phone: '', email: '', notes: '' });
            }, 300);
        }, 3000);
    };

    const handleClose = () => {
        setIsSubmitted(false);
        setFormData({ name: '', phone: '', email: '', notes: '' });
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <div className="admin-modal-overlay" onClick={handleClose}>
            <form onSubmit={handleSubmit} className="admin-modal-panel max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <h4 className="admin-modal-title">Yêu Cầu Tư Vấn Dịch Vụ</h4>
                    <button type="button" onClick={handleClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                </div>
                {isSubmitted ? (
                    <div className="admin-modal-body text-center py-12">
                        <i className="fas fa-check-circle text-6xl text-success-text mb-4"></i>
                        <h3 className="text-xl font-semibold text-textBase">Gửi Yêu Cầu Thành Công!</h3>
                        <p className="text-textMuted mt-2">Cảm ơn bạn! Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.</p>
                    </div>
                ) : (
                    <>
                        <div className="admin-modal-body">
                            <p className="text-center mb-4 text-textMuted">Bạn đang yêu cầu tư vấn cho gói: <strong className="text-primary">{planName}</strong></p>
                            {error && <p className="text-sm text-danger-text bg-danger-bg p-3 rounded-md mb-4">{error}</p>}
                            <div className="space-y-4">
                                <div className="admin-form-group">
                                    <label htmlFor="name">Họ và tên *</label>
                                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="admin-form-group">
                                        <label htmlFor="phone">Số điện thoại *</label>
                                        <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required />
                                    </div>
                                    <div className="admin-form-group">
                                        <label htmlFor="email">Email *</label>
                                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="admin-form-group">
                                    <label htmlFor="notes">Ghi chú thêm</label>
                                    <textarea name="notes" id="notes" value={formData.notes} onChange={handleChange} rows={3}></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <Button type="button" variant="outline" onClick={handleClose}>Hủy</Button>
                            <Button type="submit">Gửi Yêu Cầu</Button>
                        </div>
                    </>
                )}
            </form>
        </div>
    );
};
export default ConsultationRequestModal;
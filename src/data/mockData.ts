import { Service, Testimonial, PCComponent, Project, User, Order, AdminNotification, UserRole, StaffRole, Article } from '../types';
import React from 'react'; 
import { ADMIN_EMAIL } from '../constants';

export const MOCK_SERVICES: Service[] = [
  { 
    id: 'svc001', 
    name: 'Thiết Kế & Phát Triển Web Chuyên Nghiệp', 
    description: 'Chúng tôi cung cấp giải pháp website toàn diện, từ thiết kế UX/UI hiện đại, trực quan đến phát triển frontend & backend mạnh mẽ, đảm bảo tối ưu hóa SEO và mang lại trải nghiệm người dùng vượt trội.', 
    icon: 'fas fa-laptop-code', 
    imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1770&auto=format&fit=crop',
    slug: 'thiet-ke-phat-trien-web' 
  },
  { 
    id: 'svc002', 
    name: 'Quản Trị Hệ Thống Mạng Doanh Nghiệp', 
    description: 'Dịch vụ quản trị, giám sát và bảo trì hệ thống mạng chuyên nghiệp cho doanh nghiệp. Đảm bảo hệ thống của bạn hoạt động ổn định, an toàn, hiệu quả với hiệu suất tối đa.', 
    icon: 'fas fa-network-wired', 
    imageUrl: 'https://images.unsplash.com/photo-1587135304381-e3f43845b4ca?q=80&w=1770&auto=format&fit=crop',
    slug: 'quan-tri-he-thong-mang'
  },
  { 
    id: 'svc003', 
    name: 'Giải Pháp Lưu Trữ & Sao Lưu Đám Mây', 
    description: 'Tư vấn và triển khai các giải pháp lưu trữ đám mây (Cloud Storage) và sao lưu dữ liệu (Cloud Backup) linh hoạt, an toàn và tiết kiệm chi phí cho cá nhân và doanh nghiệp.', 
    icon: 'fas fa-cloud-upload-alt', 
    imageUrl: 'https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?q=80&w=1770&auto=format&fit=crop',
    slug: 'luu-tru-sao-luu-dam-may'
  },
  { 
    id: 'svc004', 
    name: 'Hỗ Trợ Kỹ Thuật Từ Xa Nhanh Chóng', 
    description: 'Đội ngũ kỹ thuật viên chuyên nghiệp của chúng tôi sẵn sàng giải quyết nhanh chóng các sự cố máy tính, phần mềm qua TeamViewer, UltraViewer, đảm bảo công việc của bạn không bị gián đoạn.', 
    icon: 'fas fa-headset', 
    imageUrl: 'https://images.unsplash.com/photo-1616587894285-3d17c752531a?q=80&w=1770&auto=format&fit=crop',
    slug: 'ho-tro-ky-thuat-tu-xa'
  },
  { 
    id: 'svc005', 
    name: 'Tư Vấn & Triển Khai Chuyển Đổi Số', 
    description: 'Đánh giá toàn diện hiện trạng công nghệ và tư vấn lộ trình chuyển đổi số tối ưu, giúp doanh nghiệp của bạn tự động hóa quy trình, nâng cao năng lực cạnh tranh và phát triển bền vững.', 
    icon: 'fas fa-project-diagram', 
    imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1774&auto=format&fit=crop',
    slug: 'tu-van-chuyen-doi-so'
  },
  { 
    id: 'svc006', 
    name: 'Bảo Mật Hệ Thống & An Toàn Dữ Liệu', 
    description: 'Dịch vụ kiểm tra, đánh giá lỗ hổng và triển khai các giải pháp bảo mật tiên tiến. Phòng chống hiệu quả virus, mã độc, tấn công mạng, bảo vệ an toàn tuyệt đối cho dữ liệu quan trọng.', 
    icon: 'fas fa-shield-alt', 
    imageUrl: 'https://images.unsplash.com/photo-1558006511-aa7131a44e53?q=80&w=1770&auto=format&fit=crop',
    slug: 'bao-mat-he-thong-du-lieu'
  },
];

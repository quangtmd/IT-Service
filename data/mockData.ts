import { Product, Service, Article, Testimonial, PCComponent, Project, User, Order, AdminNotification, UserRole, StaffRole } from '../types';
import React from 'react'; 
import { ADMIN_EMAIL } from '../constants';

export const MOCK_PRODUCTS: Product[] = [
  // Máy tính để bàn (PC)
  { id: 'pc001', name: 'PC Văn Phòng Tiêu Chuẩn VP01', mainCategory: "Máy tính để bàn (PC)", subCategory: "Máy tính văn phòng", category: "Máy tính văn phòng", price: 8500000, imageUrls: [`https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=600&auto=format&fit=crop`, `https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?q=80&w=600&auto=format&fit=crop`], description: 'PC tối ưu cho công việc văn phòng, học tập trực tuyến.', specifications: { CPU: 'Intel Core i3-12100', RAM: '8GB DDR4', SSD: '256GB NVMe', OS: 'Windows 11 Home (Bản quyền)' }, stock: 10, status: 'Mới', brand: 'IQ Lắp Ráp', tags: ['pc văn phòng', 'học tập'] },
  { id: 'pc002', name: 'PC Gaming Cao Cấp - RTX 4070', mainCategory: "Máy tính để bàn (PC)", subCategory: "Máy tính Gaming", category: "Máy tính Gaming", price: 38000000, originalPrice: 40000000, imageUrls: [`https://images.unsplash.com/photo-1598287329520-4c2a589fe424?q=80&w=600&auto=format&fit=crop`, `https://images.unsplash.com/photo-1627914652292-b364b3a65a4a?q=80&w=600&auto=format&fit=crop`], description: 'Chiến mọi game AAA max setting với RTX 4070.', specifications: { CPU: 'Intel Core i7-13700K', RAM: '32GB DDR5 RGB', SSD: '1TB Gen4 NVMe', VGA: 'NVIDIA GeForce RTX 4070 12GB' }, stock: 5, status: 'Mới', brand: 'IQ Gaming Series', tags: ['pc gaming', 'rtx 4070', 'cao cấp', 'Bán chạy'] },
  { id: 'pc003', name: 'Workstation Chuyên Nghiệp CAD/Render W03', mainCategory: "Máy tính để bàn (PC)", subCategory: "Workstation (Máy trạm)", category: "Workstation (Máy trạm)", price: 55000000, imageUrls: [`https://images.unsplash.com/photo-1614304412242-2b635520371d?q=80&w=600&auto=format&fit=crop`], description: 'Máy trạm chuyên dụng cho đồ họa 3D, render video.', specifications: { CPU: 'AMD Ryzen Threadripper 3960X', RAM: '64GB DDR4 ECC', SSD: '2TB NVMe PCIe 4.0', VGA: 'NVIDIA Quadro RTX A4000 16GB' }, stock: 3, status: 'Mới', brand: 'IQ ProStation', tags: ['workstation', 'đồ họa', 'render'] },
  { id: 'pc004', name: 'Apple iMac 27-inch 5K (2020)', mainCategory: "Máy tính để bàn (PC)", subCategory: "Máy tính All-in-One", category: "Máy tính All-in-One", price: 42000000, imageUrls: [`https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?q=80&w=600&auto=format&fit=crop`, `https://images.unsplash.com/photo-1517059224841-4272e2511e3e?q=80&w=600&auto=format&fit=crop`], description: 'Thiết kế tinh tế, màn hình 5K tuyệt đẹp.', specifications: { CPU: 'Intel Core i7 thế hệ 10', RAM: '16GB DDR4', SSD: '512GB', 'Màn hình': '27-inch 5K Retina' }, stock: 7, status: 'Mới', brand: 'Apple', tags: ['imac', 'apple', '5k', 'all-in-one'] },
  { id: 'pc005', name: 'Intel NUC 11 Pro Kit', mainCategory: "Máy tính để bàn (PC)", subCategory: "Mini PC / NUC", category: "Mini PC / NUC", price: 12000000, imageUrls: [`https://images.unsplash.com/photo-1618321510392-3c36ae242a86?q=80&w=600&auto=format&fit=crop`], description: 'Mini PC mạnh mẽ, nhỏ gọn, tiết kiệm không gian.', specifications: { CPU: 'Intel Core i5-1135G7', RAM: 'Barebone (chưa gồm RAM)', SSD: 'Barebone (chưa gồm SSD)' }, stock: 15, status: 'Mới', brand: 'Intel', tags: ['mini pc', 'nuc', 'intel'] },
  { id: 'pc006', name: 'Dell OptiPlex 7090 SFF', mainCategory: "Máy tính để bàn (PC)", subCategory: "Máy đồng bộ", category: "Máy đồng bộ", price: 18500000, imageUrls: [`https://i.dell.com/is/image/DellContent//content/dam/ss2/product-images/dell-client-products/desktops/optiplex-desktops/optiplex-7090/media-gallery/optiplex-7090-sff-gallery-1.psd?fmt=pjpg&pscan=auto&scl=1&hei=402&wid=335&qlt=100,0&resMode=sharp2&size=335,402`], description: 'Máy tính đồng bộ Dell bền bỉ, hiệu năng ổn định cho doanh nghiệp.', specifications: { CPU: 'Intel Core i5-11500', RAM: '16GB DDR4', SSD: '512GB NVMe', OS: 'Windows 10 Pro (Bản quyền)' }, stock: 9, status: 'Mới', brand: 'Dell', tags: ['pc đồng bộ', 'dell', 'optiplex', 'doanh nghiệp'] },

  // Laptop
  { id: 'lap001', name: 'Laptop Văn Phòng Mỏng Nhẹ S14', mainCategory: "Laptop", subCategory: "Laptop văn phòng", category: "Laptop văn phòng", price: 16500000, imageUrls: [`https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?q=80&w=600&auto=format&fit=crop`, `https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=600&auto=format&fit=crop`], description: 'Laptop mỏng nhẹ, pin trâu cho công việc năng động.', specifications: { CPU: 'Intel Core i5-1235U', RAM: '16GB DDR4', SSD: '512GB NVMe', 'Màn hình': '14-inch FHD IPS' }, stock: 12, status: 'Mới', brand: 'IQ Book', tags: ['laptop văn phòng', 'mỏng nhẹ'] },
  { id: 'lap002', name: 'ASUS ROG Strix SCAR 17 (2023)', mainCategory: "Laptop", subCategory: "Laptop Gaming", category: "Laptop Gaming", price: 65000000, imageUrls: [`https://dlcdnwebimgs.asus.com/gain/3f82f995-1f49-4475-8299-ad2d431055e8/w1000/h732`, `https://dlcdnwebimgs.asus.com/gain/55355182-1054-4682-827C-12A56233261C/w1000/h732`], description: 'Laptop gaming đỉnh cao với RTX 4080 Mobile.', specifications: { CPU: 'Intel Core i9-13980HX', RAM: '32GB DDR5', SSD: '2TB PCIe 4.0 NVMe', VGA: 'NVIDIA GeForce RTX 4080 Laptop GPU', 'Màn hình': '17.3-inch QHD 240Hz' }, stock: 4, status: 'Mới', brand: 'ASUS', tags: ['laptop gaming', 'asus rog', 'rtx 4080', 'Bán chạy'] },
  { id: 'lap003', name: 'Dell XPS 15 (9530)', mainCategory: "Laptop", subCategory: "Laptop đồ họa – kỹ thuật", category: "Laptop đồ họa – kỹ thuật", price: 52000000, imageUrls: [`https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-15-9530/media-gallery/touch-platinum/notebook-xps-15-9530-t-platinum-gallery-1.psd?fmt=pjpg&pscan=auto&scl=1&hei=402&wid=652&qlt=100,0&resMode=sharp2&size=652,402`], description: 'Laptop đồ họa cao cấp, màn hình InfinityEdge tuyệt đẹp.', specifications: { CPU: 'Intel Core i7-13700H', RAM: '32GB DDR5', SSD: '1TB NVMe', VGA: 'NVIDIA GeForce RTX 4050 Laptop', 'Màn hình': '15.6-inch FHD+ IPS' }, stock: 6, status: 'Mới', brand: 'Dell', tags: ['laptop đồ họa', 'dell xps', 'kỹ thuật'] },
  { id: 'lap004', name: 'LG Gram 16 (2023)', mainCategory: "Laptop", subCategory: "Laptop mỏng nhẹ (Ultrabook)", category: "Laptop mỏng nhẹ (Ultrabook)", price: 35000000, imageUrls: [`https://www.lg.com/content/dam/channel/wcms/vn/images/may-tinh-xach-tay/16z90r-g-ah55a5_2023_display_1.jpg`], description: 'Siêu mỏng nhẹ, chỉ 1.19kg, pin cực lâu.', specifications: { CPU: 'Intel Core i7-1360P', RAM: '16GB LPDDR5', SSD: '1TB NVMe Gen4', 'Màn hình': '16-inch WQXGA IPS' }, stock: 8, status: 'Mới', brand: 'LG', tags: ['ultrabook', 'lg gram', 'siêu nhẹ'] },
  { id: 'lap005', name: 'Microsoft Surface Pro 9', mainCategory: "Laptop", subCategory: "Laptop cảm ứng / 2-in-1", category: "Laptop cảm ứng / 2-in-1", price: 32000000, imageUrls: [`https://images.unsplash.com/photo-1678822365913-2fcb1b36e37d?q=80&w=600&auto=format&fit=crop`], description: 'Laptop lai tablet linh hoạt, hỗ trợ bút cảm ứng.', specifications: { CPU: 'Intel Core i5-1235U', RAM: '8GB LPDDR5', SSD: '256GB', 'Màn hình': '13-inch PixelSense Flow' }, stock: 10, status: 'Mới', brand: 'Microsoft', tags: ['surface pro', '2-in-1', 'cảm ứng'] },
  { id: 'lap006', name: 'MacBook Air M2 (2022)', mainCategory: "Laptop", subCategory: "MacBook", category: "MacBook", price: 28500000, imageUrls: [`https://images.unsplash.com/photo-1662435641476-20299b80816e?q=80&w=600&auto=format&fit=crop`, `https://images.unsplash.com/photo-1658147285526-73d72b53526e?q=80&w=600&auto=format&fit=crop`], description: 'Hiệu năng ấn tượng với chip M2, thiết kế mới.', specifications: { CPU: 'Chip Apple M2', RAM: '8GB Bộ nhớ hợp nhất', SSD: '256GB', 'Màn hình': '13.6-inch Liquid Retina' }, stock: 9, status: 'Mới', brand: 'Apple', tags: ['macbook air', 'm2', 'apple'] },
  { id: 'lap007', name: 'Laptop Acer Aspire 3 (Cũ)', mainCategory: "Laptop", subCategory: "Laptop cũ", category: "Laptop cũ", price: 7500000, imageUrls: [`https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=600&auto=format&fit=crop`], description: 'Laptop cũ, đã qua kiểm tra, giá tốt cho học sinh.', specifications: { CPU: 'Intel Core i3 Thế hệ 10', RAM: '8GB DDR4', SSD: '256GB', 'Màn hình': '15.6-inch HD' }, stock: 5, status: 'Cũ', brand: 'Acer', tags: ['laptop cũ', 'acer aspire', 'giá rẻ'] },

  // Linh kiện máy tính
  { id: 'lk001', name: 'CPU Intel Core i9-13900K', mainCategory: "Linh kiện máy tính", subCategory: "CPU (Vi xử lý Intel, AMD)", category: 'CPU', price: 15000000, originalPrice: 16500000, imageUrls: [`https://images.unsplash.com/photo-1628269994266-613d9a1de885?q=80&w=600&auto=format&fit=crop`, `https://images.unsplash.com/photo-1630526723534-754f2c79f9ae?q=80&w=600&auto=format&fit=crop`], description: 'CPU hàng đầu cho gaming và sáng tạo.', specifications: { 'Số nhân': '24', 'Số luồng': '32', 'Xung nhịp cơ bản': '3.0GHz' }, stock: 10, status: 'Mới', brand: 'Intel', tags: ['cpu', 'intel i9', 'gaming', 'Bán chạy'] },
  { id: 'lk002', name: 'RAM desktop Kingston Fury Beast 16GB (1 x 16GB) DDR4 3200MHz (KF432C16BB/16)', mainCategory: "Linh kiện máy tính", subCategory: "RAM (DDR4, DDR5…)", category: 'RAM', price: 990000, imageUrls: [`https://media.kingston.com/kingston/product/ktc-product-beast-ddr4-rgb-2-zm-lg.jpg`], description: 'RAM Kingston Fury Beast DDR4 hiệu năng cao, tản nhiệt nhôm, tối ưu cho game thủ và người dùng chuyên nghiệp.', specifications: { 'Dung lượng': '16GB (1x16GB)', 'Loại': 'DDR4', 'Tốc độ': '3200MHz' }, stock: 15, status: 'Mới', brand: 'Kingston', tags: ['ram', 'kingston', 'fury beast', 'ddr4'] },
  { id: 'lk003', name: 'SSD Samsung 980 Pro 1TB NVMe PCIe 4.0', mainCategory: "Linh kiện máy tính", subCategory: "Ổ cứng HDD / SSD (SATA, NVMe)", category: 'SSD', price: 3800000, imageUrls: [`https://images.unsplash.com/photo-1592218738031-c0a76a0a0121?q=80&w=600&auto=format&fit=crop`], description: 'SSD NVMe tốc độ cực nhanh.', specifications: { 'Dung lượng': '1TB', 'Giao tiếp': 'NVMe PCIe 4.0', 'Tốc độ đọc': '7000MB/s' }, stock: 20, status: 'Mới', brand: 'Samsung', tags: ['ssd', 'samsung', 'nvme'] },
  { id: 'lk004', name: 'VGA NVIDIA GeForce RTX 4080 16GB', mainCategory: "Linh kiện máy tính", subCategory: "VGA (Card màn hình)", category: 'VGA', price: 32000000, imageUrls: [`https://images.unsplash.com/photo-1653034339845-748bd0133a4c?q=80&w=600&auto=format&fit=crop`, `https://images.unsplash.com/photo-1683512967277-414436585149?q=80&w=600&auto=format&fit=crop`], description: 'Card đồ họa mạnh mẽ cho 4K gaming.', specifications: { 'Bộ nhớ': '16GB GDDR6X', 'Xung nhịp Boost': '2.5GHz' }, stock: 5, status: 'Mới', brand: 'NVIDIA', tags: ['vga', 'rtx 4080', 'nvidia'] },
  { id: 'lk005', name: 'Mainboard ASUS ROG Strix Z790-E Gaming WiFi', mainCategory: "Linh kiện máy tính", subCategory: "Bo mạch chủ (Mainboard)", category: 'Mainboard', price: 12500000, imageUrls: [`https://dlcdnwebimgs.asus.com/gain/423f8541-4712-4752-9257-230a1301b8a5/w800`], description: 'Mainboard cao cấp cho Intel Gen 13.', specifications: { Chipset: 'Z790', Socket: 'LGA1700', 'Kích thước': 'ATX' }, stock: 8, status: 'Mới', brand: 'ASUS', tags: ['mainboard', 'asus rog', 'z790'] },
  { id: 'lk006', name: 'PSU Corsair RM850x 850W 80+ Gold', mainCategory: "Linh kiện máy tính", subCategory: "Nguồn máy tính (PSU)", category: 'PSU', price: 3200000, imageUrls: [`https://www.corsair.com/medias/sys_master/images/images/h67/h87/9110784999454/-CP-9020180-NA-Gallery-RM850x-01.png`], description: 'Nguồn công suất thực, ổn định.', specifications: { 'Công suất': '850W', 'Hiệu suất': '80+ Gold', 'Modular': 'Hoàn toàn' }, stock: 12, status: 'Mới', brand: 'Corsair', tags: ['psu', 'corsair', '850w'] },
  { id: 'lk007', name: 'Vỏ case NZXT H510 Flow', mainCategory: "Linh kiện máy tính", subCategory: "Vỏ máy (Case)", category: 'Vỏ case', price: 2100000, imageUrls: [`https://nzxt.com/assets/cms/34299/1628102377-h510-flow-white-black-main.png?auto=format&dpr=2&fit=max&fm=webp&h=400&w=400`], description: 'Case tản nhiệt tốt, thiết kế đẹp.', specifications: { 'Loại': 'Mid Tower', 'Chất liệu': 'Thép, Kính cường lực' }, stock: 18, status: 'Mới', brand: 'NZXT', tags: ['case', 'nzxt', 'h510 flow'] },
  { id: 'lk008', name: 'Tản nhiệt Noctua NH-D15', mainCategory: "Linh kiện máy tính", subCategory: "Tản nhiệt (Khí, Nước)", category: 'Tản nhiệt', price: 2800000, imageUrls: [`https://noctua.at/media/catalog/product/cache/id/1/image/9df78eab33525d08d6e5fb8d27136e95/n/o/noctua_nh_d15_1.jpg`], description: 'Tản nhiệt khí hiệu năng đỉnh cao.', specifications: { 'Loại': 'Tản nhiệt khí', 'Quạt': '2 x 140mm' }, stock: 11, status: 'Mới', brand: 'Noctua', tags: ['tản nhiệt', 'noctua', 'nh-d15'] },
  
  // Thiết bị ngoại vi
  { id: 'tnv001', name: 'Màn hình LG UltraGear 27GP850-B 27" QHD Nano IPS 165Hz', mainCategory: "Thiết bị ngoại vi", subCategory: "Màn hình (LCD, LED, 2K, 4K, Gaming…)", category: 'Màn hình', price: 9800000, imageUrls: [`https://images.unsplash.com/photo-1551645124-3a8a3a0c5b4d?q=80&w=600&auto=format&fit=crop`, `https://images.unsplash.com/photo-1621262620993-c8a773d722d9?q=80&w=600&auto=format&fit=crop`], description: 'Màn hình gaming QHD tuyệt vời.', specifications: { 'Kích thước': '27 inch', 'Độ phân giải': '2560x1440', 'Tần số quét': '165Hz', 'Tấm nền': 'Nano IPS' }, stock: 7, status: 'Mới', brand: 'LG', tags: ['màn hình', 'lg ultragear', 'gaming', '165hz'] },
  { id: 'tnv002', name: 'Bàn phím cơ Keychron K2 Pro', mainCategory: "Thiết bị ngoại vi", subCategory: "Bàn phím (Cơ, Giả cơ, Thường)", category: 'Bàn phím', price: 3500000, imageUrls: [`https://images.unsplash.com/photo-1618384887924-2f80c3453b50?q=80&w=600&auto=format&fit=crop`], description: 'Bàn phím cơ không dây, layout 75%, QMK/VIA.', specifications: { Layout: '75%', Switch: 'Gateron Brown (Có thể thay nóng)', 'Kết nối': 'Bluetooth/USB-C' }, stock: 20, status: 'Mới', brand: 'Keychron', tags: ['bàn phím cơ', 'keychron', 'k2 pro'] },
  { id: 'tnv003', name: 'Chuột Logitech G Pro X Superlight', mainCategory: "Thiết bị ngoại vi", subCategory: "Chuột (Gaming, Văn phòng)", category: 'Chuột', price: 2900000, imageUrls: [`https://images.unsplash.com/photo-1615663249893-e4c431de3e1f?q=80&w=600&auto=format&fit=crop`], description: 'Chuột gaming không dây siêu nhẹ.', specifications: { 'Trọng lượng': '<63g', 'Cảm biến': 'HERO 25K', DPI: '25600' }, stock: 15, status: 'Mới', brand: 'Logitech', tags: ['chuột gaming', 'logitech', 'superlight'] },
  { id: 'tnv004', name: 'Tai nghe Sony WH-1000XM5', mainCategory: "Thiết bị ngoại vi", subCategory: "Tai nghe (Có dây, Không dây)", category: 'Tai nghe', price: 7500000, imageUrls: [`https://images.unsplash.com/photo-1653021463134-2e457a412c96?q=80&w=600&auto=format&fit=crop`], description: 'Tai nghe chống ồn chủ động hàng đầu.', specifications: { 'Kiểu': 'Chụp tai, Không dây', 'Chống ồn': 'Đầu ngành' }, stock: 13, status: 'Mới', brand: 'Sony', tags: ['tai nghe', 'sony', 'wh-1000xm5', 'chống ồn'] },

  // Camera giám sát
  { id: 'cam001', name: 'Camera IP WiFi EZVIZ C6N 1080P', mainCategory: "Camera giám sát", subCategory: "Camera IP (WiFi / LAN)", category: 'Camera IP', price: 950000, imageUrls: [`https://images.unsplash.com/photo-1617394884784-5111b138c21a?q=80&w=600&auto=format&fit=crop`], description: 'Camera IP WiFi xoay 360 độ, đàm thoại 2 chiều.', specifications: { 'Độ phân giải': '1080P', 'Kết nối': 'WiFi', 'Tính năng': 'Xoay ngang/dọc, Âm thanh 2 chiều, Hồng ngoại ban đêm' }, stock: 30, status: 'Mới', brand: 'EZVIZ', tags: ['camera ip', 'ezviz', 'c6n', 'wifi'] },
  { id: 'cam002', name: 'Đầu ghi hình Hikvision DS-7208HQHI-K1 8 kênh', mainCategory: "Camera giám sát", subCategory: "Đầu ghi hình (DVR, NVR)", category: 'Đầu ghi hình', price: 2200000, imageUrls: [`https://images.unsplash.com/photo-1607825390033-55923c10a377?q=80&w=600&auto=format&fit=crop`], description: 'Đầu ghi hình 8 kênh hỗ trợ camera HD-TVI/AHD/CVI/CVBS/IP.', specifications: { 'Số kênh': '8', 'Công nghệ hỗ trợ': 'HD-TVI/AHD/CVI/CVBS/IP', 'Chuẩn nén': 'H.265+' }, stock: 10, status: 'Mới', brand: 'Hikvision', tags: ['đầu ghi hình', 'hikvision', 'dvr'] },

  // Thiết bị mạng
  { id: 'net001', name: 'Router WiFi TP-Link Archer AX73 AX5400', mainCategory: "Thiết bị mạng", subCategory: "Router WiFi (TP-Link, Asus, UniFi…)", category: 'Router WiFi', price: 3200000, imageUrls: [`https://images.unsplash.com/photo-1622538183049-d7c711204094?q=80&w=600&auto=format&fit=crop`], description: 'Router WiFi 6 tốc độ cao, vùng phủ rộng.', specifications: { 'Chuẩn': 'WiFi 6 (802.11ax)', 'Tốc độ': 'AX5400 (4804Mbps trên 5GHz, 574Mbps trên 2.4GHz)', 'Tính năng': 'OFDMA, MU-MIMO, HomeShield' }, stock: 18, status: 'Mới', brand: 'TP-Link', tags: ['router wifi', 'tp-link', 'wifi 6'] },
  { id: 'net002', name: 'Switch TP-Link TL-SG1008P 8 Cổng Gigabit PoE', mainCategory: "Thiết bị mạng", subCategory: "Switch mạng (PoE, Thường)", category: 'Switch mạng', price: 1500000, imageUrls: [`https://images.unsplash.com/photo-1603952994993-f542a1597a8a?q=80&w=600&auto=format&fit=crop`], description: 'Switch 8 cổng Gigabit với 4 cổng PoE+.', specifications: { 'Số cổng': '8 Gigabit Ethernet', 'Cổng PoE': '4 PoE+ (802.3af/at)', 'Công suất PoE': '64W' }, stock: 14, status: 'Mới', brand: 'TP-Link', tags: ['switch mạng', 'tp-link', 'poe'] },
  
  // Phần mềm & dịch vụ
  { id: 'soft001', name: 'Gói Cài Đặt Windows & Office Tận Nơi', mainCategory: "Phần mềm & dịch vụ", subCategory: "Dịch vụ cài đặt (Tận nơi / Online)", category: 'Dịch vụ cài đặt', price: 300000, imageUrls: [`https://images.unsplash.com/photo-1593431098226-5125bff35a26?q=80&w=600&auto=format&fit=crop`], description: 'Dịch vụ cài đặt hệ điều hành Windows và bộ Office bản quyền (chưa bao gồm key) tại nhà.', specifications: { 'Phạm vi': 'Cài đặt Windows, Bộ Office, Driver cơ bản', 'Địa điểm': 'Tận nơi (Đà Nẵng)' }, stock: 99, status: 'Mới', brand: 'IQ Services', tags: ['dịch vụ cài đặt', 'windows', 'office'] },
  { id: 'soft002', name: 'Bản quyền Windows 11 Pro OEM', mainCategory: "Phần mềm & dịch vụ", subCategory: "Bản quyền Windows, Office", category: 'Bản quyền phần mềm', price: 2800000, imageUrls: [`https://images.unsplash.com/photo-1633537270384-2ea161e1b9b1?q=80&w=600&auto=format&fit=crop`], description: 'Key bản quyền Windows 11 Pro dạng OEM.', specifications: { 'Phiên bản': 'Windows 11 Pro', 'Loại': 'OEM' }, stock: 50, status: 'Mới', brand: 'Microsoft', tags: ['windows 11 pro', 'bản quyền', 'oem'] },

  // Phụ kiện & thiết bị khác
  { id: 'acc001', name: 'Hub USB-C Anker 7-trong-1', mainCategory: "Phụ kiện & thiết bị khác", subCategory: "Cáp chuyển, Hub USB, Docking", category: 'Hub USB', price: 1200000, imageUrls: [`https://images.unsplash.com/photo-1589433435894-3a72a15fe451?q=80&w=600&auto=format&fit=crop`], description: 'Hub USB-C đa năng: HDMI 4K, USB 3.0, PD, đọc thẻ SD.', specifications: { 'Cổng': 'HDMI, 2xUSB-A 3.0, USB-C PD, SD, microSD', 'Chất liệu': 'Nhôm' }, stock: 25, status: 'Mới', brand: 'Anker', tags: ['hub usb-c', 'anker', 'phụ kiện'] },
  { id: 'acc002', name: 'Balo Laptop Chống Sốc Tomtoc A13', mainCategory: "Phụ kiện & thiết bị khác", subCategory: "Balo, Túi chống sốc", category: 'Balo Laptop', price: 990000, imageUrls: [`https://images.unsplash.com/photo-1553062407-98eeb68a6225?q=80&w=600&auto=format&fit=crop`], description: 'Balo laptop 15.6 inch, chống sốc tốt, nhiều ngăn.', specifications: { 'Kích thước': '15.6 inch', 'Chất liệu': 'Polyester', 'Tính năng': 'Chống sốc CornerArmor, chống nước' }, stock: 22, status: 'Mới', brand: 'Tomtoc', tags: ['balo laptop', 'tomtoc', 'chống sốc'] },
];

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


export const MOCK_ARTICLES: Article[] = [
  { id: '1', title: 'Mẹo Chọn Linh Kiện PC Phù Hợp Ngân Sách 2024', summary: 'Hướng dẫn chi tiết cách lựa chọn CPU, VGA, RAM... tối ưu cho túi tiền của bạn trong năm nay.', imageUrl: `https://images.unsplash.com/photo-1603481588273-2f9ac1a20a43?q=80&w=400&auto=format&fit=crop`, author: 'Chuyên gia Tech', date: '2024-07-25', category: 'Mẹo vặt', content: 'Nội dung chi tiết bài viết 1... Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'},
  { id: '2', title: 'Hướng Dẫn Sửa Lỗi "Màn Hình Xanh Chết Chóc" (BSOD)', summary: 'Các bước cơ bản để tự chẩn đoán và khắc phục lỗi BSOD thường gặp trên Windows 10 và 11.', imageUrl: `https://images.unsplash.com/photo-1596205252494-0571473187a5?q=80&w=400&auto=format&fit=crop`, author: 'Kỹ thuật viên An', date: '2024-07-20', category: 'Hướng dẫn', content: 'Nội dung chi tiết bài viết 2... Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'},
  { id: '3', title: 'So Sánh Cấu Hình PC: Gaming vs. Học Tập vs. Văn Phòng', summary: 'Phân tích sự khác biệt và gợi ý cấu hình tối ưu cho từng nhu cầu sử dụng cụ thể.', imageUrl: `https://images.unsplash.com/photo-1555618423-6b71a7a0178a?q=80&w=400&auto=format&fit=crop`, author: 'Reviewer Dũng', date: '2024-07-15', category: 'So sánh', content: 'Nội dung chi tiết bài viết 3... Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'},
  { id: '4', title: 'Chương Trình Khuyến Mãi Tháng 8: Back to School!', summary: 'Tổng hợp các ưu đãi hấp dẫn cho laptop, PC và phụ kiện mùa tựu trường.', imageUrl: `https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?q=80&w=400&auto=format&fit=crop`, author: 'Đội Marketing', date: '2024-08-01', category: 'Khuyến mãi', content: 'Nội dung chi tiết bài viết 4... Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'},
  { id: '5', title: 'Tại Sao Cần Vệ Sinh Laptop Định Kỳ?', summary: 'Tìm hiểu lợi ích của việc vệ sinh laptop và hướng dẫn tự thực hiện tại nhà an toàn.', imageUrl: `https://images.unsplash.com/photo-1605910469951-8a62cedf824e?q=80&w=400&auto=format&fit=crop`, author: 'Kỹ thuật viên Minh', date: '2024-07-10', category: 'Mẹo vặt', content: 'Vệ sinh laptop định kỳ giúp máy hoạt động mát mẻ, ổn định và kéo dài tuổi thọ...'},
  { id: '6', title: 'Top 5 Phần Mềm Diệt Virus Tốt Nhất 2024', summary: 'Đánh giá và so sánh các phần mềm diệt virus hàng đầu hiện nay cho máy tính của bạn.', imageUrl: `https://images.unsplash.com/photo-1562907450-446813b567a5?q=80&w=400&auto=format&fit=crop`, author: 'Chuyên gia Bảo mật', date: '2024-07-05', category: 'Đánh giá sản phẩm', content: 'Bảo vệ máy tính khỏi virus và mã độc là vô cùng quan trọng. Dưới đây là top 5 phần mềm...'},
  { 
    id: 'it001', 
    title: 'Giải Pháp Sao Lưu Dữ Liệu An Toàn Cho Doanh Nghiệp Nhỏ', 
    summary: 'Tầm quan trọng của backup dữ liệu và các giải pháp NAS, Cloud Backup phù hợp.', 
    imageUrl: `https://images.unsplash.com/photo-1573495782740-62c1f8223c32?q=80&w=400&auto=format&fit=crop`, 
    author: 'Chuyên gia Giải Pháp IT', 
    date: '2024-07-28', 
    category: 'Dịch vụ IT', 
    content: 'Dữ liệu là tài sản quý giá của doanh nghiệp. Mất mát dữ liệu có thể gây ra những thiệt hại không lường trước được. Chúng tôi cung cấp các giải pháp sao lưu toàn diện...'
  },
  { 
    id: 'it002', 
    title: 'Khắc Phục Sự Cố Mạng Wi-Fi Chậm Chờn Tại Nhà', 
    summary: 'Các bước kiểm tra và xử lý khi mạng Wi-Fi nhà bạn gặp vấn đề về tốc độ và ổn định.', 
    imageUrl: `https://images.unsplash.com/photo-1528312635036-b18503622417?q=80&w=400&auto=format&fit=crop`, 
    author: 'Kỹ thuật viên Mạng', 
    date: '2024-07-22', 
    category: 'Dịch vụ IT', 
    content: 'Mạng Wi-Fi chậm có thể do nhiều nguyên nhân từ router, modem, đến nhiễu sóng. Bài viết này sẽ hướng dẫn bạn cách tự kiểm tra và khắc phục...'
  },
  { 
    id: 'it003', 
    title: 'Tư Vấn Lắp Đặt Hệ Thống Camera An Ninh Gia Đình', 
    summary: 'Lựa chọn loại camera, vị trí lắp đặt và cấu hình hệ thống giám sát hiệu quả.', 
    imageUrl: `https://images.unsplash.com/photo-1588265609353-c558b45a4993?q=80&w=400&auto=format&fit=crop`, 
    author: 'Chuyên gia An Ninh', 
    date: '2024-07-18', 
    category: 'Dịch vụ IT', 
    content: 'An ninh cho ngôi nhà là ưu tiên hàng đầu. Một hệ thống camera giám sát tốt sẽ giúp bạn yên tâm hơn. Chúng tôi tư vấn từ A-Z...'
  },
  { 
    id: 'it004', 
    title: 'Dịch Vụ Bảo Trì Máy Tính Định Kỳ Cho Văn Phòng', 
    summary: 'Tại sao doanh nghiệp cần bảo trì máy tính định kỳ và lợi ích của gói dịch vụ này.', 
    imageUrl: `https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=400&auto=format&fit=crop`, 
    author: 'Dịch vụ IQ Technology', 
    date: '2024-07-12', 
    category: 'Dịch vụ IT', 
    content: 'Đảm bảo hệ thống máy tính văn phòng hoạt động trơn tru, giảm thiểu sự cố và tăng hiệu suất làm việc với dịch vụ bảo trì chuyên nghiệp của chúng tôi...'
  },
  {
    id: 'it005',
    title: 'Doanh Nghiệp Thăng Hoa: 6 Lợi Ích Vàng Khi Sử Dụng Dịch Vụ IT Chuyên Nghiệp',
    summary: 'Khám phá cách dịch vụ IT chuyên nghiệp giúp doanh nghiệp tối ưu chi phí, tăng cường bảo mật, nâng cao hiệu suất và tập trung vào mục tiêu cốt lõi để phát triển bền vững.',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=400&auto=format&fit=crop',
    author: 'Chuyên gia IQ Technology',
    date: '2024-08-05',
    category: 'Dịch vụ IT',
    content: `
Trong kỷ nguyên số hóa mạnh mẽ, công nghệ thông tin (IT) không còn là yếu tố phụ trợ mà đã trở thành xương sống của mọi doanh nghiệp, dù lớn hay nhỏ. Tuy nhiên, việc tự vận hành một đội ngũ IT nội bộ hiệu quả có thể tốn kém và phức tạp. Đây là lúc dịch vụ IT chuyên nghiệp từ các đối tác bên ngoài phát huy vai trò. Dưới đây là 6 lợi ích vượt trội mà doanh nghiệp bạn có thể nhận được:

### 1. Tối Ưu Chi Phí Vận Hành & Nhân Sự
Thay vì phải đầu tư vào việc tuyển dụng, đào tạo và duy trì một đội ngũ IT toàn thời gian với đầy đủ các chuyên môn (mạng, phần cứng, phần mềm, bảo mật), doanh nghiệp có thể sử dụng dịch vụ IT thuê ngoài với chi phí linh hoạt và thường thấp hơn đáng kể. Bạn chỉ trả tiền cho những gì bạn thực sự cần.

### 2. Bảo Mật Toàn Diện, An Tâm Dữ Liệu
Các nhà cung cấp dịch vụ IT chuyên nghiệp luôn cập nhật những giải pháp và công nghệ bảo mật mới nhất. Họ có chuyên môn sâu để xây dựng các lớp phòng thủ vững chắc, giám sát hệ thống 24/7, phát hiện và ngăn chặn các mối đe dọa tiềm ẩn, đảm bảo an toàn cho dữ liệu kinh doanh quý giá của bạn.

### 3. Nâng Cao Hiệu Suất, Tự Động Hóa Quy Trình
Dịch vụ IT có thể giúp doanh nghiệp bạn đánh giá và triển khai các giải pháp công nghệ phù hợp để tối ưu hóa quy trình làm việc, tự động hóa các tác vụ lặp đi lặp lại. Điều này không chỉ giúp tiết kiệm thời gian, nhân lực mà còn nâng cao đáng kể năng suất và hiệu quả hoạt động chung.

### 4. Hỗ Trợ Kỹ Thuật Chuyên Nghiệp, Khắc Phục Sự Cố Nhanh Chóng
Khi có sự cố xảy ra, việc hệ thống bị đình trệ có thể gây thiệt hại lớn. Với đội ngũ kỹ thuật viên chuyên nghiệp và giàu kinh nghiệm, các nhà cung cấp dịch vụ IT đảm bảo thời gian phản hồi nhanh, khắc phục sự cố hiệu quả, giảm thiểu tối đa thời gian chết (downtime) của hệ thống.

### 5. Tập Trung Vào Giá Trị Cốt Lõi Của Doanh Nghiệp
Khi các vấn đề IT đã được một đối tác tin cậy đảm nhận, ban lãnh đạo và nhân viên có thể hoàn toàn tập trung vào các hoạt động kinh doanh cốt lõi, phát triển sản phẩm, chăm sóc khách hàng và thực hiện các mục tiêu chiến lược của công ty.

### 6. Tiếp Cận Công Nghệ Mới Và Chuyên Môn Cao
Thế giới công nghệ thay đổi không ngừng. Các nhà cung cấp dịch vụ IT luôn đi đầu trong việc nghiên cứu và ứng dụng công nghệ mới. Hợp tác với họ đồng nghĩa với việc doanh nghiệp bạn sẽ được tư vấn và tiếp cận những giải pháp tiên tiến nhất, phù hợp với xu hướng phát triển.

Hình ảnh minh họa IT Services:

![Ảnh minh họa IT Services](https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=800&auto=format&fit=crop)

**Kết luận:** Đầu tư vào dịch vụ IT chuyên nghiệp không chỉ là một khoản chi phí mà là một khoản đầu tư chiến lược, mang lại lợi thế cạnh tranh và nền tảng vững chắc cho sự phát triển bền vững của doanh nghiệp trong thời đại số.
    `
  }
];

export const MOCK_TESTIMONIALS: Testimonial[] = [
  { id: '1', name: 'Nguyễn Văn An', quote: 'Dịch vụ sửa chữa PC rất nhanh chóng và chuyên nghiệp. Máy tôi giờ chạy êm ru. Cảm ơn IQ Technology!', avatarUrl: `https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=100&auto=format&fit=crop`, role: 'Khách hàng Cá nhân' },
  { id: '2', name: 'Trần Thị Bích Hợp', quote: 'Được tư vấn cấu hình PC Gaming rất ưng ý, giá cả cũng hợp lý. Các bạn kỹ thuật viên nhiệt tình.', avatarUrl: `https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop`, role: 'Game thủ' },
  { id: '3', name: 'Công ty TNHH ABC', quote: 'IQ Technology đã hỗ trợ chúng tôi bảo trì toàn bộ hệ thống máy tính văn phòng. Rất hài lòng về chất lượng và thái độ phục vụ.', avatarUrl: `https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=100&auto=format&fit=crop`, role: 'Khách hàng Doanh nghiệp' },
];


export const MOCK_PC_COMPONENTS: Record<string, PCComponent[]> = {
  CPU: [
    { type: 'CPU', name: 'Intel Core i5-13600K', price: 8000000, details: '14 Nhân, 20 Luồng' },
    { type: 'CPU', name: 'AMD Ryzen 5 7600X', price: 7500000, details: '6 Nhân, 12 Luồng' },
    { type: 'CPU', name: 'Intel Core i9-13900K', price: 15000000, details: '24 Nhân, 32 Luồng' },
  ],
  'Bo mạch chủ': [
    { type: 'Motherboard', name: 'ASUS B760M-PLUS WIFI D4', price: 4500000, details: 'DDR4, LGA1700' },
    { type: 'Motherboard', name: 'Gigabyte B650 AORUS ELITE AX', price: 6000000, details: 'DDR5, AM5' },
    { type: 'Motherboard', name: 'MSI Z790 TOMAHAWK WIFI', price: 8000000, details: 'DDR5, LGA1700' },
  ],
  RAM: [
    { type: 'RAM', name: 'Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz', price: 1500000, details: '16GB DDR4' },
    { type: 'RAM', name: 'Kingston Fury Beast 32GB (2x16GB) DDR5 5600MHz', price: 3500000, details: '32GB DDR5' },
  ],
  'Card màn hình': [
    { type: 'GPU', name: 'NVIDIA GeForce RTX 3060 12GB', price: 9000000, details: '12GB GDDR6' },
    { type: 'GPU', name: 'AMD Radeon RX 6700 XT 12GB', price: 10000000, details: '12GB GDDR6' },
    { type: 'GPU', name: 'NVIDIA GeForce RTX 4070 Ti 12GB', price: 22000000, details: '12GB GDDR6X' },
  ],
  'Ổ cứng': [
    { type: 'SSD', name: 'Samsung 970 EVO Plus 1TB NVMe M.2', price: 2500000, details: '1TB NVMe Gen3' },
    { type: 'SSD', name: 'Western Digital SN850X 2TB NVMe M.2', price: 5000000, details: '2TB NVMe Gen4' },
    { type: 'HDD', name: 'Seagate Barracuda 2TB 7200RPM SATA', price: 1500000, details: '2TB HDD SATA' },
  ],
  'Nguồn máy tính': [
    { type: 'PSU', name: 'Cooler Master MWE Bronze V2 650W', price: 1500000, details: '650W 80+ Bronze' },
    { type: 'PSU', name: 'Corsair RM750e 750W 80+ Gold', price: 2800000, details: '750W 80+ Gold' },
  ],
  'Vỏ case': [
    { type: 'Case', name: 'Corsair 4000D Airflow', price: 2000000, details: 'Mid-Tower ATX' },
    { type: 'Case', name: 'NZXT H5 Flow', price: 2200000, details: 'Mid-Tower ATX' },
  ],
};

export const MOCK_PROJECTS: Project[] = [
    {
        id: 'proj001',
        title: 'Triển Khai Hệ Thống Mạng LAN & Wi-Fi Cho Văn Phòng Công Ty XYZ',
        client: 'Công Ty TNHH Giải Pháp XYZ',
        description: 'Tư vấn, thiết kế và thi công toàn bộ hệ thống mạng nội bộ cho văn phòng mới 200m2, bao gồm đi dây mạng CAT6, lắp đặt switch, router, access point UniFi, và cấu hình firewall bảo mật. Đảm bảo kết nối ổn định cho 50+ thiết bị.',
        imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=600&auto=format&fit=crop',
        technologiesUsed: ['Mạng UniFi', 'Cáp CAT6', 'Cấu hình Firewall', 'Phân đoạn VLAN'],
        completionDate: '15-05-2024',
        category: 'Hệ thống mạng doanh nghiệp'
    },
    {
        id: 'proj002',
        title: 'Lắp Đặt Hệ Thống Camera Giám Sát An Ninh Cho Biệt Thự Anh An',
        client: 'Anh Nguyễn Văn An',
        description: 'Lắp đặt trọn gói 8 camera IP Hikvision Full Color có màu ban đêm, đầu ghi hình NVR, ổ cứng chuyên dụng. Cấu hình xem qua mạng từ xa trên điện thoại, máy tính. Bảo hành 24 tháng.',
        imageUrl: 'https://images.unsplash.com/photo-1617394884784-5111b138c21a?q=80&w=600&auto=format&fit=crop',
        technologiesUsed: ['Camera IP Hikvision', 'Cài đặt NVR', 'Cấu hình Xem từ xa', 'Tích hợp NAS'],
        completionDate: '20-06-2024',
        category: 'Giải pháp Camera an ninh'
    },
    {
        id: 'proj003',
        title: 'Nâng Cấp Dàn PC Gaming & Streaming Cho Streamer "ProGamerVN"',
        client: 'Streamer ProGamerVN',
        description: 'Tư vấn và nâng cấp toàn bộ dàn PC cũ lên cấu hình mới nhất với Intel Core i9, RTX 4090, 64GB RAM DDR5, tản nhiệt nước custom. Tối ưu hóa cho việc chơi game AAA max settings và streaming chất lượng cao trên Twitch/YouTube.',
        imageUrl: 'https://images.unsplash.com/photo-1593152167428-9a22c79599a2?q=80&w=600&auto=format&fit=crop',
        technologiesUsed: ['Linh kiện PC Cao cấp', 'Tản nhiệt nước Custom', 'Cài đặt OBS', 'Tối ưu Hiệu năng'],
        completionDate: '10-07-2024',
        category: 'PC Build Cao Cấp'
    },
    {
        id: 'proj004',
        title: 'Xây Dựng Hệ Thống Lưu Trữ NAS Cho Studio Thiết Kế Đồ Họa',
        client: 'Pixel Perfect Studio',
        description: 'Cung cấp giải pháp lưu trữ tập trung NAS Synology, dung lượng 20TB. Cấu hình RAID, phân quyền người dùng, backup tự động cho các máy trạm thiết kế. Đảm bảo an toàn dữ liệu và truy cập nhanh chóng.',
        imageUrl: 'https://images.unsplash.com/photo-1626244243254-d3d6061352ca?q=80&w=600&auto=format&fit=crop',
        technologiesUsed: ['NAS Synology', 'Cấu hình RAID', 'Giải pháp Sao lưu Dữ liệu', 'Kiểm soát Truy cập Người dùng'],
        completionDate: '01-04-2024',
        category: 'Lưu trữ dữ liệu & Sao lưu'
    }
];

export const MOCK_STAFF_USERS: User[] = [
  { id: 'staff001', username: 'Nhân Viên Sales', email: 'sales01@iqtech.com', role: 'staff', staffRole: 'Quản lý Bán hàng', password: 'password123' },
  { id: 'staff002', username: 'Kỹ Thuật Viên', email: 'tech01@iqtech.com', role: 'staff', staffRole: 'Trưởng nhóm Kỹ thuật', password: 'password123' },
  { id: 'staff003', username: 'Biên Tập Viên', email: 'content01@iqtech.com', role: 'staff', staffRole: 'Biên tập Nội dung', password: 'password123' },
];


export const MOCK_ORDERS: Order[] = [
    {
        id: 'order001',
        customerInfo: {
            fullName: 'Nguyễn Văn A',
            phone: '0901234567',
            address: '123 Đường ABC, Quận XYZ, TP. Đà Nẵng',
            email: 'nguyenvana@example.com',
            notes: 'Giao hàng vào buổi chiều.'
        },
        items: [
            { productId: 'pc001', productName: 'PC Văn Phòng Tiêu Chuẩn VP01', quantity: 1, price: 8500000 },
            { productId: 'tnv002', productName: 'Bàn phím cơ Keychron K2 Pro', quantity: 1, price: 3500000 }
        ],
        totalAmount: 12000000,
        orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
        status: 'Đang giao',
        paymentInfo: { method: 'Thanh toán khi nhận hàng (COD)', status: 'Chưa thanh toán' }
    },
    {
        id: 'order002',
        customerInfo: {
            fullName: 'Trần Thị B',
            phone: '0987654321',
            address: '456 Đường DEF, Quận UVW, TP. Đà Nẵng',
            email: 'tranthib@example.com'
        },
        items: [
            { productId: 'lk001', productName: 'CPU Intel Core i9-13900K', quantity: 1, price: 15000000 },
        ],
        totalAmount: 15000000,
        orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), 
        status: 'Hoàn thành',
        paymentInfo: { method: 'Chuyển khoản ngân hàng', status: 'Đã thanh toán', transactionId: 'FT2407251234' }
    },
     {
        id: 'order003',
        customerInfo: {
            fullName: 'Lê Văn C',
            phone: '0912345678',
            address: '789 Đường GHI, Quận KLM, TP. Đà Nẵng',
            email: 'levanc@example.com',
            notes: 'Vui lòng gọi trước khi giao.'
        },
        items: [
            { productId: 'lap002', productName: 'ASUS ROG Strix SCAR 17 (2023)', quantity: 1, price: 65000000 },
        ],
        totalAmount: 65000000,
        orderDate: new Date().toISOString(),
        status: 'Chờ xử lý',
        paymentInfo: { method: 'Thanh toán khi nhận hàng (COD)', status: 'Chưa thanh toán' }
    }
];

export const MOCK_ADMIN_NOTIFICATIONS: AdminNotification[] = [
    {
        id: 'notif001',
        message: 'Đơn hàng #order003 vừa được tạo.',
        type: 'info',
        timestamp: new Date().toISOString(),
        isRead: false,
    },
    {
        id: 'notif002',
        message: 'Sản phẩm "CPU Intel Core i9-13900K" sắp hết hàng (còn 2).',
        type: 'warning',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        isRead: true,
    }
];
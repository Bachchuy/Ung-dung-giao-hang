Bạn là một senior full-stack engineer và startup MVP architect.

Hãy xây dựng cho tôi một MVP web app hoàn chỉnh cho startup logistics nội khu dành cho sinh viên.

# Ý tưởng sản phẩm

Một nền tảng giao nhận nội khu trong trường đại học/ký túc xá, nơi:

* sinh viên có thể đặt:

  * đồ ăn
  * thức uống
  * tài liệu photo
  * dịch vụ in PDF/tài liệu học tập
* sinh viên khác tiện đường sẽ nhận đơn và giao tận nơi.

Mục tiêu:

* giải quyết “last-meter delivery” trong campus
* giao tận lớp học/KTX
* chi phí rẻ hơn Grab/ShopeeFood
* tận dụng luồng di chuyển có sẵn của sinh viên.

# Yêu cầu công nghệ

Tech stack:

* Next.js 14 (App Router)
* TypeScript
* TailwindCSS
* Supabase
* Vercel deployment-ready

Yêu cầu:

* mobile-first
* UI hiện đại kiểu startup
* responsive
* clean architecture
* component-based
* dễ mở rộng sau này

# Chức năng MVP bắt buộc

## 1. Authentication

* Login Google
* Chỉ cho phép email sinh viên (đuôi .edu hoặc domain trường)

---

## 2. User Roles

* Customer (người đặt)
* Shipper
* Admin

---

## 3. Đặt đơn hàng

Cho phép tạo đơn:

* đồ ăn
* thức uống
* photo/in ấn

Fields:

* tên đơn
* mô tả
* vị trí giao
* số điện thoại
* ghi chú
* phí ship
* trạng thái đơn

---

## 4. Upload PDF để in

Người dùng có thể:

* upload file PDF
* chọn:

  * số lượng bản in
  * in màu / đen trắng
  * 1 mặt / 2 mặt

---

## 5. Order Feed

Trang hiển thị:

* danh sách đơn đang chờ
* shipper có thể nhận đơn
* realtime update

---

## 6. Trạng thái đơn

Các trạng thái:

* pending
* accepted
* delivering
* completed
* cancelled

---

## 7. Rating System

* rating 2 chiều
* customer đánh giá shipper
* shipper đánh giá customer

---

## 8. Gamification

* badge Top Shipper
* điểm uy tín
* số đơn hoàn thành

---

## 9. Telegram Bot Integration

Khi có đơn mới:

* tự động gửi message vào Telegram group.

---

## 10. Admin Dashboard

Admin có thể:

* xem users
* xem orders
* khóa tài khoản spam
* xem thống kê cơ bản

# UI/UX yêu cầu

Phong cách:

* hiện đại
* startup
* tối giản
* giống:

  * Uber
  * Grab
  * Notion
  * Linear

Màu sắc:

* trắng
* đen
* accent xanh lá hoặc xanh dương

Yêu cầu:

* animation nhẹ
* card UI đẹp
* loading states
* empty states
* skeleton loading

# Database Design

Hãy:

* thiết kế schema Supabase hoàn chỉnh
* tạo SQL tables
* relations rõ ràng
* policies cho auth

# Output mong muốn

1. Cấu trúc project hoàn chỉnh
2. Toàn bộ source code
3. Các file quan trọng:

   * package.json
   * schema.sql
   * .env.example
4. Hướng dẫn setup local
5. Hướng dẫn deploy Vercel
6. Hướng dẫn connect Supabase
7. Viết code production-style
8. Tách component hợp lý
9. Có dummy data/demo data

# Quan trọng

* Không làm app quá enterprise.
* Ưu tiên:

  * nhanh build
  * dễ demo
  * UX đẹp
  * MVP thực tế
* Không cần payment gateway thật.
* Không cần GPS realtime.
* Không cần microservices.

Hãy tạo project theo mindset:
“startup MVP có thể demo cho môn đổi mới sáng tạo và khởi nghiệp nhưng vẫn đủ đẹp và chuyên nghiệp để gây ấn tượng.”

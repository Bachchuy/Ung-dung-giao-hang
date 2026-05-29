# ⚡ Campus Express - Nền Tảng Giao Nhận Nội Khu Sinh Viên

Chào mừng bạn đến với **Campus Express** — Dự án MVP logistics nội khu trường đại học / ký túc xá được thiết kế cho các cuộc thi Đổi mới sáng tạo & Khởi nghiệp. Dự án giải quyết triệt để bài toán **"last-meter delivery"** trong khuôn viên trường bằng cách kết nối nhu cầu đặt đồ ăn, thức uống, in ấn PDF của sinh viên với những sinh viên khác đang tiện đường đi học/về ký túc xá.

---

## ✨ Điểm nổi bật & Tính năng chính của MVP

1. **Giao diện Uber/Grab Style (Mobile-First)**: UI/UX hiện đại, mượt mà, hỗ trợ responsive hoàn hảo trên điện thoại.
2. **Demo Mode Controller (Độc quyền)**: Một thanh điều khiển nổi (Floating Pill) ở cuối màn hình cho phép người dùng **chuyển đổi nhanh giữa 3 vai trò** (`Khách hàng 🛒`, `Shipper 🚴`, `Admin 🛡️`) chỉ bằng 1 cú click để trình diễn trọn vẹn kịch bản mà không cần thoát tài khoản.
3. **Double-Sided App (Ứng dụng 3 bên)**:
   - **Sinh viên đặt đơn (Customer)**: Chọn danh mục Đồ ăn, Nước uống, hoặc dịch vụ tải PDF lên để in tài liệu ôn thi với đầy đủ cấu hình bản in (in 2 mặt, in màu, số lượng bản in), theo dõi trạng thái đơn trực quan.
   - **Sinh viên giao đơn (Shipper)**: Bảng tin đơn hàng (Order Pool) hiển thị đơn chờ, xem chi tiết, nhận đơn, cập nhật lộ trình giao hàng, nhận tiền ship.
   - **Quản trị viên (Admin Dashboard)**: Thống kê số lượng đơn, số user, tổng dòng tiền giao dịch, quản lý/khoá tài khoản spam, hủy đơn lỗi.
4. **Gamification (Hệ thống uy tín sinh viên)**: Điểm danh tiếng (Reputation, max 200) tăng/giảm theo đánh giá 2 chiều và hành vi giao đơn. Shipper hoàn thành trên 5 đơn được phong tặng danh hiệu danh giá **Top Shipper 🏆**.
5. **Telegram Bot Dispatcher**: Tự động đẩy tin thông báo đơn hàng mới lên nhóm Telegram sinh viên nội khu để Shipper phản ứng nhanh nhất.
6. **Kiểm soát Email Sinh Viên**: Chế độ xác thực kiểm tra đuôi domain `.edu` hoặc `.edu.vn` để đảm bảo hệ thống chỉ dành riêng cho sinh viên trường.

---

## 🛠️ Tech Stack & Kiến trúc dự án
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS & Lucide Icons
- **Database Backend**: Supabase PostgreSQL (Sẵn sàng cắm khóa API)
- **Notification**: Telegram Bot API Webhook
- **Demo Fallback**: LocalStorage Persistence State Manager (Chạy hoàn hảo offline không cần cài đặt database ngay lập tức).

---

## 🚀 Hướng dẫn Setup chạy Local nhanh chóng

### 1. Khởi động dự án lập tức (Chế độ Demo)
Chỉ cần thực hiện các lệnh sau, ứng dụng sẽ chạy ngay ở chế độ **Mock / Demo Mode** (lưu dữ liệu vào trình duyệt của bạn). Bạn có thể trình chiếu mọi tính năng ngay tức thì:

```bash
# 1. Cài đặt các gói phụ thuộc (nếu chưa cài)
npm install

# 2. Khởi động máy chủ phát triển
npm run dev
```

Truy cập: **[http://localhost:3000](http://localhost:3000)** trên điện thoại hoặc trình duyệt để trải nghiệm!

---

## 🔗 Hướng dẫn Kết nối Cơ sở dữ liệu Supabase

Khi dự án đã sẵn sàng chạy thực tế với dữ liệu đồng bộ đám mây:

1. Tạo một dự án mới trên **[Supabase](https://supabase.com)**.
2. Vào tab **SQL Editor** trong bảng quản trị Supabase, sao chép toàn bộ code từ file **`schema.sql`** trong dự án này và bấm **Run** để khởi tạo các bảng, quan hệ và trigger tự động.
3. Tạo file `.env.local` ở thư mục gốc của dự án này dựa trên `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
4. Cập nhật các thông số từ bảng điều khiển Supabase của bạn:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Hệ thống sẽ tự động phát hiện khóa cấu hình và chuyển từ **Demo Mock Mode** sang kết nối **Supabase Production Mode**!

---

## 🤖 Hướng dẫn tích hợp Telegram Bot (Đẩy đơn tự động)

Để mỗi khi sinh viên đặt đơn, tin nhắn tự động bắn lên nhóm Telegram chung của Shipper:

1. Chat với **[@BotFather](https://t.me/BotFather)** trên Telegram, gửi lệnh `/newbot` để tạo bot mới và lưu lại **`TELEGRAM_BOT_TOKEN`**.
2. Tạo một Group/Channel Telegram (nơi các Shipper nhận tin) và thêm Bot của bạn vào làm Quản trị viên (Admin).
3. Lấy **`TELEGRAM_CHAT_ID`** của nhóm (bạn có thể add bot `@RawDataBot` hoặc gửi tin nhắn vào nhóm rồi truy cập `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates` để tìm khóa ID bắt đầu bằng dấu `-`, ví dụ: `-10023456789`).
4. Điền cả 2 khóa này vào file `.env.local`:
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   TELEGRAM_CHAT_ID=your_chat_id_here
   ```

---

## 🌍 Hướng dẫn Deploy lên Vercel (1-Click Deploy)

Next.js được thiết kế để hoạt động hoàn hảo nhất trên **[Vercel](https://vercel.com/)**:

1. Đẩy mã nguồn dự án của bạn lên kho lưu trữ **GitHub**.
2. Truy cập **Vercel Dashboard**, bấm **Add New** -> **Project**.
3. Import dự án GitHub vừa đẩy lên.
4. Ở mục **Environment Variables**, điền đầy đủ các thông số cấu hình tương tự như file `.env.local` của bạn.
5. Bấm **Deploy**. Sau 1-2 phút, bạn sẽ nhận được một địa chỉ web HTTPS hoàn chỉnh để gửi cho ban giám khảo hoặc người dùng chạy thử thực tế!

---

💡 *Chúc bạn có buổi thuyết trình thuyết phục và đạt kết quả cao với sản phẩm khởi nghiệp đầy tiềm năng này!*

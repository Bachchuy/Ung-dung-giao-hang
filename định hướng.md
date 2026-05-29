# 🗺️ BẢN ĐỊNH HƯỚNG NÂNG CẤP & HOÀN THIỆN ĐỀ TÀI KHỞI NGHIỆP: CAMPUS EXPRESS

Chào bạn! **Campus Express** hiện đã có một nền móng MVP cực kỳ vững chắc, giao diện Mobile-First hiện đại và luồng hoạt động 3 bên hoàn chỉnh (Khách hàng 🛒, Shipper 🚴, Admin 🛡️), cùng khả năng tương thích Supabase/Telegram. 

Tuy nhiên, để sản phẩm thực sự **"WOW"** ban giám khảo trong các cuộc thi Đổi mới Sáng tạo & Khởi nghiệp, hoặc để sẵn sàng thương mại hóa thực tế, chúng ta cần bổ sung những tính năng mang tính **tương tác cao (interactive)**, **trực quan hóa dữ liệu (data visualization)** và **tối ưu hóa trải nghiệm thực tế**.

Dưới đây là bản định hướng chi tiết với các tính năng đề xuất nâng cấp đột phá, được chia theo các nhóm giải pháp:

---

## ⚡ 1. Bản Đồ Giao Nhận Mô Phỏng 2D (Interactive Campus Map)
> **Mục tiêu:** Giải quyết điểm yếu của MVP khi chưa tích hợp GPS thật bằng cách tạo một bản đồ mô phỏng nội khu sinh động, đẹp mắt, giúp phần thuyết trình cực kỳ thuyết phục.

*   **Cách hoạt động:**
    *   Tạo một sơ đồ bản đồ 2D dạng vector SVG phẳng của khuôn viên trường (ví dụ các mốc: *Cổng Parabol, Thư viện Tạ Quang Bửu, KTX B10, Nhà D3, Nhà D8...*).
    *   Khi đơn hàng chuyển sang trạng thái **delivering (Đang giao)**, hệ thống sẽ vẽ một **đường nối phát sáng (glowing dashed line)** từ điểm mua (ví dụ Cổng Parabol) đến điểm giao (KTX B10).
    *   Một **icon Shipper bằng xe đạp màu xanh sẽ di chuyển chậm (animation)** dọc theo lộ trình mô phỏng đó để khách hàng theo dõi trực quan.
*   **Giá trị mang lại:** Tạo cảm giác "realtime tracking" chân thực mà không cần tốn chi phí thuê API Google Maps hay cấu hình GPS phức tạp trên thiết bị.

---

## 💸 2. Ví Điện Tử Giả Lập (CampusWallet) & Hóa Đơn Điện Tử
> **Mục tiêu:** Hoàn thiện luồng tài chính khép kín mà không cần tích hợp cổng thanh toán thật (Momo/VNPAY) phức tạp.

*   **Cách hoạt động:**
    *   **Số dư ví (Mock Balance):** Mỗi tài khoản mới đăng ký sẽ được tặng sẵn **200,000đ** trong ví điện tử CampusWallet để trải nghiệm.
    *   **Khấu trừ tự động:** Khi Customer đặt đơn, số tiền (phí ship + ước tính tiền hàng) sẽ bị **tạm giữ (hold)**.
    *   **Cộng tiền realtime:** Ngay khi Shipper bấm **"Đã giao thành công"**, tiền ship sẽ được chuyển thẳng sang ví của Shipper.
    *   **Trang Cá nhân & Biểu đồ Thu nhập:** Shipper có thêm tab thống kê thu nhập theo tuần hiển thị bằng biểu đồ cột hoặc đường kẻ (SVG mượt mà) trực quan.
    *   **E-Receipt (Hóa đơn):** Khi hoàn thành đơn, khách hàng nhận được một hóa đơn thiết kế dạng thẻ biên lai siêu đẹp có mã QR-code mock để lưu trữ.

---

## 💬 3. Trò Chuyện Trong Ứng Dụng (In-App Chat Simulation)
> **Mục tiêu:** Tăng tính kết nối giữa Shipper và Customer mà không cần thoát app gọi điện truyền thống.

*   **Cách hoạt động:**
    *   Khi đơn được nhận, một nút **"Chat với Shipper/Khách hàng"** sẽ xuất hiện trên đơn hàng.
    *   Mở ra cửa sổ chat bubble đẹp mắt kiểu Grab/Uber.
    *   Bổ sung các **mẫu tin nhắn nhanh (Quick Replies)** phù hợp với sinh viên:
        *   *Shipper:* "Mình đã mua xong đồ ăn rồi nhé!", "Mình đang giao đến cổng tòa nhà.", "Bạn xuống nhận giúp mình nha!"
        *   *Khách hàng:* "Bạn cứ gửi ở bàn bảo vệ giúp mình.", "Mua thêm cho mình đá nhé.", "Cảm ơn bạn nhiều!"
    *   Shipper và Customer có thể gõ chat tự do (lưu dữ liệu vào Local/Supabase).

---

## 🎟️ 4. Hệ Thống Mã Giảm Giá & Voucher Học Đường (Promo Codes)
> **Mục tiêu:** Thể hiện tư duy kinh doanh và phát triển người dùng (Growth Hacking) - điểm cộng lớn trong mắt ban giám khảo khởi nghiệp.

*   **Cách hoạt động:**
    *   Thêm ô nhập **Mã giảm giá** tại màn hình đặt đơn.
    *   Cung cấp các code khuyến mãi giả lập có sẵn trong hệ thống:
        *   `FREESHIP`: Miễn phí vận chuyển (giảm tối đa 15,000đ).
        *   `TANBINH`: Giảm 50% phí ship cho sinh viên mới.
        *   `HUST50`: Giảm giá cho các đơn giao đến thư viện vào mùa thi.
    *   Hệ thống cập nhật tổng số tiền thanh toán hiển thị hiệu ứng gạch ngang giá cũ cực kỳ bắt mắt.

---

## 🖨️ 5. Trình Tính Giá & Xem Trước Bản In PDF Nâng Cao (Smart Printing Center)
> **Mục tiêu:** Nâng cấp tính năng đặt in tài liệu hiện tại vốn đang ở mức cơ bản.

*   **Cách hoạt động:**
    *   **Ước tính chi phí:** Hệ thống tự động tính toán tổng số tiền in dựa trên: *Số trang file PDF x Số bản in x Đơn giá (ví dụ: 500đ/trang đen trắng, 2000đ/trang màu)*.
    *   **Tùy chọn đóng sách:** Bổ sung các tùy chọn đóng sách thực tế như *Đóng gáy xoắn (+10,000đ)*, *Dán băng keo (+3,000đ)*, *Bìa kính (+5,000đ)*.
    *   **Bản xem trước:** Hiển thị một khung mockup tài liệu/sách để người dùng thấy trực quan tài liệu của họ sau khi in ra sẽ trông như thế nào.

---

## 🏆 6. Bảng Xếp Hạng & Nhiệm Vụ Hàng Ngày (Gamification & Daily Quests)
> **Mục tiêu:** Tăng tỷ lệ giữ chân người dùng (Retention Rate) bằng cách trò chơi hóa ứng dụng giao nhận.

*   **Cách hoạt động:**
    *   **Nhiệm vụ hàng ngày (Daily Quests):**
        *   *Nhiệm vụ 1:* "Giao 2 đơn đồ ăn trong ngày" -> Nhận +10 điểm uy tín.
        *   *Nhiệm vụ 2:* "Hoàn thành đơn hàng trước 12h trưa" -> Nhận huy hiệu "Chim non chăm chỉ".
    *   **Bảng xếp hạng tuần (Weekly Leaderboard):** Hiển thị danh sách Top 5 Shipper xuất sắc nhất trường với số đơn hoàn thành cao nhất kèm hiệu ứng vương miện Vàng/Bạc/Đồng lấp lánh.

---

## 🌓 7. Sleek Dark Mode (Chế Độ Nền Tối)
> **Mục tiêu:** Nâng tầm thẩm mỹ giao diện cao cấp.

*   **Cách hoạt động:**
    *   Tích hợp nút chuyển đổi Dark/Light mode ở góc màn hình.
    *   Khi bật Dark Mode, toàn bộ giao diện chuyển sang tone màu tối huyền bí (Deep Slate, Dark Navy) kết hợp với màu nhấn Emerald Green phát sáng neon, mang lại cảm giác cực kỳ công nghệ, cao cấp giống các ứng dụng SaaS hiện đại (Linear, Vercel).

---

## 📋 ĐỀ XUẤT LỘ TRÌNH TRIỂN KHAI HOÀN THIỆN:

Để đảm bảo hiệu quả cao nhất và có thể demo ngay lập tức, chúng ta nên triển khai theo các giai đoạn sau:

1.  **Giai đoạn 1 (Ví & Tài chính):** Hoàn thiện **Ví điện tử giả lập CampusWallet** để luồng đặt đơn - giao đơn có sự chuyển dịch tiền tệ, tạo cảm giác app hoạt động thực tế.
2.  **Giai đoạn 2 (Trải nghiệm trực quan):** Xây dựng **Bản đồ giao nhận mô phỏng 2D** và **Khung trò chuyện trực tiếp Shipper - Khách hàng**. Đây là 2 tính năng có sức nặng thị giác (Visual Impact) lớn nhất khi thuyết trình.
3.  **Giai đoạn 3 (Gamification & Khuyến mãi):** Bổ sung **Mã giảm giá**, **Nhiệm vụ hàng ngày** và **Bảng xếp hạng** để tối ưu hóa kịch bản kinh doanh thực tế.

---

> **💡 Bạn nghĩ sao về định hướng này?**
> Bạn muốn chúng ta bắt tay vào hoàn thiện tính năng nào trước tiên? Hãy cho tôi biết để tôi thiết lập kế hoạch triển khai chi tiết và nâng cấp mã nguồn ngay lập tức!

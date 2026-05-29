# ⚙️ SƠ ĐỒ VẬN HÀNH DỰ ÁN CAMPUS EXPRESS

Tài liệu này mô tả chi tiết luồng vận hành của hệ thống giao nhận nội khu Campus Express, giúp bạn và đội ngũ dễ dàng quản lý, cũng như có thể sử dụng trực tiếp để đưa vào slide thuyết trình (pitch deck).

## 1. Luồng Tương Tác Cốt Lõi (Core Flow)

Biểu đồ tuần tự dưới đây mô tả hành trình từ khi Khách hàng đặt đơn cho đến khi Shipper hoàn thành và nhận tiền.

```mermaid
sequenceDiagram
    autonumber
    actor C as Khách hàng
    participant S as Hệ thống (App/Supabase)
    participant T as Telegram Bot
    actor P as Shipper

    C->>S: Tạo đơn hàng (Đồ ăn / Thức uống / In ấn)
    Note over C,S: Hệ thống tạm giữ (hold) tiền trong CampusWallet
    S->>T: Đẩy thông tin đơn hàng mới
    T-->>P: Broadcast tin nhắn lên Group Telegram sinh viên
    
    P->>S: Xem danh sách & Bấm "Nhận đơn" (Accept)
    S-->>C: Gửi Notification: Đã có Shipper nhận đơn
    
    P->>C: Gọi điện / Nhắn tin Chat in-app để xác nhận
    
    P->>S: Bấm "Bắt đầu giao" (Delivering)
    S-->>C: Cập nhật UI (Hiển thị bản đồ giao nhận)
    
    P->>S: Bấm "Giao thành công" (Completed)
    Note over P,S: Trừ tiền Khách, Cộng tiền cho Shipper + Điểm uy tín
    S-->>C: Gửi Hóa đơn điện tử (E-Receipt)
    
    C->>S: Đánh giá Shipper (Từ 1-5 Sao)
```

---

## 2. Mô Hình Trạng Thái Đơn Hàng (Order State Machine)

Quá trình chuyển đổi trạng thái của một đơn hàng trong hệ thống.

```mermaid
stateDiagram-v2
    [*] --> Pending: Sinh viên tạo đơn
    Pending --> Accepted: Shipper nhận đơn
    Pending --> Cancelled: Khách hàng tự hủy
    
    Accepted --> Delivering: Shipper bắt đầu đi giao
    Accepted --> Cancelled: Shipper báo hủy (bị trừ uy tín nặng)
    
    Delivering --> Completed: Giao thành công
    
    Completed --> [*]: Tiền được cộng vào ví Shipper
    Cancelled --> [*]: Hoàn tiền về ví Khách hàng
```

---

## 3. Cấu Trúc Hệ Sinh Thái Ứng Dụng (Architecture)

```mermaid
graph TD
    subgraph Frontend (Next.js / React)
        UI[Giao diện Mobile-First]
        CD[Customer Dashboard]
        SD[Shipper Dashboard]
        AD[Admin Dashboard]
        UI --> CD
        UI --> SD
        UI --> AD
    end

    subgraph Backend & DB (Supabase / LocalStorage)
        Auth[Xác thực .edu email]
        DB[(PostgreSQL / Local State)]
        Wallet[CampusWallet Engine]
    end

    subgraph External Services
        Bot[Telegram Bot Dispatcher]
    end

    CD <-->|Lấy/Cập nhật| DB
    SD <-->|Lấy/Cập nhật| DB
    AD <-->|Quản lý| DB
    
    DB -->|Trigger Đơn Mới| Bot
    CD <--> Wallet
    SD <--> Wallet
```

---

## 4. Sơ đồ Lớp Đối Tượng (OOP Class Diagram)

Sơ đồ này mô hình hóa cấu trúc hướng đối tượng của hệ thống, chỉ rõ các thuộc tính (attributes), phương thức (methods) và mối quan hệ (relationships) giữa các thực thể cốt lõi trong phần mềm Campus Express.

```mermaid
classDiagram
    class UserProfile {
        +String id
        +String email
        +String fullName
        +String avatarUrl
        +String role
        +int reputation
        +int ordersCompleted
        +double balance
        +boolean isBanned
        +Date createdAt
        +login(email, fullName) bool
        +logout() void
        +switchRole(newRole) void
        +updateBalance(amount) void
    }

    class Order {
        +String id
        +String customerId
        +String customerName
        +String customerAvatar
        +String shipperId
        +String shipperName
        +String shipperAvatar
        +String title
        +String description
        +String orderType
        +String deliveryLocation
        +String phoneNumber
        +String notes
        +double shippingFee
        +String status
        +Date createdAt
        +PrintingDetails printingDetails
        +createOrder(data, printing) bool
        +acceptOrder(shipperId) bool
        +updateStatus(newStatus) bool
        +cancelOrder() bool
    }

    class PrintingDetails {
        +String fileName
        +int copies
        +boolean isColor
        +boolean isDoubleSided
        +String bindingType
        +calculatePrintingCost() double
    }

    class Rating {
        +String id
        +String orderId
        +String fromId
        +String toId
        +int rating
        +String comment
        +Date createdAt
        +submitRating(orderId, toId, score, comment) bool
    }

    class Message {
        +String id
        +String orderId
        +String senderId
        +String text
        +Date timestamp
        +sendMessage(orderId, senderId, text) bool
    }

    class PromoCode {
        +String code
        +double discountAmount
        +boolean isActive
        +applyPromo(orderId) double
    }

    UserProfile "1" *-- "many" Order : places / delivers
    Order "1" o-- "0..1" PrintingDetails : contains
    Order "1" *-- "many" Message : has chat
    Order "1" *-- "0..2" Rating : receives
```

*Giải thích mối quan hệ:*
- **UserProfile** và **Order** (Composition `*--`): Một UserProfile có thể đặt hoặc đi giao nhiều đơn hàng (Order).
- **Order** và **PrintingDetails** (Aggregation `o--`): Một đơn hàng có thể chứa 0 hoặc 1 chi tiết in ấn PDF (PrintingDetails).
- **Order** và **Message** (Composition `*--`): Một đơn hàng có một cuộc hội thoại nội bộ gồm nhiều tin nhắn (Message). Khi đơn hàng bị hủy/xoá hoàn toàn, tin nhắn cũng sẽ biến mất theo đơn hàng.
- **Order** và **Rating** (Composition `*--`): Một đơn hàng đã hoàn thành có tối đa 2 đánh giá (Customer đánh giá Shipper và Shipper đánh giá Customer).

---

## 💡 Hướng Dẫn Dành Cho Bạn:
1. Bạn có thể copy các đoạn code có chữ `mermaid` ở trên và dán vào trang web **[Mermaid Live Editor](https://mermaid.live/)** để xuất ra hình ảnh định dạng PNG/SVG sắc nét, sau đó dán thẳng vào slide PowerPoint thuyết trình!
2. Github cũng tự động render các biểu đồ này nếu bạn tải file này lên kho chứa Github của dự án.

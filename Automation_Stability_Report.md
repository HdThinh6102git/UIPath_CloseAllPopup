# Báo cáo Giải pháp: Tối ưu độ ổn định cho Robot (Automation Stability)

Tài liệu này trình bày chi tiết về hai cơ chế quan trọng vừa được triển khai: **Kiểm tra trạng thái tải trang (Page Load Check)** và **Vòng lặp thử lại (Retry Scope)**.

---

## 1. Cơ chế Page Loading Complete Checking

### Bản chất kỹ thuật
Chúng ta sử dụng Javascript để truy vấn thuộc tính `document.readyState` trực tiếp từ bộ nhân của trình duyệt. 
*   **Trạng thái mục tiêu**: `"complete"`.
*   **Tại sao dùng cách này?**: Các trang web hiện đại (Single Page Application) thường có hiện tượng "tải giả" - trình duyệt báo đã xong nhưng các script ngầm vẫn đang chạy. `document.readyState === "complete"` là chứng chỉ cao nhất xác nhận toàn bộ DOM, hình ảnh, và script đã sẵn sàng.

### Tại sao cần thực hiện?
1.  **Tránh "Race Condition"**: Ngăn chặn việc robot thực hiện click vào một thành phần chưa tồn tại hoặc chưa hiển thị đầy đủ.
2.  **Đảm bảo Popup xuất hiện**: Nhiều popup quảng cáo chỉ hiện ra sau khi trang tải xong 100%. Nếu không đợi, robot sẽ bỏ sót popup và bị lỗi ở các bước sau.

---

## 2. Cơ chế Retry Scope Activity

### Cách thức hoạt động
`Retry Scope` hoạt động theo mô hình **Thực hiện -> Kiểm tra -> Thử lại**. Robot sẽ lặp lại hành động lấy trạng thái trang web cho đến khi điều kiện "Trạng thái = complete" được thỏa mãn.

### Thông số thiết lập:
*   **Số lần thử (30 lần)**: Thời gian kiên nhẫn tối đa của robot.
*   **Khoảng cách (1 giây)**: Tần suất kiểm tra để không làm nặng trình duyệt nhưng vẫn phản ứng kịp thời khi trang tải xong.

---

## 3. Tại sao sự kết hợp này lại vượt trội?

So với các phương pháp thông thường (như dùng `Delay` cố định hoặc `While True`), sự kết hợp này mang lại các lợi ích:

| Tiêu chí | Dùng Delay cố định | Dùng While True | **Giải pháp hiện tại (Retry + JS)** |
| :--- | :--- | :--- | :--- |
| **Tốc độ** | Chậm (luôn phải đợi đủ giây) | Nhanh | **Tối ưu (xong là chạy ngay)** |
| **Độ an toàn** | Thấp (mạng lag hơn thời gian delay sẽ lỗi) | Thấp (có thể gây treo máy do vòng lặp vô tận) | **Cao (có giới hạn thời gian an toàn)** |
| **Xử lý mạng lag** | Không có | Phải tự viết logic phức tạp | **Tự động bắt lỗi và thử lại thông minh** |
| **Tính thẩm mỹ** | Code xấu, khó bảo trì | Code rườm rà | **Code chuyên nghiệp, dễ tái sử dụng** |

## Kết luận
Việc áp dụng combo **Retry Scope + Javascript ReadyState** giúp robot xử lý mượt mà ngay cả trong điều kiện mạng lag, đồng thời tối ưu hóa thời gian chạy (chạy ngay khi có thể, không đợi thừa). Đây là tiêu chuẩn vàng để xây dựng các robot cấp độ doanh nghiệp (Enterprise Grade).

---
**Ghi chú**: Giải pháp này đã được tách thành workflow riêng (`WaitPageReady.xaml`), cho phép tái sử dụng nhanh chóng trong tất cả các quy trình khác.

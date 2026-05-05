# Tóm tắt Quy trình Module hóa (Project Modular Flow)

Tài liệu này hướng dẫn cách sử dụng và vận hành hệ thống đóng popup đã được module hóa.

---

## 1. Cấu trúc các file Module

| File | Chức năng | Đầu vào (Arguments) |
| :--- | :--- | :--- |
| **`WaitPageReady.xaml`** | Đợi trang web tải xong 100% (readyState = complete) | `in_Browser` (UiElement) |
| **`CloseAllPopUp.xaml`** | Quét và đóng sạch mọi popup đang hiện diện | `in_Browser` (UiElement) |
| **`Test.xaml`** | File điều khiển mẫu (Demo) kết hợp các module | (Không có) |

---

## 2. Quy trình thực thi chuẩn (Flow)

Dưới đây là trình tự các bước robot thực hiện trong file **`Test.xaml`**:

1.  **Bắt đầu**: Mở trình duyệt Chrome bằng Activity `Use Application/Browser`.
2.  **Lấy Handle**: Lưu trình duyệt vừa mở vào biến `browserInstance`.
3.  **Kiểm tra trang**: Gọi `Invoke WaitPageReady.xaml` và truyền `browserInstance` vào. Robot sẽ đợi đến khi trang web ổn định.
4.  **Dọn dẹp**: Gọi `Invoke CloseAllPopUp.xaml` và truyền `browserInstance` vào. Robot thực hiện vòng lặp đóng sạch popup.
5.  **Kết thúc**: Sau khi các module con chạy xong, robot tiếp tục các hành động nghiệp vụ khác trong file cha.

---

## 3. Cách tái sử dụng module cho dự án mới

Để sử dụng các module này trong một dự án UiPath khác, bạn làm như sau:

1.  **Copy file**: Copy file `WaitPageReady.xaml` và `CloseAllPopUp.xaml` vào thư mục dự án mới.
2.  **Refresh**: Nhấn Refresh trong bảng Project của UiPath Studio.
3.  **Khai báo biến**: Trong file chính của dự án mới, tại Activity `Use Application/Browser`, tạo một biến (ví dụ: `currentBrowser`) ở phần **Output Element**.
4.  **Gọi Module**:
    *   Kéo Activity `Invoke Workflow File` vào.
    *   Chọn file module tương ứng.
    *   Nhấn **Import Arguments** và truyền biến `currentBrowser` vào phần giá trị của `in_Browser`.

---

## 4. Tại sao cấu trúc này lại tốt?

*   **Linh hoạt**: Bạn có thể gọi lệnh đóng popup ở bất kỳ thời điểm nào trong quy trình (sau khi đăng nhập, sau khi chuyển trang, v.v.) chỉ bằng 1 dòng `Invoke`.
*   **Tập trung**: Nếu sau này trang web thay đổi giao diện, bạn chỉ cần sửa logic trong file module, tất cả các dự án đang dùng module đó sẽ tự động được cập nhật.

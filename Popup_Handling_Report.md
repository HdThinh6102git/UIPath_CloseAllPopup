# Báo cáo Kỹ thuật: Phân loại và Giải pháp Xử lý Popup trong Tự động hóa (RPA)

Báo cáo này tổng hợp chi tiết các loại Popup (Hộp thoại) gặp phải trong quy trình tự động hóa các trang web bảo hiểm và giải pháp kỹ thuật đã được triển khai trong dự án để nhận diện và đóng sạch chúng một cách tự động, thông minh, đồng thời chỉ ra trạng thái xử lý thực tế của từng loại.

---

## Tổng quan các loại Popup & Trạng thái xử lý

| Loại Popup | Đặc điểm nhận diện | Ảnh hưởng tới Robot | Trạng thái | Giải pháp kỹ thuật & Đóng gói |
| :--- | :--- | :--- | :--- | :--- |
| **1. DOM Popup** *(Trong trang)* | Thẻ HTML (`<div>`, `<dialog>`) nằm trực tiếp trong DOM. | Che khuất các nút bấm thật, gây lỗi `Obscured Element` hoặc `Element Not Found`. | <span style="color:green">**Đã xử lý (Handled)**</span> | Nhúng mã JavaScript thông minh ([DetectPopupAndClose.js](file:///c:/Users/PC/Desktop/QuintetCompany/projects/insurance_auto_login_ms_uipath/UI_Path_Project/UIPath_ClosePopupInUI/DetectPopupAndClose.js)) quét động, phân loại bằng `z-index` và giả lập click() vào nút đóng (Đã tích hợp tiếng Hàn). |
| **2. Native Dialog** *(Hệ thống)* | Do trình duyệt tạo ra (`alert()`, `confirm()`, `prompt()`). Không có trong HTML. | Chặn đứng toàn bộ mã JavaScript của trang, treo luồng chạy của Robot. | <span style="color:green">**Đã xử lý (Handled)**</span> | Sử dụng hoạt động `Close Popup` của UiPath kết hợp phím tắt hệ thống (`Esc` qua `Hardware Events`) để bỏ qua hoặc đóng hộp thoại. |
| **3. Window Popup** *(Cửa sổ mới)* | Tab hoặc cửa sổ mới mở riêng biệt thông qua `window.open()`. | Làm Robot mất phương hướng điều hướng (do vẫn đang tương tác với trang cũ). | <span style="color:green">**Đã xử lý (Handled & Optimized)**</span> | Sử dụng giải pháp lai lai đa tầng (Proactive Hybrid): Đóng chủ động theo Selector nền trước (`System Window*`, `Test Popup Blocker`), kết hợp vòng quét động dự phòng `GetActiveWindow` có TryCatch bọc bảo vệ chống crash. |

---

## Chi tiết Giải pháp Kỹ thuật cho từng loại Popup

### 1. DOM Popup (Popup tích hợp trong trang web)

#### Bản chất kỹ thuật
Đây là loại popup phổ biến nhất trên các cổng thông tin bảo hiểm hiện đại. Chúng là các thành phần giao diện (Modal, Overlay, Dialog) được dựng động bằng CSS/HTML. Khi xuất hiện, chúng tạo ra một lớp phủ bán trong suốt che toàn bộ màn hình.

#### Trạng thái hiện tại
* <span style="color:green">**Đã xử lý hoàn toàn**</span>

#### Giải pháp kỹ thuật đã thực hiện
Chúng ta xử lý loại này bằng thuật toán thông minh viết trong tệp [DetectPopupAndClose.js](file:///c:/Users/PC/Desktop/QuintetCompany/projects/insurance_auto_login_ms_uipath/UI_Path_Project/UIPath_ClosePopupInUI/DetectPopupAndClose.js) và nhúng trực tiếp vào các hoạt động `NInjectJsScript` trong UiPath:

1. **Quét Selector diện rộng**: Nhận diện tất cả các đối tượng nghi ngờ là popup bằng mảng selector thuộc tính:
   ```javascript
   var popupSelectors = [
       '[role="dialog"]', '[aria-modal="true"]', 
       '[class*="modal" i]', '[class*="popup" i]', '[class*="overlay" i]'
   ];
   ```
2. **Kiểm tra tính hiển thị (isVisible)**: Đảm bảo chỉ xử lý các phần tử thực sự hiển thị trên màn hình có kích thước `width > 20px` và `height > 20px`, tránh click nhầm vào các popup ẩn.
3. **Phân loại ưu tiên bằng `z-index`**: Sắp xếp danh sách popup tìm được theo thứ tự `z-index` từ cao xuống thấp để robot luôn tương tác với popup nằm trên cùng (đang chặn màn hình trực tiếp).
4. **Nhấp nút đóng đa ngôn ngữ (Đã tích hợp tiếng Hàn)**: Tìm các thẻ bấm (`button`, `a`, `role="button"`) bên trong popup và đối chiếu văn bản với danh sách từ khóa đóng an toàn:
   ```javascript
   var closeWords = [
       "close", "ok", "cancel", "x", "×", "got it", "no thanks", "not now", "accept", "agree",
       "닫기", "확인", "취소", "동의", "동의함", "수락", "허용", "오늘 하루 보지 않기", "다시 보지 않기"
   ];
   ```

---

### 2. Native Dialog (Hộp thoại hệ thống của Trình duyệt)

#### Bản chất kỹ thuật
Các hộp thoại này được sinh ra bởi nhân trình duyệt khi chạy các lệnh JavaScript như `window.alert()`. Vì chúng nằm ở lớp ứng dụng của trình duyệt và hệ điều hành, mã JavaScript thông thường chạy trên trang web **hoàn toàn bị đóng băng** và không thể can thiệp vào các hộp thoại này.

#### Trạng thái hiện tại
* <span style="color:green">**Đã xử lý hoàn toàn**</span>

#### Giải pháp kỹ thuật đã thực hiện
Để vượt qua rào cản này, robot sử dụng các giải pháp ngoài DOM:
* **Sử dụng hoạt động `NClosePopup` của UiPath**: Hoạt động hiện đại này tương tác trực tiếp ở cấp độ trình duyệt API để tìm các nút hệ thống như `OK`, `Cancel`, `Close` và kích hoạt chúng từ bên ngoài trang web.
* **Gửi phím tắt hệ thống (Hardware Events)**: Gửi mã phím `Esc` trực tiếp tới trình duyệt để đóng nhanh các hộp thoại này mà không cần chờ đợi:
  ```xml
  Shortcuts="[d(hk)][k(Esc)][u(hk)]"
  ```

---

### 3. Window Popup (Cửa sổ/Tab mới độc lập)

#### Bản chất kỹ thuật
Khi nhấp vào một số liên kết bảo hiểm hoặc điều khoản, trang web sẽ kích hoạt lệnh mở một cửa sổ trình duyệt mới hoàn toàn (`window.open()`). 
Một thách thức lớn trong tự động hóa là khi click nút gây lỗi, UiPath thường tự động kích hoạt lại trang mẹ (`ActivateBefore = True`), làm cho hoạt động lấy cửa sổ hiện hành (`GetActiveWindow`) nhận nhầm trang mẹ là cửa sổ cần đóng, dẫn đến việc Robot lập tức thoát vòng dọn dẹp và bỏ sót các popup nền.

#### Trạng thái hiện tại
* <span style="color:green">**Đã xử lý hoàn toàn & Tối ưu hóa vượt trội**</span>

#### Giải pháp kỹ thuật lai đa tầng (Proactive Hybrid Approach)
Chúng ta xử lý loại popup này bằng quy trình dọn dẹp 2 giai đoạn khép kín trong tệp [Close_Window_Popup.xaml](file:///c:/Users/PC/Desktop/QuintetCompany/projects/insurance_auto_login_ms_uipath/UI_Path_Project/UIPath_ClosePopupInUI/Close_Window_Popup.xaml):

1. **Giai đoạn 1: Chủ động đóng bằng Selector trực tiếp (Proactive Selector Closing)**:
   * **Cách hoạt động:** Robot sử dụng hoạt động `ui:CloseWindow` với các Selector định danh trực tiếp để dọn sạch các popup mục tiêu mà không cần quan tâm đến Focus hay cửa sổ nào đang Active:
     * Đối với Solution 03 (Popups của Button 3): `<html app='chrome.exe' title='System Window*' />` (Quét sạch cả 2 popup System Window Popup 1 & 2 cùng lúc).
     * Đối với Solution 02 (Popup Blocker): `<html app='chrome.exe' title='Test Popup Blocker' />`.
   * **Ưu điểm:** Tốc độ phản hồi cực nhanh, độc lập hoàn toàn với ngữ cảnh kích hoạt của trang mẹ.

2. **Giai đoạn 2: Quét động dự phòng & Bảo vệ đa tầng (Dynamic Fallback Loop with Dual-Protection)**:
   * **Bọc TryCatch chống sập luồng:** Luồng gán biến `mainTitle = in_Browser.Get("title").ToString` được bảo vệ bằng khối `TryCatch` an toàn tuyệt đối. Nếu đối tượng trình duyệt chưa sẵn sàng hoặc gặp lỗi đồng bộ, biến `mainTitle` sẽ tự gán bằng `""` và tiếp tục luồng quét thay vì dừng hoạt động của Robot.
   * **Danh sách loại trừ trang mẹ (Protected Titles Exclusion List):**
     Sử dụng biểu thức điều kiện loại trừ thông minh hỗ trợ đa trình duyệt (Chrome & Edge) để bảo vệ an toàn cho trang làm việc chính trong mọi trường hợp:
     ```vb
     activeWindow.Selector IsNot Nothing AndAlso (activeWindow.Selector.ToString.ToLower.Contains("chrome") OrElse activeWindow.Selector.ToString.ToLower.Contains("msedge") OrElse activeWindow.Selector.ToString.ToLower.Contains("edge"))
     ```
   * **Vòng lặp dọn dẹp quét động:** Sử dụng vòng lặp `While` kết hợp `ui:GetActiveWindow` để đóng bất kỳ cửa sổ lạ nào khác không nằm trong danh sách loại trừ bảo vệ.

---

## Ghi chú & Phụ lục kỹ thuật: Giải pháp xử lý Window Popup (Module độc lập)

Khi tích hợp hoặc gọi Module xử lý Window Popup này vào các luồng nghiệp vụ khác, cơ chế vận hành chi tiết bao gồm:

1. **Quản lý thực thể Trình duyệt (Browser Instance Management)**:
   * **Cách hoạt động:** Sử dụng biến `in_Browser` (kiểu `UiElement`) truyền động qua các Workflow. Robot sẽ bám sát duy nhất cửa sổ làm việc được chỉ định ban đầu, bỏ qua mọi cửa sổ quảng cáo rác nảy ra ngầm ở nền sau, hạn chế lỗi mất phương hướng điều hướng.
2. **Chuyển đổi ngữ cảnh (Context Switching)**:
   * **Cách hoạt động:** Sử dụng hoạt động `Use Application/Browser` với chế độ liên kết động (Attach Mode) để chuyển quyền kiểm soát (Focus) từ cửa sổ gốc sang cửa sổ mới mở. Sau đó, thực hiện đóng tab/cửa sổ này bằng phím tắt `Ctrl + W` (thông qua `Keyboard Shortcuts`) hoặc gọi lệnh thực thi `window.close()` thông qua `Inject Js Script` trước khi tự động trả điều khiển lại cho luồng chính.

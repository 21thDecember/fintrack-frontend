# FinTrack VN - Frontend Quản Lý Tài Chính Cá Nhân

Hệ thống Frontend Vue 3 hiện đại, hoàn chỉnh cho ứng dụng Quản lý Tài chính Cá nhân (Personal Finance Management), được xây dựng với kiến trúc chuẩn mực, tối ưu hóa trải nghiệm trên cả Desktop, Tablet và Mobile.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Framework**: Vue 3 (Composition API + `<script setup>`)
- **Build Tool**: Vite (cấu hình siêu tốc, proxy API backend)
- **Ngôn ngữ**: TypeScript với định kiểu nghiêm ngặt (Strict Types)
- **UI Component Library**: Element Plus (hỗ trợ Dark Mode, bản địa hóa Tiếng Việt)
- **Icons**: `@element-plus/icons-vue`
- **State Management**: Pinia Store
- **Router**: Vue Router 4 (Navigation Guards, phân quyền đăng nhập)
- **HTTP Client**: Axios (JWT token interceptors, xử lý lỗi & cơ chế Offline Fallback)
- **Xử lý thời gian**: Day.js (định dạng tiếng Việt, tương đối và các khoảng kỳ)
- **Định dạng tiền tệ**: Tiêu chuẩn Việt Nam Đồng (VND - `Intl.NumberFormat('vi-VN')`)
- **Styling**: SCSS với hệ thống biến thiết kế hiện đại

---

## 📁 Cấu Trúc Dự Án (Project Structure)

```
frontend/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env
├── src/
│   ├── main.ts                     # Khởi tạo App, Pinia, Router, Element Plus
│   ├── App.vue                     # Root component cấu hình tiếng Việt & theme
│   ├── api/                        # Tầng giao tiếp HTTP REST API
│   │   ├── client.ts               # Axios instance, JWT token & Smart Offline Fallback
│   │   ├── mockData.ts             # Dữ liệu mẫu tiếng Việt phong phú
│   │   ├── authApi.ts              # Đăng nhập, thông tin người dùng
│   │   ├── accountApi.ts           # CRUD tài khoản ngân hàng, tiền mặt
│   │   ├── categoryApi.ts          # CRUD danh mục thu chi
│   │   ├── transactionApi.ts       # Giao dịch, phân loại sao kê
│   │   ├── debtApi.ts              # Sổ nợ, ghi nhận thanh toán
│   │   ├── personApi.ts            # Quản lý người vay mượn
│   │   ├── dashboardApi.ts         # Tổng quan tài chính & biểu đồ
│   │   ├── reportApi.ts            # Báo cáo tuần & tháng
│   │   ├── budgetApi.ts            # Quản lý ngân sách hạn mức
│   │   └── settingsApi.ts          # Quy tắc phân loại tự động
│   ├── assets/
│   │   └── styles/
│   │       ├── variables.scss      # Màu sắc tài chính, spacing
│   │       └── main.scss           # Global styles, dark mode overrides
│   ├── components/                 # Các component dùng chung
│   │   ├── common/
│   │   │   ├── StatCard.vue        # Thẻ chỉ số tài chính kèm icon màu
│   │   │   ├── TrendBadge.vue      # Huy hiệu biến động tăng/giảm (%)
│   │   │   └── AmountDisplay.vue   # Hiển thị số tiền đổi màu (Xanh Thu, Đỏ Chi)
│   │   ├── charts/
│   │   │   ├── IncomeExpenseChart.vue # Biểu đồ cột Thu/Chi tương tác
│   │   │   ├── CategoryPieChart.vue   # Biểu đồ tròn cơ cấu chi tiêu
│   │   │   └── SavingsGauge.vue       # Thước đo tỷ lệ tiết kiệm
│   │   ├── transactions/
│   │   │   ├── DebtAllocationInput.vue # Phân chia tiền cho bạn bè mượn trong hóa đơn
│   │   │   └── TransactionCard.vue    # Thẻ giao dịch tối ưu cho màn hình Mobile
│   │   └── debts/
│   │       └── DebtPaymentDialog.vue  # Modal ghi nhận trả bớt/tất toán nợ
│   ├── composables/
│   │   ├── useResponsive.ts        # Nhận diện kích thước Mobile/Tablet/Desktop
│   │   └── useTheme.ts             # Bật/tắt Dark Mode & Light Mode
│   ├── layouts/
│   │   └── MainLayout.vue          # Sidebar 240px desktop, Bottom navigation 5 tab mobile
│   ├── router/
│   │   └── index.ts                # Định tuyến và Navigation Guard bảo vệ
│   ├── stores/                     # Pinia state stores
│   │   ├── auth.ts                 # Trạng thái đăng nhập & token
│   │   ├── account.ts              # Danh sách tài khoản & tổng số dư
│   │   ├── category.ts             # Danh mục thu/chi
│   │   ├── transaction.ts          # Giao dịch, phân trang, lọc & phân loại
│   │   ├── debt.ts                 # Sổ nợ phải thu, phải trả, tiến độ
│   │   └── person.ts               # Đối tượng liên quan
│   ├── types/                      # TypeScript Interfaces & Enums chuẩn
│   │   ├── account.ts
│   │   ├── category.ts
│   │   ├── transaction.ts
│   │   ├── debt.ts
│   │   ├── person.ts
│   │   ├── report.ts
│   │   ├── dashboard.ts
│   │   ├── budget.ts
│   │   └── auth.ts
│   ├── utils/                      # Hàm tiện ích
│   │   ├── currency.ts             # Format tiền VND: 1.000.000 ₫
│   │   ├── date.ts                 # Format ngày tháng Tiếng Việt bằng Day.js
│   │   └── constants.ts            # Nhãn loại giao dịch, màu sắc, icon
│   └── views/                      # Các trang màn hình chính
│       ├── auth/LoginView.vue      # Màn hình đăng nhập
│       ├── dashboard/DashboardView.vue # Màn hình Dashboard tổng quan
│       ├── transactions/
│       │   ├── TransactionListView.vue # Danh sách giao dịch & bộ lọc
│       │   └── TransactionFormView.vue # Thêm/Sửa giao dịch & chia tiền
│       ├── debts/
│       │   ├── DebtListView.vue    # Sổ nợ Phải thu / Phải trả
│       │   └── DebtDetailView.vue  # Chi tiết nợ & lịch sử trả góp
│       ├── reports/ReportView.vue  # Báo cáo Tuần & Tháng
│       ├── accounts/AccountListView.vue # Quản lý tài khoản thanh khoản
│       ├── categories/CategoryListView.vue # Quản lý danh mục thu/chi
│       └── settings/SettingsView.vue # Cài đặt quy tắc phân loại & sao lưu
```

---

## 🚀 Hướng Dẫn Chạy Ứng Dụng (Getting Started)

### 1. Cài đặt thư viện dependencies:
```bash
cd frontend
npm install
```

### 2. Khởi chạy môi trường phát triển (Dev Server):
```bash
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:5173`

### 3. Đăng nhập:
- **Tên đăng nhập**: `admin`
- **Mật khẩu**: `password123` (hoặc nhấn nút "Bấm để điền mẫu")

---

## 💎 Điểm Nổi Bật Của Hệ Thống

1. **Giao diện đa nền tảng tối ưu (Responsive First)**:
   - Trên **Desktop**: Sidebar trái cố định 240px, bảng dữ liệu đầy đủ chi tiết với phân trang.
   - Trên **Tablet**: Tự động thu gọn thanh menu thành icon gọn gàng.
   - Trên **Mobile**: Thanh điều hướng 5 tab dưới đáy (Bottom Navigation Bar) cùng nút thao tác nhanh (Floating Action Button).

2. **Cơ chế Phân chia chi phí trong hóa đơn (Cost Allocation)**:
   - Khi chi trả một bữa tiệc, hóa đơn du lịch, người dùng có thể kích hoạt mục "Phân chia chi phí / Người nợ tiền".
   - Tự động trừ phần bạn bè nợ để ra "Phần của bạn" và ghi nhận vào sổ nợ phải thu (Receivable).

3. **Bảo vệ an toàn dữ liệu sao kê Ngân hàng (Bank Immuntability)**:
   - Các giao dịch đồng bộ từ nguồn `BANK` sẽ được khóa các trường nhạy cảm (Số tiền, Tài khoản nguồn, Thời gian) để bảo đảm toàn vẹn số liệu với ngân hàng.

4. **Biểu đồ tài chính sinh động**:
   - Biểu đồ cột Thu/Chi theo từng ngày trong tuần.
   - Biểu đồ cơ cấu danh mục chi tiêu theo tỷ lệ phần trăm (Donut chart).
   - Thước đo tỷ lệ tiết kiệm (Savings Rate Gauge) chuẩn mực.

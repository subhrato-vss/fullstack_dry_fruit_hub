# Smart Spender: Core Coding Patterns & AI Development Guide

This document distills the established architectural patterns and coding standards used in the Smart Spender project. Use these guidelines when extending the application to maintain consistency and security.

---

## 1. Backend Patterns (Node.js ESM)

The backend follows a strict **Route-Controller** separation using ECMAScript Modules (`import`/`export`).

### 1.1 Secure Database Access
All database interactions MUST use **parameterized queries** via the centralized `query` wrapper in `backend/config/db.js`.
- **Primary Tool**: `mysql2/promise` with a connection pool.
- **Pattern**:
  ```javascript
  import { query } from '../config/db.js';

  // Always pass parameters as an array to prevent SQL Injection
  const results = await query('SELECT * FROM users WHERE id = ?', [userId]);
  ```

### 1.2 Authentication & Middleware
- **JWT**: Tokens are signed via `jsonwebtoken` and stored in **HTTP-Only Cookies** for security.
- **Password Security**: Uses `bcrypt` for one-way hashing of user credentials.
- **Standard Middleware**:
    - `helmet`: Secure headers.
    - `morgan`: Request logging.
    - `cookieParser`: Handling JWT in cookies.
    - `express-rate-limit`: Brute-force protection.

### 1.3 Communication (Nodemailer)
Centralized email service located in `backend/utils/emailService.js`.
- Pattern for sending emails:
  ```javascript
  import { sendEmail } from '../utils/emailService.js';
  await sendEmail({ to: 'user@example.com', subject: 'Subject', html: '<h1>Body</h1>' });
  ```

---

## 2. Frontend Patterns (React + Vite)

The frontend uses modern React 19 features with a focus on premium aesthetics and organized state.

### 2.1 Navigation & Routing
- **Library**: `react-router-dom` (v7).
- **Structure**: Protected routes check for authentication before rendering private dashboard components.

### 2.2 Form Handling
- **Library**: `react-hook-form`.
- **Standard Implementation**: Use the `register` and `handleSubmit` pattern to minimize re-renders and handle validation cleanly.
  ```javascript
  const { register, handleSubmit, formState: { errors } } = useForm();
  ```

### 2.3 User Feedback (Toast & Confirmation)
- **Toasts**: A custom `ToastContext` is used for non-blocking notifications.
    - **Hook**: `useToast()`
    - **Usage**: `showToast('Record saved', 'success', 3000);`
- **Confirmation**: A `ConfirmationModal` component handles destructive actions like deletions or major updates.

### 2.4 Styling & Aesthetics
The project uses a hybrid styling approach for maximum control:
1. **Global CSS (`index.css`)**: Contains the core design system, HSL color tokens, and universal utility classes.
2. **CSS Modules (`*.module.css`)**: used for component-level styles (encapsulation).
3. **Design Principles**: 
    - **Glassmorphism**: Subtle translucency and blurs for cards and overlays.
    - **Modern Shadows**: Soft, layered shadows for depth.
    - **Micro-animations**: Hover effects and smooth transitions using standard CSS.

### 2.5 Icons
- **Library**: `lucide-react`. Always use contextually relevant icons for intuitive UI navigation.

---

## 3. Directory Logic

- `backend/scripts/`: Contains `.sql` schema files and `run_setup.js` for database initialization.
---

## 3. Razorpay Integration Patterns

The project implements a resilient payment flow with built-in development fallbacks.

### 3.1 Backend: Secure Payments
- **SDK**: `razorpay` npm package.
- **Order Creation**: 
    - Amounts are converted to **paise** (Price * 100).
    - Returns `isMock: true` if API keys are missing, allowing development to continue without live keys.
- **Signature Verification**:
    - Uses `crypto` to create an HMAC-SHA256 hash.
    - Format: `razorpay_order_id + "|" + razorpay_payment_id`.
    - Verification: `expectedSignature === razorpay_signature`.
- **Test Mode**: Backend supports a `test_mode` flag to skip signature verification for automated testing or demo environments.

### 3.2 Frontend: Payment UI
- **SDK Loading**: Dynamically injects `https://checkout.razorpay.com/v1/checkout.js` on mount.
- **Initialization**:
    - Fetches `order_id` from the backend.
    - Uses `import.meta.env.VITE_RAZORPAY_KEY_ID` for the client-side key.
---

## 4. Global Middleware & Security Chain

The backend uses a standard stack of security and utility middleware in `app.js` to ensure every request is safe and parsed correctly.

- **Security (`helmet`)**: Sets various HTTP headers to protect against common attacks (XSS, clickjacking, etc.).
- **Logging (`morgan`)**: In development mode, logs all incoming requests for debugging.
- **Parsing**:
    - `cookieParser()`: Required to extract JWT tokens from secure cookies.
    - `express.json()`: Standardizes the `req.body` as a JSON object.
- **CORS**: Configured with `credentials: true` and an explicit `origin` to allow secure cross-domain requests between the Frontend (Vite) and Backend.

---

## 5. Frontend Layout & Navigation Pattern

The React application uses a **Layout-Wrapper** pattern to maintain UI consistency across the dashboard.

- **`DashboardLayout.jsx`**:
    - Acts as a "Master Page" containing the Sidebar and Main Header.
    - Uses `<Outlet />` from `react-router-dom` to dynamically render child pages while keeping the layout static.
- **Navigation (`NavLink`)**: Used in the sidebar to automatically apply an `active` class to the current menu item.
- **Global Concerns**: The layout component also monitors shared state, such as **Plan Expiry** alerts, and renders global confirmation modals (like the Sign Out prompt).

---

## 6. Admin vs. User Auth Isolation

To prevent security leaks, the project maintains a strict boundary between Administrative and Customer contexts.

- **Route Isolation**: Administrative endpoints are nested under `/api/admin` with their own set of protected routes.
- **Controller Separation**: Logic is isolated into `adminAuthController` and `userAuthController`.
- **Session Isolation**: Admin and Users are authenticated using different tokens or payload claims, ensuring an authenticated Customer cannot access Admin functions even if they know the URL.

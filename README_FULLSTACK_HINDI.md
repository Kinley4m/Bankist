# Bankist Full-Stack Version

Is project me maine backend add kiya hai:
- Node.js + Express server
- MongoDB database integration
- Real authentication (signup/login)
- JWT based protected routes
- API integration with frontend
- Deposit / Withdraw / Loan / Transfer actions
- Real dashboard page

## Folder Structure
- `backend/` -> Express + MongoDB backend
- `public/` -> Frontend files served by Express
- `public/auth.html` -> Login / Signup page
- `public/dashboard.html` -> Real dashboard page

## Setup Steps

### 1. Node modules install karo
```bash
cd backend
npm install
```

### 2. Environment file banao
`backend/.env` file create karo aur ye values daalo:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/bankist_app
JWT_SECRET=bankist_super_secret_key_123
```

### 3. MongoDB start karo
Agar MongoDB local installed hai to usse start karo.

### 4. Server run karo
```bash
cd backend
npm run dev
```
ya
```bash
npm start
```

### 5. Browser me open karo
```text
http://localhost:5000
```

## APIs
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/account/profile`
- `POST /api/account/deposit`
- `POST /api/account/withdraw`
- `POST /api/account/loan`
- `POST /api/account/transfer`

## Important Notes
- Signup ke baad automatic account number generate hota hai.
- Password bcrypt se hash hota hai.
- Login ke baad JWT token browser localStorage me store hota hai.
- Protected APIs me Bearer token use hota hai.

## Transfer Example
Receiver field me:
- recipient ka email de sakte ho
- ya recipient ka account number

## Loan Rule
Loan tab approve hoga jab amount account profile ke hisab se allowed ho.


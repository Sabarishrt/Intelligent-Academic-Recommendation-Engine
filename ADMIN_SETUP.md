# Admin Account Setup

## 🔐 Default Admin Credentials

The system includes a **predefined admin account** that is automatically created when the backend server starts.

### Login Details:
- **Email**: `admin@gmail.com`
- **Password**: `admin123`
- **Role**: `admin`

## ⚙️ How It Works

1. **Automatic Seeding**: When the backend server starts, it automatically checks if an admin user exists.
2. **Auto-Creation**: If no admin exists, it creates one with the credentials above.
3. **Password Security**: The password is automatically hashed using bcrypt before storage.
4. **No Registration Required**: Admin accounts **cannot** be registered through the registration endpoint.

## 🚀 Accessing Admin Dashboard

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```

3. Navigate to the login page and use:
   - Email: `admin@gmail.com`
   - Password: `admin123`

4. After successful login, you'll be automatically redirected to the Admin Dashboard.

## 🛡️ Security Features

### Role-Based Access Control (RBAC)

- **Admin Routes**: Protected with `protect` and `authorize('admin')` middleware
- **Student Routes**: Protected with `protect` and `authorize('student')` middleware
- **Cross-Access Prevention**: 
  - Students **cannot** access admin routes
  - Admins **cannot** access student-specific routes (but can view student data through admin routes)

### Admin Registration Prevention

- The registration endpoint (`POST /api/auth/register`) **rejects** any attempt to register with `role: 'admin'`
- All registrations are forced to `role: 'student'`
- The frontend registration form does not allow selecting admin role

## 📋 Admin Dashboard Features

Once logged in as admin, you have access to:

1. **Admin Dashboard** (`/admin/dashboard`)
   - System statistics
   - Recent students
   - Low performers overview

2. **Manage Students** (`/admin/students`)
   - View all registered students
   - View individual student details
   - View student marks and performance

3. **Manage Subjects** (`/admin/subjects`)
   - Create new subjects
   - Edit existing subjects
   - Delete subjects
   - View all subjects

4. **Analytics** (`/admin/analytics`)
   - Subject-wise performance statistics
   - Department distribution
   - Year-wise student distribution
   - Overall system analytics

## 🔧 Technical Implementation

### Files Modified/Created:

1. **`backend/config/seedAdmin.js`**
   - Contains the admin seeding logic
   - Runs automatically on server start

2. **`backend/config/db.js`**
   - Modified to call `seedAdmin()` after database connection

3. **`backend/controllers/authController.js`**
   - Modified `register` endpoint to prevent admin registration

4. **`frontend/src/pages/auth/Login.js`**
   - Added admin credentials hint on login page

5. **`frontend/src/pages/auth/Register.js`**
   - Removed admin option from registration form
   - Added note about admin accounts being pre-configured

### Database

The admin user is stored in the `users` collection with:
- `email`: "admin@gmail.com"
- `password`: (hashed with bcrypt)
- `role`: "admin"
- `name`: "System Administrator"

## 🧪 Testing Admin Access

1. **Login Test**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@gmail.com","password":"admin123"}'
   ```

2. **Access Admin Route** (with JWT token):
   ```bash
   curl -X GET http://localhost:5000/api/admin/dashboard \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

3. **Verify Role Protection**:
   - Try accessing `/api/admin/dashboard` with a student token → Should return 403
   - Try accessing `/api/students/marks` with an admin token → Should return 403

## ⚠️ Important Notes

1. **Change Default Password**: In production, change the default admin password immediately after first login.

2. **Environment Variables**: Ensure `JWT_SECRET` is set in your `.env` file for secure token generation.

3. **MongoDB Connection**: The admin seeding only works if MongoDB is connected. Check connection logs on server start.

4. **Single Admin**: The system checks for existing admin before creating. If admin exists, it won't recreate it.

## 🔄 Resetting Admin Account

If you need to reset the admin account:

1. Delete the admin user from MongoDB:
   ```javascript
   db.users.deleteOne({ email: "admin@gmail.com" })
   ```

2. Restart the backend server - it will automatically recreate the admin account.

---

**Note**: This admin account is for system administration only. All other users must register as students.

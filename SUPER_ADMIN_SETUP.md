# Super Admin Portal Setup

## Overview

The Super Admin Portal is designed for 2-3 people in the entire corporation who have full administrative control over the system.

## Super Admin Capabilities

✅ **Create Department Head** - Create new department heads with full department management access
✅ **Create Teams** - Create new teams within departments
✅ **Add Team Leaders** - Create new team leader accounts
✅ **Add Team Members** - Create new team member accounts
✅ **Move Staff Between Departments** - Transfer staff members between departments and teams
✅ **Remove/Disable Staff** - Disable or permanently delete staff accounts
✅ **Reset Passwords** - Reset passwords for any staff member

## Department Head Restrictions

Department Heads can:
- ✅ Promote worker to Leader
- ✅ Demote leader to worker
- ✅ Assign staff to teams
- ✅ Transfer workers within their department

Department Heads **CANNOT**:
- ❌ Register new employees (only Super Admin can create new staff accounts)
- ❌ They can only manage existing system users

## Team Leader & Team Member Restrictions

They can only:
- ✅ Login
- ✅ View tasks
- ✅ Update progress (leader)
- ✅ Execute tasks (member)

They **CANNOT**:
- ❌ Register new accounts (no registration allowed)

## Creating the Super Admin Account

### Method 1: Using the Script (Recommended)

1. Make sure MongoDB is running
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Run the script:
   ```bash
   npm run create-super-admin
   ```

   Or directly:
   ```bash
   node scripts/createSuperAdmin.js
   ```

### Method 2: Environment Variables

You can customize the Super Admin credentials by setting environment variables in `backend/.env`:

```env
SUPER_ADMIN_EMAIL=superadmin@municipalconnect.gov
SUPER_ADMIN_PASSWORD=SuperAdmin@2024
SUPER_ADMIN_NAME=Super Administrator
```

### Default Credentials

If no environment variables are set, the default credentials are:

- **Email:** `superadmin@municipalconnect.gov`
- **Password:** `SuperAdmin@2024`
- **Name:** `Super Administrator`

⚠️ **IMPORTANT:** Change the password after first login!

## Login Instructions

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Navigate to the login page: `http://localhost:3000/login`

4. Use the Super Admin credentials:
   - Email: `superadmin@municipalconnect.gov`
   - Password: `SuperAdmin@2024`

5. After login, you will be redirected to `/super-admin` dashboard

## Super Admin Dashboard Features

The Super Admin Dashboard includes the following tabs:

1. **Overview** - Statistics on departments, teams, and staff
2. **Create Dept Head** - Form to create new department heads
3. **Create Team** - Form to create new teams
4. **Add Leader** - Form to create new team leaders
5. **Add Member** - Form to create new team members
6. **Manage Staff** - 
   - Move staff between departments
   - Reset passwords
   - View all staff members
   - Disable/Delete staff accounts

## API Endpoints

All Super Admin endpoints are prefixed with `/api/super-admin` and require `super_admin` role:

- `GET /api/super-admin/staff` - Get all staff
- `GET /api/super-admin/teams` - Get all teams
- `GET /api/super-admin/departments` - Get all departments
- `POST /api/super-admin/create-dept-head` - Create department head
- `POST /api/super-admin/create-team` - Create team
- `POST /api/super-admin/add-team-leader` - Add team leader
- `POST /api/super-admin/add-team-member` - Add team member
- `PUT /api/super-admin/move-staff/:userId` - Move staff between departments
- `DELETE /api/super-admin/remove-staff/:userId` - Remove/disable staff
- `PUT /api/super-admin/reset-password/:userId` - Reset password

## Security Notes

1. **Only 2-3 people** should have Super Admin access in the entire corporation
2. Super Admin accounts should be created manually by system administrators
3. Regular admin accounts (`admin` role) have limited permissions compared to Super Admin
4. All Super Admin actions are logged for audit purposes
5. Department Heads cannot create new users - they can only manage existing users

## Troubleshooting

### Script fails to connect to MongoDB

Make sure MongoDB is running:
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
# or
mongod
```

### Super Admin already exists

If you see "Super Admin already exists", the account is already created. Use the displayed credentials to login.

### Forgot Super Admin password

You can reset the password by:
1. Connecting to MongoDB directly
2. Finding the Super Admin user
3. Updating the password hash
4. Or deleting the Super Admin and running the script again

## Next Steps

After creating the Super Admin account:

1. ✅ Login with Super Admin credentials
2. ✅ Create departments (if not already created)
3. ✅ Create Department Heads for each department
4. ✅ Create Team Leaders
5. ✅ Create Teams and assign leaders
6. ✅ Add Team Members to teams
7. ✅ Change the default Super Admin password

---

**Created:** $(date)
**Version:** 1.0.0


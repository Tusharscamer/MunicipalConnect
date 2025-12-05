# MunicipalConnect - Deployment Guide

## Pre-Deployment Checklist

### Backend Requirements
- [x] Node.js 18+ installed
- [x] MongoDB database configured
- [x] Environment variables set
- [x] JWT_SECRET configured
- [x] File upload directory created
- [x] All dependencies installed

### Frontend Requirements
- [x] Node.js 18+ installed
- [x] Environment variables set
- [x] API URL configured
- [x] All dependencies installed

## Environment Setup

### Backend (.env)
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb://your-mongodb-uri
JWT_SECRET=your-strong-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-domain.com
UPLOAD_DIR=./uploads
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-api.com/api
VITE_NODE_ENV=production
```

## Installation Steps

### Backend
```bash
cd backend
npm install
npm run seed:departments  # Seed initial departments
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run build
npm run preview  # Or deploy to hosting service
```

## Database Setup

1. Ensure MongoDB is running
2. Run department seed script: `npm run seed:departments`
3. Create admin user via API or directly in database

## Production Considerations

1. **Security**
   - Use strong JWT_SECRET
   - Enable HTTPS
   - Configure CORS properly
   - Set secure cookie flags if using cookies

2. **File Storage**
   - Consider using cloud storage (S3, Cloudinary) for uploads
   - Configure proper file size limits

3. **SMS/OTP Service**
   - Integrate with production SMS gateway
   - Update `backend/src/services/otpService.js`

4. **Aadhaar Verification**
   - Integrate with Aadhaar API
   - Update verification logic

5. **Monitoring**
   - Set up error logging
   - Monitor SLA breaches
   - Set up health checks

## API Endpoints Summary

### Authentication
- POST `/api/auth/register` - Register citizen
- POST `/api/auth/login` - Login
- POST `/api/auth/send-otp` - Send OTP
- POST `/api/auth/verify-otp` - Verify OTP
- GET `/api/auth/me` - Get profile

### Requests
- GET `/api/requests` - Get requests (filtered by role)
- POST `/api/requests` - Create request
- GET `/api/requests/:id` - Get request details
- POST `/api/requests/:id/validate` - Validate (Dept Head)
- POST `/api/requests/:id/assign` - Assign to Team Leader
- POST `/api/requests/:id/tasks` - Create task (Team Leader)
- POST `/api/requests/:id/completion` - Submit completion
- POST `/api/requests/:id/verify` - Verify completion (Dept Head)

### Analytics
- GET `/api/analytics/department` - Department analytics
- GET `/api/analytics/reports?period=daily|weekly|monthly` - Reports
- GET `/api/analytics/heatmap` - GIS heatmap
- GET `/api/analytics/sla-breaches` - SLA breach report
- GET `/api/analytics/team-ranking` - Team performance ranking

### Admin
- GET `/api/admin/dashboard` - Admin dashboard
- GET `/api/admin/users` - Get all users
- PUT `/api/admin/users/:id/role` - Update user role
- PUT `/api/admin/users/:id/status` - Enable/disable user
- POST `/api/admin/departments` - Create department
- GET `/api/admin/audit-logs` - Get audit logs

### SLA
- GET `/api/sla/request/:requestId` - Check request SLA
- GET `/api/sla/breaches` - Get all breaches
- GET `/api/sla/hours?serviceType=...` - Get SLA hours

### Teams
- GET `/api/teams/recommendations/:teamId` - Get recommended members
- POST `/api/teams` - Create team
- GET `/api/teams/my-teams` - Get my teams

## Health Check
- GET `/health` - Server health status

## Features Implemented

✅ All Actor Features
✅ User Authentication (with OTP support)
✅ Request Lifecycle Management
✅ Team Structure & Assignment
✅ SLA Monitoring & Escalation
✅ Analytics & Reports
✅ Admin Capabilities
✅ Privacy Protection (Team member names hidden from citizens)
✅ Time Logging
✅ Cost Tracking
✅ Skill-based Recommendations

## Known Limitations

1. OTP service currently logs to console (integrate SMS gateway for production)
2. Aadhaar verification requires external API integration
3. File uploads stored locally (consider cloud storage for production)
4. Notification service stubbed (implement for production)


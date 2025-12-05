# MunicipalConnect - E-Governance Platform

A comprehensive municipal service request management system with role-based access control, SLA monitoring, and analytics.

## Features

### ✅ User Authentication
- Citizen registration with mobile OTP (optional)
- Aadhaar eKYC support (optional, requires admin verification)
- Role-based access control (RBAC)
- Staff accounts created by Admin only

### ✅ Citizen Features
- Create requests with description, address, GPS location, category, photos/videos
- Auto-check for similar requests (keywords + GPS proximity)
- Choose to submit new request or support existing
- Dashboard with: pending, in-progress, completed, rejected requests
- Rate and provide feedback after completion
- Privacy: Cannot see worker names, only Team Name/ID

### ✅ Department Head Features
- View all new requests filtered by department
- Auto-suggested duplicates with one-click merge
- Validate requests (mark valid/invalid)
- Assign valid requests to Team Leaders
- Track request status throughout lifecycle
- Verify completed tasks (approve/rework)
- Analytics dashboard:
  - Number of requests
  - SLA compliance
  - Team performance
  - Category trends
- Manage teams (create, add leader, add/remove members)

### ✅ Team Leader Features
- Receive assigned requests from Department Head
- Create task plans (title, description, estimated time, required workers)
- Assign team members to tasks
- Update task progress (Not Started, In Progress, Completed)
- Upload work evidence (images, videos, cost, materials)
- Submit completed work for approval
- Dashboard: assigned requests, deadlines, team member status, pending verification

### ✅ Team Member Features
- Login and view only tasks assigned to them
- View task details (description, location, instructions, deadline)
- Mark personal work as done
- Cannot choose tasks or interact with citizens
- Names hidden from public (only visible to Head and Leader)

### ✅ Request Lifecycle
- Created → Submitted
- Duplicate check → Similar requests suggested
- Validated/Rejected → Department Head decision
- Assigned → To Team Leader
- Working → Team Leader assigns workers
- Work Completed → Evidence uploaded
- Verification → Department Head checks
- Approved → Request closed
- Rejected → Returned for rework
- Citizen Feedback → After approval

### ✅ Data Tracking
- Request ID, Citizen ID, Category
- Address + GPS coordinates
- Description, Images/Videos
- Status tracking
- Assigned Team Leader & Team
- Time logs (created, validated, assigned, working start, completed, verified)
- Cost estimate
- Completion media

### ✅ Team Structure
- Department Head manages multiple teams
- Each team has: one Team Leader, one or more Team Members
- Team Members have: skills, availability, shift timing

### ✅ Work Assignment
- Department Head → assigns to Team Leader
- Team Leader → assigns workers based on skill match
- Auto-recommendation system (skill + availability)
- Team Member → executes assigned tasks

### ✅ SLA (Service Level Agreement)
- Category-specific time limits (e.g., Pothole: 48h, Streetlight: 24h, Waste: 4h)
- Auto-escalation to Department Head on breach
- SLA monitoring and reporting

### ✅ Analytics & Reports
- Daily/weekly/monthly reports
- GIS-based heatmap of requests
- SLA breach count
- Most common complaint types
- Team performance ranking
- Average time taken per category
- Citizen satisfaction rating

### ✅ Admin Capabilities
- Role & permission management
- Manage departments
- Manage categories
- Create/modify teams
- Disable users
- Examine audit logs

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Multer (File Uploads)

### Frontend
- React + Vite
- Tailwind CSS
- Axios
- React Router

## Installation

### Backend
```bash
cd backend
npm install
cp .env.example .env  # Configure environment variables
npm run seed:departments  # Seed initial departments
npm start
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env  # Configure API URL
npm run dev  # Development
npm run build  # Production build
```

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb://localhost:27017/municipalconnect
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## API Documentation

See `DEPLOYMENT.md` for complete API endpoint documentation.

## Project Structure

```
MunicipalConnect/
├── backend/
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Auth, validation
│   │   └── utils/        # Utilities
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/        # React pages
│   │   ├── components/   # Reusable components
│   │   ├── services/     # API services
│   │   └── context/      # React context
│   └── package.json
└── docs/                 # Documentation
```

## Deployment

See `DEPLOYMENT.md` for detailed deployment instructions.

## License

[Your License Here]


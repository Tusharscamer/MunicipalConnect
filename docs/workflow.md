## MunicipalConnect Workflow Specification

This document translates the handwritten requirements into actionable behaviours for the platform. Each numbered clause below corresponds to the user’s notes (pages 1‑6).

### 1. Onboarding & Authentication
1. Citizens register with eKYC to ensure authenticity.
2. Every user specifies their role: `citizen`, `dept_head`, `team_leader`, or `team_member`. (Other legacy roles like `admin` remain for platform ops.)

### 2. Request Submission & Pre‑Validation
3. Citizen submits a detailed request, selecting the department it belongs to.
4. Immediately after submission, run the uniqueness check (see §5) to warn about duplicates before finalising.
5. Store metadata: address, description, category/department, status (valid/invalid), attachments (images/video), registration date, deadline, completion date, requester info.
6. List similar requests (based on keywords/address/lat/long) beside the submission form so the citizen can support existing ones instead of creating a new ticket.
7. Department head may merge similar requests when appropriate, producing a parent request with grouped sub‑requests for reference.
8. Merging UI should show brief info for each grouped request.

### 3. Validation Flow (Department Head)
9. Department head sees the queue with similarity suggestions in a sidebar.
10. Support system shows trending/most‑supported requests on the dashboard.
11. Department head performs physical/remote inspection. If found invalid, label as `invalid` and notify the citizen (warning message). Otherwise mark `valid` and continue.
12. Once valid, the request moves forward to assignment.
13. Department head assigns the validated request to one of the team leaders in their department.
14. Until assignment happens, request remains `pending`.

### 4. Execution Flow (Team Leader & Members)
15. After receiving assignment, the team leader analyses the request and breaks it into tasks. The request status becomes `working`.
16. Team leader selects members for individual tasks, with deadlines and notes.
17. Members work on assigned tasks and update progress (e.g., `in_progress`, `blocked`, `completed`).
18. When members finish, the team leader marks the overall request `completed_on_site`, attaching completion evidence (photos/videos, money spent, time taken, member names).

### 5. Verification & Closure
19. Department head verifies the completed work:
    - If accepted, the request becomes `completed`, the citizen is notified, and comments/ratings are enabled.
    - If rejected, it returns to the team leader with required rework instructions (status `rework_required`), looping back to step 15.
20. Once fully accepted, the request enters `closed` state. Citizen can leave comments/feedback.
21. Completed requests appear in the completion log with registered/completion times and resources used.
22. After closure, the public portal shows the completion summary (including attachments uploaded by the team leader).

### 6. Support & Duplicates (Already implemented but reiterated)
- Citizens can support other requests but **cannot** support their own submissions.
- Trending section is ordered by `supportCount`.
- Similarity check is available during submission and for department head review.

### Status Diagram
```
Citizen submits -> Department Head (validate)
    -> invalid -> notify citizen (end)
    -> valid -> assign to Team Leader -> Team Members work
       -> Team Leader marks completed -> Department Head reviews
           -> rejected -> back to Team Leader (rework)
           -> accepted -> citizen comment -> closed
```

### Data Model Extensions (to be implemented)
- `Request` additions:
  - `validationStatus`: `pending`, `valid`, `invalid`
  - `assignment`: team leader ID, assignedAt, deadlines
  - `tasks`: array with member, description, status, timestamps
  - `verification`: status, verifiedBy, notes, attachments
  - `completion`: timeTaken, cost, evidence media, memberNames
- `Department`: head, teams, metadata (existing file already outlines structure but needs usage).
- Optional `Task` model for auditing per‑member activities.

### Next Steps
1. Update schemas (`Request`, `Department`, optional `Task`).
2. Implement role‑based endpoints:
   - Department head queue, validate, merge, assign.
   - Team leader dashboard, task creation, completion upload.
   - Team member task updates.
   - Verification endpoints.
3. Expand frontend dashboards for each role per requirements above.
4. Wire citizen feedback/comments post completion.


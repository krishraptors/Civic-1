# Civic Report Backend (Node + Express + MongoDB)

## What this backend provides
- User registration & login (JWT).
- Citizens can create complaints with photos and location (lat/lng + address).
- Complaints have statuses: Pending, In Progress, Resolved, Rejected.
- Admin/Authority endpoints to list, assign, change status, and comment on complaints.
- Public search API for complaints (supports status, category, simple geofilter).
- Simple rule-based chatbot endpoint to query complaint status.
- Email push notification scaffolding (nodemailer).
- Web-push scaffolding (optional) for browser push notifications.

## Setup
1. Clone or create a directory and copy files as in the repo structure.
2. Run:
   ```bash
   npm install

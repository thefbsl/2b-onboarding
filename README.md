# EQ Onboarding (User Guide)
 
EQ Onboarding is a role-based onboarding workflow for candidates and internal teams (HR, IT, Finance, Admin). Candidates submit application details and track status while internal teams review and approve in stages.

Live demo: https://2b-onboarding.netlify.app/
 
 ## Roles and permissions
 
 - **Candidate**
   - Can login and submit onboarding details (name, phone, bank details, documents).
   - Can view current application status.
   - Can re-edit and resubmit only if HR rejected the application.
 - **HR**
   - Sees all pending applications.
   - Approves or rejects a candidate (rejection requires a comment).
 - **IT**
   - Sees candidates after HR approval.
   - Issues a corporate email to complete IT approval.
 - **Finance**
   - Sees candidates after HR approval.
   - Verifies documents and bank details.
 - **Admin**
   - Sees all candidates and all approval states.
   - Read-only overview (no approve actions in UI).
 
 ## Run the app locally
 
 ### 1) Server
 
 ```bash
 cd server
 npm install
 npm run dev
 ```
 
 Server runs on `http://localhost:5050` by default.
 
 ### 2) Client
 
 ```bash
 cd client
 npm install
 npm run dev
 ```
 
 Client runs on `http://localhost:5173` by default.
 
 ## Environment variables
 
 Create `client/.env` (or export in your shell):
 
 ```
 VITE_API_URL=http://localhost:5050
 ```
 
 Server environment variables (optional):
 
 - `MONGO_URI` (default is a bundled MongoDB Atlas connection string)
 - `DEFAULT_PASSWORD` (default `demo123!`)
 - `PORT` (default `5050`)
 
 ## Login details
 
 ### Candidate login
 
 - Select **Candidate** on the login screen.
 - Enter email and password.
 - If the email does not exist, the account is auto-created.
 - After login, you will land on the **Candidate Portal**.
 
 ### Internal roles (seeded users)
 
 On server startup, default users are created if none exist:
 
 - HR: `hr@eq.kz`
 - IT: `it@eq.kz`
 - Finance: `finance@eq.kz`
 - Admin: `admin@eq.kz`
 
 Use the `DEFAULT_PASSWORD` value to sign in (default is `demo123!`).
 
 ## Status flow
 
 - **Pending**: candidate submitted and awaits HR review
 - **In Progress**: HR approved and IT/Finance actions in progress
 - **Accepted**: HR + IT + Finance all approved
 - **Rejected**: HR rejected with feedback (candidate can re-edit and resubmit)
 
 ## Common pages
 
- `http://localhost:5173/login` - role selection and login
- `http://localhost:5173/candidate` - candidate portal
- `http://localhost:5173/hr` - HR dashboard
- `http://localhost:5173/it` - IT dashboard
- `http://localhost:5173/finance` - Finance dashboard
- `http://localhost:5173/admin` - Admin overview

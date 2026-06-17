# MAM Industries — Lead CRM

A full-stack React + Express.js + PostgreSQL lead relationship manager for MAM Industries.

## Project Structure

```
mam-crm-app/
├── backend/            # Express.js backend API
│   ├── src/
│   │   ├── config/     # DB configuration
│   │   ├── index.js    # Express routes and server setup
│   │   └── db-init.js  # Schema creation and seeding script
│   └── .env
├── frontend/           # React + Vite frontend SPA
│   ├── src/
│   │   ├── components/ # Dashboard, Leads, Scripts, Notes, Conversion
│   │   ├── App.jsx     # Main workspace orchestrator
│   │   └── index.css   # Theme and typography
│   └── vite.config.js
└── schema.sql          # DB Schema definitions
```

## Running the Application

### 1. Database Setup
The app connects to PostgreSQL using the connection string configured in `.env` files. Ensure PostgreSQL is running and the credentials match.

By default, the backend will automatically:
- Connect to the DB
- Create `leads` and `notes` tables if they do not exist
- Seed them with sample data if they are empty

### 2. Run the Backend
Go to the `backend` folder and run the development command:
```bash
cd backend
npm run dev
```
The backend API will start on [http://localhost:5001](http://localhost:5001).

### 3. Run the Frontend
Go to the `frontend` folder and run the dev server:
```bash
cd frontend
npm run dev
```
The React frontend app will be accessible at [http://localhost:3001](http://localhost:3001).

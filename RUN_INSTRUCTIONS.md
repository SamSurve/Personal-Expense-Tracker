# Local Setup & Run Instructions

To run the Personal Expense Tracker locally, you need to configure the MySQL database and start both the Java backend and the Next.js frontend.

## Prerequisites
- **Java Development Kit (JDK) 8 or higher** installed and added to your system PATH.
- **Node.js (14+)** installed.
- **MySQL Server** installed and running.

## 1. Database Setup
1. Open your MySQL client (e.g., MySQL Workbench, DBeaver, or command line).
2. Run the SQL script located at `backend/schema.sql` to create the `expense_tracker_db` database and all necessary tables manually if desired.
   *Note: The Core Java backend also automatically initializes and verifies all required tables (`users`, `spending_profile`, `budgets`, `expenses`) on startup via `DatabaseInitializer` if they do not exist.*

## 2. Java Backend Configuration
1. **Download the MySQL JDBC Driver**:
   - Download the MySQL Connector/J `.jar` file (e.g., `mysql-connector-j-8.x.x.jar`) from the [official MySQL website](https://dev.mysql.com/downloads/connector/j/).
   - Create a `lib` folder inside the `backend` directory (`backend/lib/`).
   - Place the downloaded `.jar` file inside this `lib` folder.
2. **Update Database Credentials**:
   - Open `backend/src/com/expensetracker/util/DatabaseConnection.java`.
   - Update the `USER` and `PASSWORD` constants to match your local MySQL credentials. The default is `root` / `root`.

## 3. Frontend Setup
1. Open a terminal in the project root.
2. Run `npm install` to install all Next.js dependencies.

## 4. Running the Application
We have provided a convenient Windows batch script to compile the backend, start the API server, and launch the frontend development server all at once.

Double-click the `start.bat` file in the project root, or run it from the terminal:
```cmd
.\start.bat
```

- The script will compile the Java code to `backend/bin/`.
- It will open a new terminal window running the Core Java HTTP API on `http://localhost:8080`.
- It will start the Next.js frontend in the current terminal window on `http://localhost:3000`.

**Note:** The first time you run `start.bat`, it will check if you placed the MySQL driver in `backend/lib`. If it's missing, the script will pause and ask you to download it first.

## 5. Vercel Production Deployment (Firebase Authentication + Cloud Firestore)
In production on Vercel, the application operates serverlessly using the Firebase Web SDK (Firebase Authentication & Cloud Firestore):
1. Import the repository into **Vercel**.
2. Add your Firebase Web App configuration in Vercel **Settings -> Environment Variables**:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
3. Apply the security rules located in `firestore.rules` inside your Firebase Console (Firestore -> Rules).
4. Deploy! Authentication and data persistence operate seamlessly via Firebase with full per-user data isolation.
5. The academic Core Java + JDBC + MySQL backend remains completely intact in `backend/` for local evaluation.

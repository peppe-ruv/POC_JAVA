# Full-Stack Web Application with Angular and Node.js

This project is a full-stack web application featuring an Angular frontend and a Node.js (Express) backend with a PostgreSQL database. It includes HMAC verification for pre-filling forms and an assistance request submission system.

## 1. Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js:** Version 18.x (as specified in `package.json` files)
*   **npm (Node Package Manager):** Usually comes with Node.js (e.g., npm 9.x or later)
*   **Angular CLI:** Version 17.x (used for frontend development, installed via `npx` if not global)
*   **PostgreSQL Server:** A running instance of PostgreSQL.

## 2. Setup Instructions

### 2.1. Clone the Repository

```bash
git clone <your-repository-url>
cd <repository-name>
```

### 2.2. Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Configure Environment Variables:**
    *   Copy the example `.env.example` file to a new file named `.env`:
        ```bash
        cp .env.example .env
        ```
    *   Open `.env` and fill in your specific environment variables:
        *   `SECRET_KEY`: A strong secret key for HMAC generation (e.g., `openssl rand -hex 32`).
        *   `DB_USER`: Your PostgreSQL username.
        *   `DB_PASSWORD`: Your PostgreSQL password.
        *   `DB_HOST`: Database host (e.g., `localhost`).
        *   `DB_PORT`: Database port (e.g., `5432`).
        *   `DB_DATABASE`: The name for your database.

3.  **Install Dependencies:**
    ```bash
    npm install
    ```

4.  **Initialize the Database:**
    *   Ensure your PostgreSQL server is running.
    *   Connect to your PostgreSQL server (e.g., using `psql` or a GUI tool like pgAdmin).
    *   Create the database you specified in the `.env` file (e.g., `CREATE DATABASE your_db_name;`).
    *   Run the SQL initialization script located in the `database/` directory. From the `backend/` directory, you can run:
        ```bash
        psql -U YOUR_DB_USER -d YOUR_DB_DATABASE -f ../database/init.sql
        ```
        Replace `YOUR_DB_USER` and `YOUR_DB_DATABASE` with the actual username and database name you configured in your `.env` file. You will be prompted for `YOUR_DB_USER`'s password.

5.  **(Optional) Insert Sample Data for `c_number_data` Testing:**
    *   To test the HMAC verification and form pre-filling, you'll need a valid HMAC and corresponding data in the `c_number_data` table.
    *   The backend uses the string `'test-string'` and your `SECRET_KEY` to generate HMACs (SHA256).
    *   You can generate an HMAC using Node.js, an online tool, or the following example (ensure you use your actual `SECRET_KEY`):
        ```javascript
        // Example in Node.js to generate an HMAC:
        const crypto = require('crypto');
        const secret = 'YOUR_SECRET_KEY_FROM_DOT_ENV'; // Use your actual secret key
        const dataToSign = 'test-string';
        const hmac = crypto.createHmac('sha256', secret).update(dataToSign).digest('hex');
        console.log(hmac);
        // Example payload: {"name": "Test User", "email": "test@example.com", "message": "Hello pre-fill!"}
        ```
    *   Then, insert this into your PostgreSQL database:
        ```sql
        INSERT INTO c_number_data (hmac_value, data_payload) VALUES
        ('YOUR_GENERATED_HMAC_HEX_STRING', '{"name": "Test User", "email": "test@example.com", "message": "This is a pre-filled message."}');
        ```

### 2.3. Frontend Setup

1.  **Navigate to the frontend Angular app directory:**
    ```bash
    cd ../frontend/mini-web-app
    ```
    (If you are already in `backend/`, use `cd ../frontend/mini-web-app`. If in the root, use `cd frontend/mini-web-app`)

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

## 3. Running the Application Locally

### 3.1. Start the Backend Server

1.  Navigate to the `backend/` directory.
2.  Run the start script:
    ```bash
    npm start
    ```
    The backend server should start, typically on `http://localhost:3000`.

### 3.2. Start the Frontend Angular App

1.  Navigate to the `frontend/mini-web-app/` directory.
2.  Run the start script (which uses `ng serve`):
    ```bash
    npm start
    ```
    The Angular development server will start, typically on `http://localhost:4200`. It is configured to proxy API requests starting with `/api` to the backend server (`http://localhost:3000`).

### 3.3. Accessing the App

1.  Open your web browser and go to `http://localhost:4200/`.
2.  To test the HMAC verification feature, you need a `c_number` (which is the HMAC hex string). If you inserted sample data as per step 2.2.5, use the HMAC you generated.
    For example: `http://localhost:4200/?c_number=YOUR_GENERATED_HMAC_HEX_STRING`
    This should load the home page and pre-fill data based on the `data_payload` associated with that HMAC in the database.

## 4. Deployment to Heroku

These instructions assume you have a Heroku account and the Heroku CLI installed and configured.

1.  **Log in to Heroku (if you haven't already):**
    ```bash
    heroku login
    ```

2.  **Create a new Heroku app:**
    ```bash
    heroku create your-unique-app-name
    ```
    Replace `your-unique-app-name` with a unique name for your application.

3.  **Provision a Heroku Postgres Add-on:**
    ```bash
    heroku addons:create heroku-postgresql:hobby-dev -a your-unique-app-name
    ```
    This command provisions a PostgreSQL database and automatically sets the `DATABASE_URL` environment variable in your Heroku app's configuration.

4.  **Set Essential Environment Variables on Heroku:**
    *   **SECRET_KEY:** This is crucial for HMAC generation and verification.
        ```bash
        heroku config:set SECRET_KEY="your_strong_production_secret_key" -a your-unique-app-name
        ```
        Replace `your_strong_production_secret_key` with a secure, randomly generated key.
    *   **NODE_ENV (Optional but Recommended):** Heroku usually sets this to `production` by default. If you need to ensure it:
        ```bash
        heroku config:set NODE_ENV="production" -a your-unique-app-name
        ```
    *   The backend is configured to use `DATABASE_URL` when available (which Heroku provides), so `DB_USER`, `DB_PASSWORD`, etc., are not typically needed on Heroku unless `DATABASE_URL` is not set by an add-on.

5.  **Deploy the Application to Heroku:**
    Ensure your code changes (including `Procfile`, updated `package.json` files, and `server.js`) are committed to your Git repository.
    ```bash
    git push heroku main
    ```
    (Or `git push heroku your-branch-name:main` if you are on a different branch).
    Heroku will use the `heroku-postbuild` script in `backend/package.json` to build the Angular frontend and prepare the application.

6.  **Open Your Application:**
    After successful deployment, you can open your app in the browser:
    ```bash
    heroku open -a your-unique-app-name
    ```
    You might need to manually run the database initialization if your Heroku app doesn't do it automatically (e.g., via a Heroku release phase script, which is not configured in this project). For this setup, you might need to connect to your Heroku Postgres instance and run the `init.sql` script manually if the tables are not created:
    ```bash
    heroku pg:psql -a your-unique-app-name < database/init.sql
    ```

## 5. API Endpoints (Informational)

*   **`POST /api/verify-hmac`**
    *   Expects JSON body: `{ "c_number": "some_hmac_string" }`
    *   Verifies the `c_number` (HMAC) against a predefined string ('test-string') and the `SECRET_KEY`.
    *   If valid and found in `c_number_data` table, returns the associated `data_payload`.
*   **`POST /api/assistance-request`**
    *   Expects JSON body: `{ "name": "User Name", "email": "user@example.com", "issue_description": "Details about the issue." }`
    *   Saves the assistance request to the `assistance_requests` table.

---
This README provides a comprehensive guide to setting up, running, and deploying the application.
## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Python:** Version 3.8 or higher.
- **pip:** Python package installer (usually comes with Python).
- **Node.js:** Version 18.x or higher.
- **npm:** Node package manager (usually comes with Node.js). You can also use `yarn`, `pnpm`, or `bun`.

## Backend Setup (FastAPI)

1.  **Navigate to the Backend Directory:**

    ```bash
    cd backend
    ```

2.  **Create and Activate a Virtual Environment:**

    - **Windows (Command Prompt):**
      ```bash
      python -m venv venv
      .\venv\Scripts\activate
      ```
    - **Windows (PowerShell):**
      ```powershell
      python -m venv venv
      .\venv\Scripts\Activate.ps1
      ```
      _(Note: You might need to adjust your execution policy: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process`)_
    - **macOS / Linux (Bash):**
      ```bash
      python3 -m venv venv
      source venv/bin/activate
      ```

3.  **Install Dependencies:**
    _(Assuming you have a `requirements.txt` file in the `backend` directory)_

    ```bash
    pip install -r requirements.txt
    ```

    _(If you don't have a `requirements.txt`, you'll need to create one based on the imports in your Python files, e.g., `fastapi`, `uvicorn`, `sqlalchemy`, `psycopg2-binary`, `python-jose[cryptography]`, `passlib[bcrypt]`, `python-multipart`, `alembic`, `python-dotenv`)_

4.  **Configure Database:**

    - The application uses a PostgreSQL database. The connection URL is configured via the `DATABASE_URL` environment variable.
    - The default development connection string points to a NeonDB instance (as seen in `backend/app/db/database.py` line 6 and `backend/app/database.py` line 8-9).
    - **Set the Environment Variable:**
      - You can set this variable in your shell before running the application:
        - **Windows (Command Prompt):**
          ```bash
          set DATABASE_URL="postgresql://user:password@host:port/dbname"
          ```
        - **Windows (PowerShell):**
          ```powershell
          $env:DATABASE_URL="postgresql://user:password@host:port/dbname"
          ```
        - **macOS / Linux (Bash):**
          ```bash
          export DATABASE_URL="postgresql://user:password@host:port/dbname"
          ```
      - Alternatively, create a `.env` file in the `backend/app` directory with the following content:
        ```text:.env
        DATABASE_URL="postgresql://user:password@host:port/dbname"
        ```
        _(Replace the example URL with your actual database connection string. Uvicorn should pick this up if `python-dotenv` is installed, based on the configuration check in `backend/venv/Lib/site-packages/uvicorn/config.py` lines 323-327)_

5.  **Run Database Migrations:**

    - The project uses Alembic for database migrations (configured in `backend/app/alembic.ini` and `backend/app/migrations/env.py`).
    - Apply the latest migrations to set up your database schema:

    ```bash
    alembic upgrade head
    ```

    _(Make sure you are in the `backend` directory where `alembic.ini` is located, or adjust the command/configuration if needed)_

6.  **Run the Backend Server:**
    - Navigate to the directory containing `main.py`:
      ```bash
      cd app
      ```
    - Start the Uvicorn server (as defined in `backend/app/main.py` line 36):
      ```bash
      uvicorn main:app --host 0.0.0.0 --port 8000 --reload
      ```
    - The backend API should now be running at `http://localhost:8000`. The `--reload` flag enables auto-reloading on code changes, which is useful for development.

## Frontend Setup (Next.js)

1.  **Navigate to the Frontend Directory:**

    ```bash
    cd frontend
    ```

    _(If you were in `backend/app`, you'll need to go up two levels first: `cd ../../frontend`)_

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

    _(Or `yarn install`, `pnpm install`, `bun install`)_

3.  **Configure Environment Variables (Optional):**

    - For development, the frontend automatically connects to the backend at `http://localhost:8000` (as seen in `frontend/src/services/auth.ts` lines 8-15).
    - For production builds, you might need to create a `.env.local` file in the `frontend` directory and set the backend API URL:
      ```text:.env.local
      NEXT_PUBLIC_API_URL=https://your-production-api-url.com
      ```

4.  **Run the Frontend Development Server:**

    ```bash
    npm run dev
    ```

    _(Or `yarn dev`, `pnpm dev`, `bun dev` - based on `frontend/package.json` line 6)_

5.  **Access the Frontend:**
    - Open your web browser and navigate to `http://localhost:3000` (as mentioned in `frontend/README.md` line 17).

## Running the Full System

To run the complete application:

1.  Start the backend server (steps 1-6 in Backend Setup).
2.  Start the frontend development server (steps 1-4 in Frontend Setup).
3.  Access the application through your browser at `http://localhost:3000`.

The frontend will make requests to the backend API running on `http://localhost:8000`.

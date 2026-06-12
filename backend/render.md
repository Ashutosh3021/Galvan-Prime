# Render Deployment Guide for GalvanR.A.G Backend

This guide provides step-by-step instructions for deploying the GalvanR.A.G Python backend on Render.

## Backend Overview
- **Framework**: FastAPI
- **Entry Point**: `backend/main.py`
- **Dependency File**: `backend/requirements.txt`
- **Configuration**: Pydantic settings loaded from environment variables

## Render Service Configuration

### Build Command
Render automatically installs dependencies from `requirements.txt` using `pip install -r requirements.txt`. No additional build steps are required.

> **Note**: If you prefer to explicitly set a build command, you can use:
> ```
> pip install -r requirements.txt
> ```
> However, leaving this blank (default) is sufficient.

### Start Command
```
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Environment Variables
Set the following environment variables in the Render dashboard under the service's **Environment** section:

| Variable | Required | Description | Example/Notes |
|----------|----------|-------------|---------------|
| `DATABASE_URL` | Yes | PostgreSQL database URL (asyncpg driver) | `postgresql+asyncpg://user:password@host:port/dbname` |
| `SECRET_KEY` | Yes | Secret key for JWT token generation (min 16 chars) | Generate with: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ENVIRONMENT` | No | Application environment | `development` or `production` (default: `development`) |
| `LOG_LEVEL` | No | Logging level | `INFO`, `DEBUG`, etc. (default: `INFO`) |
| `GEMINI_API_KEY` | No | API key for Google Gemini LLM | Get from [Google AI Studio](https://aistudio.google.com/) |
| `OPENAI_API_KEY` | No | API key for OpenAI LLM (optional fallback) | Get from [OpenAI](https://platform.openai.com/api-keys) |
| `PINECONE_API_KEY` | No | API key for Pinecone vector store | Get from [Pinecone](https://www.pinecone.io/) |
| `PINECONE_ENVIRONMENT` | No | Pinecone environment | e.g., `us-west1-gcp` |
| `CHROMA_PERSIST_DIR` | No | Directory for ChromaDB persistent storage | `./chroma_db` (default) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | Access token expiration time in minutes | Default: `30` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | No | Refresh token expiration time in days | Default: `7` |

> **Important**: 
> - The `DATABASE_URL` must use the `asyncpg` driver (as specified in `requirements.txt` and `config.py`).
> - For Render's managed PostgreSQL, you can use the internal database connection string provided by Render.
> - Always use strong, randomly generated secrets for `SECRET_KEY`.

## Step-by-Step Deployment Process

1. **Fork/Clone Repository**
   - Ensure your code is in a GitHub, GitLab, or Bitbucket repository that Render can access.

2. **Create Render Web Service**
   - Log in to [Render](https://render.com) and click **New +** → **Web Service**.
   - Connect your repository and select the branch to deploy.

3. **Configure Service**
   - **Name**: Choose a name for your service (e.g., `galvanrag-backend`).
   - **Region**: Select your preferred region.
   - **Branch**: `main` (or your default branch).
   - **Root Directory**: `/backend` (important: set this to the backend folder).
   - **Build Command**: Leave blank (or set to `pip install -r requirements.txt`).
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment**: Python 3.11 or higher (select from available versions).

4. **Set Environment Variables**
   - In the **Environment** section, add each variable from the table above.
   - For sensitive values (like API keys and secrets), use the **Secret** type.

5. **Enable Health Checks (Optional but Recommended)**
   - Render automatically checks the root path (`/`). Our API has a health endpoint at `/` that returns `{"status": "ok"}`.

6. **Deploy**
   - Click **Create Web Service**. Render will clone your repo, install dependencies, and start the service.

7. **Verify Deployment**
   - Once deployed, visit the service URL (provided by Render) to see the FastAPI docs at `/docs`.
   - Health check: `GET /` should return `{"status": "ok", "version": "1.0.0"}`.

## Troubleshooting Tips

### Common Issues and Solutions

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| **Service fails to start** | Missing `DATABASE_URL` or invalid format | Ensure `DATABASE_URL` is set and uses `asyncpg` driver (e.g., `postgresql+asyncpg://...`). |
| **Authentication errors** | Weak or missing `SECRET_KEY` | Set `SECRET_KEY` to a random string of at least 16 characters (32+ recommended). |
| **Module not found errors** | Dependencies not installed | Verify `requirements.txt` is in the root directory (`/backend`) and that Render is installing from it. Check build logs for pip errors. |
| **Port binding errors** | Not using `$PORT` in start command | Ensure start command includes `--port $PORT` (Render automatically sets the `$PORT` environment variable). |
| **Slow first request** | Cold start (normal for Render free tier) | Consider upgrading to a paid plan for always-on instances, or accept initial latency. |
| **ChromaDB persistence issues** | Missing write permissions to `./chroma_db` | Ensure the service has write access to the directory. Render's filesystem is writable. |
| **LLM API errors** | Invalid or missing API keys | Double-check `GEMINI_API_KEY` or `OPENAI_API_KEY` values. Ensure they are active and have sufficient quota. |

### Accessing Logs
- Render provides real-time logs in the dashboard under the service's **Logs** tab.
- For persistent logging, consider integrating with a logging service (e.g., via `vector` or external Syslog).

### Database Migrations
- The backend uses Alembic for migrations. To run migrations manually:
  1. Access the service via **Shell** in the Render dashboard.
  2. Run: `alembic upgrade head`
- For automated migrations on deploy, consider adding a release command (not currently configured in this guide).

### Scaling
- For production, consider:
  - Upgrading to a paid plan for dedicated CPU and memory.
  - Enabling auto-scaling based on request volume.
  - Using Render's managed PostgreSQL for higher performance and backups.

## Additional Notes
- **Root Directory**: Critical to set the root directory to `/backend` so that Render looks for `main.py` and `requirements.txt` in the correct location.
- **File Structure**: This guide assumes the backend code is in a folder named `backend` at the repository root (as in this project).
- **Security**: Never commit actual `.env` files to the repository. Use Render's environment variables for secrets.

---
*Last updated: 2026-06-12*
"""
api/middleware/auth.py — JWT bearer token extractor.

Not a Starlette middleware in the traditional sense — this module
exposes an OAuth2PasswordBearer scheme used as a FastAPI dependency.
The actual user resolution lives in api/deps.py.
"""

from fastapi.security import OAuth2PasswordBearer

# tokenUrl is the path Swagger UI uses to acquire a token in /docs.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

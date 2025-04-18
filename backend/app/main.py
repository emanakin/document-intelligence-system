from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import auth, documents, insights, integration, users
from db.database import create_tables

app = FastAPI(title="Document Analysis API")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(insights.router)
app.include_router(integration.router)
app.include_router(users.router)

@app.on_event("startup")
async def startup():
    # Create database tables on startup
    create_tables()

@app.get("/")
def read_root():
    return {"message": "Welcome to Document Analysis API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from api.functions import router as metrics_router

app = FastAPI()

# Register routers
app.include_router(metrics_router)

# Serve frontend build
app.mount(
    "/",
    StaticFiles(directory="../Frontend/dist", html=True),
    name="Frontend"
)

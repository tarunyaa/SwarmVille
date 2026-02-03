"""
SwarmVille Backend API
Main FastAPI application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
from contextlib import asynccontextmanager

from app.config import get_settings
from app.routes import agents_router, workflows_router, tasks_router, approvals_router
from app.services.orchestrator import get_agent_states

settings = get_settings()

# Create Socket.IO server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=[settings.frontend_url, "http://localhost:3000"]
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    print(f"Starting {settings.app_name}")
    yield
    # Shutdown
    print("Shutting down...")


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="AI Workforce Operating System - Backend API",
    version="0.1.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(agents_router)
app.include_router(workflows_router)
app.include_router(tasks_router)
app.include_router(approvals_router)


# Socket.IO event handlers
@sio.event
async def connect(sid, environ):
    """Handle client connection."""
    print(f"Client connected: {sid}")
    # Send current agent states on connect
    await sio.emit('agent_states', get_agent_states(), to=sid)


@sio.event
async def disconnect(sid):
    """Handle client disconnection."""
    print(f"Client disconnected: {sid}")


@sio.event
async def request_agent_states(sid):
    """Client requesting current agent states."""
    await sio.emit('agent_states', get_agent_states(), to=sid)


@sio.event
async def chat_message(sid, data):
    """Handle chat message from human to agent."""
    agent_id = data.get('agent_id')
    message = data.get('message')
    print(f"Chat to {agent_id}: {message}")
    # TODO: Forward message to agent and get response


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "app": settings.app_name}


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "name": settings.app_name,
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health"
    }


# Create combined ASGI app with Socket.IO
socket_app = socketio.ASGIApp(sio, app)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:socket_app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )

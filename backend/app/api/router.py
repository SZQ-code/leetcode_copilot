from fastapi import APIRouter

from app.api.routes import agent, categories, health, problems

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(problems.router)
api_router.include_router(categories.router)
api_router.include_router(agent.router)

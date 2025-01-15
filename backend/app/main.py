"""
主应用程序模块
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import api_router
from app.utils.scheduler import setup_scheduler
from app.core.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(_application: FastAPI):
    """应用生命周期管理"""
    # 启动时执行
    logger.info("启动应用")
    setup_scheduler()
    yield
    # 关闭时执行
    logger.info("关闭应用")


app = FastAPI(
    title=settings.APP_TITLE,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# 注册主路由
app.include_router(api_router)

# 注册CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

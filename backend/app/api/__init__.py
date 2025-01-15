"""
API路由包

统一管理所有API路由
"""
from fastapi import APIRouter
from app.api.qrcode import router as qrcode_router
from .excel import router as excel_router

# 创建主路由
api_router = APIRouter(prefix="/api")

# 注册子路由
api_router.include_router(qrcode_router, prefix="/qrcode", tags=["二维码生成"])
api_router.include_router(excel_router, prefix="/excel", tags=["Excel处理"])

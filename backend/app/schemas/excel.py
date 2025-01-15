"""
Excel文件处理相关的数据模型
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class ExcelColumnResponse(BaseModel):
    """Excel列信息响应模型"""
    success: bool = Field(..., description="是否成功")
    message: str = Field(..., description="响应消息")
    data: Optional[List[str]] = Field(None, description="列名列表")

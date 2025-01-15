"""
二维码相关的数据模型
"""

from typing import List, Optional, Dict
from pydantic import BaseModel, Field, field_validator


class QRCodeRequest(BaseModel):
    """二维码请求模型"""
    contents: List[str] = Field(
        ...,
        description="二维码内容列表,每项格式为'内容,标签'",
        example=[
            "https://example1.com,网站1",
            "https://example2.com,网站2",
            "https://example3.com,",
            "123,456,"  # 内容包含逗号，无标签
        ]
    )

    @classmethod
    @field_validator('contents')
    def validate_contents(cls, v: List[str]) -> List[str]:
        """验证内容列表"""
        if not v:
            raise ValueError("内容列表不能为空")
        return v


class QRCodeData(BaseModel):
    """二维码数据模型"""
    qrcode_text: str = Field(..., description="二维码内容")
    file_path: str = Field(..., description="文件路径")
    base64_image: str = Field(..., description="Base64编码的图片数据")
    file_type: str = Field(..., description="文件类型: image/pdf")


class QRCodeResponse(BaseModel):
    """二维码生成响应模型"""
    success: bool = Field(..., description="是否成功")
    message: str = Field(..., description="响应消息")
    data: Optional[Dict[str, QRCodeData]] = Field(None, description="响应数据, key为文件名")

"""
异常处理模块

定义应用程序的自定义异常类和异常处理器
"""
from enum import Enum
from typing import Optional, Any, Dict
from fastapi import HTTPException


class ErrorCode(Enum):
    """错误码枚举"""
    INVALID_CONTENT = (1001, "无效的二维码内容")
    PDF_GENERATION_FAILED = (1002, "PDF生成失败")
    INVALID_FILE_TYPE = (1003, "不支持的文件类型")


class QRCodeException(HTTPException):
    """二维码生成器自定义异常"""

    def __init__(
        self,
        error_code: ErrorCode,
        detail: Optional[Any] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> None:
        """
        初始化异常

        Args:
            error_code: 错误码枚举
            detail: 详细错误信息
            headers: 响应头
        """
        status_code = 400
        if not detail:
            detail = error_code.value[1]

        super().__init__(status_code=status_code, detail={
            "code": error_code.value[0],
            "message": detail
        }, headers=headers)

"""
Excel文件处理相关的API路由
"""
from fastapi import APIRouter, UploadFile
from app.schemas.excel import ExcelColumnResponse
from app.services.excel_service import ExcelService
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()


@router.post("/columns", response_model=ExcelColumnResponse)
async def get_excel_columns(file: UploadFile) -> ExcelColumnResponse:
    """
    获取Excel文件的列名

    Args:
        file: 上传的Excel文件

    Returns:
        ExcelColumnResponse: 包含列名列表的响应
    """
    logger.info("读取文件列名: %s", file.filename)

    # 读取文件内容
    content = await file.read()

    # 获取列名
    columns = await ExcelService.read_columns(content, file.filename)

    return ExcelColumnResponse(
        success=True,
        message="成功读取文件列名",
        data=columns
    )

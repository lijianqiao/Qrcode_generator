"""
二维码生成相关的API路由
"""
from pathlib import Path
from typing import Optional, Tuple
from fastapi import APIRouter
from app.schemas.qrcode import QRCodeRequest, QRCodeResponse, QRCodeData
from app.services.qrcode_service import QRCodeService
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()


def parse_content_label(content: str) -> Tuple[str, Optional[str]]:
    """
    解析内容和标签

    Args:
        content: 格式为"内容,标签"的字符串，支持英文逗号和中文逗号

    Returns:
        Tuple[str, Optional[str]]: (内容, 标签)

    Examples:
        >>> parse_content_label("123,456")    # 返回 ("123", "456")
        >>> parse_content_label("123,")       # 返回 ("123", None)
        >>> parse_content_label("123，456")    # 返回 ("123", "456")
        >>> parse_content_label("123")        # 返回 ("123", None)
        >>> parse_content_label("123,,45")    # 返回 ("123,", "45")
        >>> parse_content_label("123，，45")   # 返回 ("123，", "45")
        >>> parse_content_label("123,，45")    # 返回 ("123,", "45")
    """
    if not content:
        return "", None

    # 查找最后一个英文逗号或中文逗号的位置
    last_en_comma = content.rfind(',')
    last_cn_comma = content.rfind('，')

    # 获取最后一个逗号的位置
    last_comma = max(last_en_comma, last_cn_comma)

    # 如果没有找到逗号，返回整个内容
    if last_comma == -1:
        return content, None

    # 分割内容和标签
    qr_content = content[:last_comma]  # 保留内容中的所有逗号
    label = content[last_comma + 1:]   # 取最后一个逗号后的内容作为标签

    # 如果标签为空，返回None
    return qr_content, label if label else None


@router.post("/generate", response_model=QRCodeResponse)
async def generate_qrcodes(request: QRCodeRequest) -> QRCodeResponse:
    """
    生成二维码

    Args:
        request: 包含二维码内容的请求，支持单个或多个

    Returns:
        QRCodeResponse: 包含生成的二维码数据
    """
    logger.info("生成二维码，数量: %d", len(request.contents))

    # 解析所有内容和标签，同时保存原始文本
    items = [(content, label, original)
             for original in request.contents
             for content, label in [parse_content_label(original)]]

    # 生成二维码
    results = await QRCodeService.generate_batch(items)

    # 构建数据字典
    qr_dict = {
        Path(file_path).name: QRCodeData(
            qrcode_text=content,
            file_path=str(file_path),
            base64_image=base64_img,
            file_type=file_type
        )
        for file_path, base64_img, file_type, content in results
    }

    return QRCodeResponse(
        success=True,
        message=f"成功生成 {len(results) - 1} 个二维码",
        data=qr_dict
    )

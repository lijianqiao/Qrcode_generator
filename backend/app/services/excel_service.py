"""
Excel文件处理服务

提供Excel文件的列名读取功能
"""
from typing import List
import pandas as pd
from app.core.exceptions import QRCodeException, ErrorCode
from app.utils.logger import get_logger

logger = get_logger(__name__)


class ExcelService:
    """Excel处理服务类"""

    # 支持的文件类型
    ALLOWED_EXTENSIONS = {'.xlsx', '.xls', '.csv'}

    @staticmethod
    def get_file_extension(filename: str) -> str:
        """获取文件扩展名"""
        return filename.lower().split('.')[-1]

    @classmethod
    async def read_columns(cls, file_content: bytes, filename: str) -> List[str]:
        """
        读取Excel文件的列名

        Args:
            file_content: 文件内容
            filename: 文件名

        Returns:
            List[str]: 列名列表

        Raises:
            QRCodeException: 当文件格式不支持或读取失败时抛出
        """
        try:
            # 获取文件扩展名
            ext = f".{cls.get_file_extension(filename)}"
            if ext not in cls.ALLOWED_EXTENSIONS:
                raise QRCodeException(
                    ErrorCode.INVALID_FILE_TYPE,
                    f"不支持的文件类型: {ext}。支持的类型: {', '.join(cls.ALLOWED_EXTENSIONS)}"
                )

            # 读取文件
            if ext == '.csv':
                # 尝试不同的编码方式读取CSV
                encodings = ['utf-8', 'gbk', 'gb2312']
                df = None
                for encoding in encodings:
                    try:
                        df = pd.read_csv(pd.io.common.BytesIO(file_content), encoding=encoding)
                        break
                    except UnicodeDecodeError:
                        continue
                if df is None:
                    raise QRCodeException(
                        ErrorCode.INVALID_CONTENT,
                        "无法读取CSV文件, 请检查文件编码"
                    )
            else:
                df = pd.read_excel(pd.io.common.BytesIO(file_content))

            # 获取列名
            columns = df.columns.tolist()

            if not columns:
                raise QRCodeException(
                    ErrorCode.INVALID_CONTENT,
                    "文件没有列名"
                )

            return columns

        except Exception as e:
            if not isinstance(e, QRCodeException):
                logger.error("读取文件失败: %s", str(e))
                raise QRCodeException(
                    ErrorCode.INVALID_CONTENT,
                    f"读取文件失败: {str(e)}"
                ) from e
            raise

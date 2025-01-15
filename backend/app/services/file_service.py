"""
文件服务

提供临时文件清理功能
"""
import os
from datetime import datetime
from app.core.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


class FileService:
    """文件服务类"""

    @staticmethod
    async def cleanup_expired_files() -> None:
        """清理过期的临时文件"""
        current_time = datetime.now().timestamp()

        # 清理输出目录中的过期二维码图片
        try:
            for file_path in settings.OUTPUT_DIR.glob('*.png'):
                if file_path.is_file():
                    file_modified_time = file_path.stat().st_mtime
                    if current_time - file_modified_time > settings.TEMP_FILE_EXPIRE:
                        try:
                            os.remove(file_path)
                            logger.info("已删除过期二维码文件: %s", file_path)
                        except (OSError, PermissionError) as e:
                            logger.error("删除文件失败 %s: %s", file_path, str(e))
        except (OSError, PermissionError) as e:
            logger.error("清理目录失败 %s: %s", settings.OUTPUT_DIR, str(e))

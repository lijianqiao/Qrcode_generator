"""
配置管理模块

用于加载和管理应用程序的配置信息，包括：
- 服务器配置
- 二维码生成配置
"""

from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用配置类"""

    # 应用信息
    APP_TITLE: str = "二维码生成器"
    APP_DESCRIPTION: str = "一个基于FastAPI的二维码生成服务"
    APP_VERSION: str = "1.0.0"

    # 服务配置
    APP_PORT: int = 8000
    APP_HOST: str = "0.0.0.0"

    # 二维码配置
    QR_SIZE: int = 300
    QR_BORDER: int = 4
    LABEL_HEIGHT: int = 30

    # 临时目录配置（仅用于存储生成的二维码）
    TEMP_DIR: Path = Path("temp")
    OUTPUT_DIR: Path = TEMP_DIR / "outputs"

    # 临时文件配置
    TEMP_FILE_EXPIRE: int = 3600  # 1小时后过期

    class Config:
        """配置类配置"""
        env_file = ".env"

    def create_temp_dirs(self) -> None:
        """创建临时目录"""
        self.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


@lru_cache()
def get_settings() -> Settings:
    """获取应用配置单例"""
    return Settings()


# 创建配置实例
settings = get_settings()
# 确保临时目录存在
settings.create_temp_dirs()

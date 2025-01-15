"""
定时任务模块

用于管理定时任务，如清理临时文件等
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from app.services.file_service import FileService
from app.utils.logger import get_logger

logger = get_logger(__name__)

# 创建调度器
scheduler = AsyncIOScheduler()


def setup_scheduler() -> None:
    """设置并启动调度器"""
    try:
        # 添加清理临时文件的任务，每小时执行一次
        scheduler.add_job(
            FileService.cleanup_expired_files,
            trigger=IntervalTrigger(hours=1),
            id='cleanup_temp_files',
            name='清理临时二维码文件',
            replace_existing=True
        )

        # 启动调度器
        scheduler.start()
        logger.info("定时任务调度器已启动")
    except Exception as e:
        logger.error("启动定时任务调度器失败: %s", str(e))
        raise

# -*- encoding: utf-8 -*-
"""
@Author         : li
@FileName       : logger.py
@Email          : lijianqiao@live.com
@DateTime       : 2025/01/10 13:10:41
@Version        : 1.0
@Docs           : 日志配置模块
"""

import sys
import logging
from datetime import datetime
from logging.handlers import RotatingFileHandler
from pathlib import Path


def setup_logger():
    """配置日志系统"""
    # 创建日志目录
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)

    # 配置根日志记录器
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)
    logging.getLogger("PIL").setLevel(logging.WARNING)  # 屏蔽 PIL 库的 DEBUG 日志
    logging.getLogger("asyncio").setLevel(logging.WARNING)  # 屏蔽 asyncio 库的 DEBUG 日志
    logging.getLogger("watchfiles.main").setLevel(logging.WARNING)  # 屏蔽 watchfiles 库的 DEBUG 日志
    logging.getLogger("aiomysql").setLevel(logging.WARNING)  # 屏蔽 aiomysql 库的 DEBUG 日志
    # 降低 python_multipart 的日志级别
    logging.getLogger('python_multipart').setLevel(logging.INFO)

    # 降低 SQLAlchemy 的日志级别
    logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

    # 日志格式
    formatter = logging.Formatter(
        '%(asctime)s,%(msecs)03d - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    # 文件处理器
    current_date = datetime.now().strftime('%Y-%m-%d')
    file_handler = RotatingFileHandler(
        log_dir / f"QRcode-{current_date}.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=10,  # 保留 10 个日志文件
        encoding='utf-8'  # 日志文件编码
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)

    # 控制台处理器
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)
    console_handler.setFormatter(formatter)

    # 添加处理器
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)

    # 创建审计日志处理器
    # audit_handler = RotatingFileHandler(
    #     log_dir / f"audit-{current_date}.log",
    #     maxBytes=10 * 1024 * 1024,  # 10MB
    #     backupCount=10,
    #     encoding='utf-8'
    # )
    # audit_handler.setLevel(logging.INFO)
    # audit_handler.setFormatter(formatter)

    # # 配置审计日志记录器
    # audit_logger = logging.getLogger("database.apps.audit")
    # audit_logger.setLevel(logging.INFO)
    # audit_logger.addHandler(audit_handler)
    # audit_logger.propagate = False  # 防止审计日志出现在其他日志文件中


# 初始化日志系统
setup_logger()


def get_logger(name: str) -> logging.Logger:
    """获取日志记录器"""
    return logging.getLogger(f"backend.app.{name}")

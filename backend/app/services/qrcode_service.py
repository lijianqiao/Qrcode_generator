"""
二维码生成服务

提供二维码生成的核心功能：
- 单个文本生成二维码
- 多行文本生成二维码
- 批量生成带标签的二维码
"""
from typing import List, Optional, Tuple, Any, Coroutine
from pathlib import Path
from datetime import datetime
import base64
from io import BytesIO
import qrcode
from PIL import Image, ImageDraw, ImageFont
from ulid import ULID
import asyncio

from app.core.config import settings
from app.core.exceptions import QRCodeException, ErrorCode
from app.utils.logger import get_logger

logger = get_logger(__name__)


class QRCodeService:
    """二维码生成服务类"""

    @staticmethod
    def _generate_qr_image(content: str) -> Image.Image:
        """
        生成二维码图片

        Args:
            content: 二维码内容

        Returns:
            Image.Image: 生成的二维码图片

        Raises:
            QRCodeException: 当二维码内容无效时抛出
        """
        try:
            # 生成二维码
            qr_image = qrcode.make(
                content,
                box_size=settings.QR_BORDER
            )

            # 调整图片大小
            qr_image = qr_image.resize((settings.QR_SIZE, settings.QR_SIZE))
            return qr_image
        except Exception as e:
            logger.error("生成二维码失败: %s", str(e))
            raise QRCodeException(
                ErrorCode.INVALID_CONTENT,
                f"生成二维码失败: {str(e)}"
            ) from e

    @staticmethod
    def _add_label(qr_image: Image.Image, label: str) -> Image.Image:
        """
        为二维码添加标签

        Args:
            qr_image: 二维码图片
            label: 标签文本

        Returns:
            Image.Image: 添加标签后的图片
        """
        # 创建新图片（包含标签区域）
        new_height = qr_image.height + settings.LABEL_HEIGHT
        new_image = Image.new('RGB', (qr_image.width, new_height), 'white')

        # 粘贴二维码图片
        new_image.paste(qr_image, (0, 0))

        # 添加标签文本
        draw = ImageDraw.Draw(new_image)
        try:
            # 尝试加载中文字体
            font = ImageFont.truetype("simhei.ttf", settings.LABEL_HEIGHT // 2)
            # 如果是ubuntu，则安装中文字体或者选择该系统有的中文字体
            # sudo apt-get update
            # sudo apt-get install fonts-wqy-zenhei fonts-wqy-microhei
            # 查看字体路径，在ubuntu command中输入 fc-list :lang=zh
            # 然后注销上面代码，使用下面代码
            # font = ImageFont.truetype("/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc", settings.LABEL_HEIGHT // 2)
        except OSError:
            # 如果找不到中文字体，使用默认字体
            font = ImageFont.load_default()

        # 计算文本位置使其居中
        text_bbox = draw.textbbox((0, 0), label, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]

        x = (qr_image.width - text_width) // 2
        y = qr_image.height + (settings.LABEL_HEIGHT - text_height) // 2

        # 绘制文本
        draw.text((x, y), label, fill='black', font=font)

        return new_image

    @staticmethod
    def _save_image(image: Image.Image, label: Optional[str] = None) -> Path:
        """
        保存图片到临时目录

        Args:
            image: 图片对象
            label: 标签文本（用于文件名）

        Returns:
            Path: 保存的文件路径
        """
        # 生成唯一文件名
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        ulid = str(ULID())
        filename = f"qr_{timestamp}_{ulid}"
        if label:
            # 如果有标签，添加到文件名中（去除特殊字符）
            safe_label = "".join(c for c in label if c.isalnum() or c in (' ', '_', '-'))
            filename = f"{filename}_{safe_label}"
        filename = f"{filename}.png"

        # 保存文件
        file_path = settings.OUTPUT_DIR / filename
        image.save(file_path, 'PNG')
        return file_path

    @staticmethod
    def _image_to_base64(image: Image.Image) -> str:
        """
        将图片转换为base64编码

        Args:
            image: PIL图片对象

        Returns:
            str: base64编码的图片数据
        """
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return f"data:image/png;base64,{img_str}"

    @staticmethod
    async def _generate_pdf(images: List[Image.Image]) -> bytes:
        """
        将多个图片生成为PDF

        Args:
            images: PIL图片对象列表

        Returns:
            bytes: PDF文件的二进制数据
        """
        # 创建一个字节流来保存PDF
        pdf_buffer = BytesIO()

        # 如果没有图片，返回空PDF
        if not images:
            return pdf_buffer.getvalue()

        # 在事件循环的默认执行器中运行PDF生成
        def generate():
            first_image = images[0]
            first_image_rgb = first_image.convert('RGB')
            first_image_rgb.save(
                pdf_buffer,
                format='PDF',
                save_all=True,
                append_images=[img.convert('RGB') for img in images[1:]]
            )
            return pdf_buffer.getvalue()

        return await asyncio.get_event_loop().run_in_executor(None, generate)

    @staticmethod
    async def _save_pdf(pdf_data: bytes) -> Path:
        """
        保存PDF文件到临时目录

        Args:
            pdf_data: PDF文件的二进制数据

        Returns:
            Path: 保存的文件路径
        """
        # 生成唯一文件名
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        ulid = str(ULID())
        filename = f"qrcodes_{timestamp}_{ulid}.pdf"

        # 保存文件
        file_path = settings.OUTPUT_DIR / filename

        # 异步写入文件
        def write_file():
            with open(file_path, 'wb') as f:
                f.write(pdf_data)
            return file_path

        await asyncio.get_event_loop().run_in_executor(None, write_file)
        return file_path

    @classmethod
    async def generate_single(cls, content: str) -> Tuple[Path, str]:
        """
        生成单个二维码

        Args:
            content: 二维码内容

        Returns:
            Tuple[Path, str]: (文件路径, base64编码的图片数据)
        """
        qr_image = cls._generate_qr_image(content)
        file_path = cls._save_image(qr_image)
        base64_image = cls._image_to_base64(qr_image)
        return file_path, base64_image

    @classmethod
    async def generate_multiple(cls, contents: List[str]) -> List[Tuple[Path, str]]:
        """
        生成多个二维码

        Args:
            contents: 二维码内容列表

        Returns:
            List[Tuple[Path, str]]: [(文件路径, base64编码的图片数据), ...]
        """
        results = []
        for content in contents:
            file_path, base64_image = await cls.generate_single(content)
            results.append((file_path, base64_image))
        return results

    @classmethod
    async def generate_batch(cls, items: List[Tuple[str, Optional[str], str]]) -> List[Tuple[Path, str, str, str]]:
        """
        批量生成带标签的二维码

        Args:
            items: 内容、标签和原始文本的元组列表 [(content, label, original_text), ...]

        Returns:
            List[Tuple[Path, str, str, str]]: [(文件路径, base64编码的数据, 文件类型, 原始文本), ...]
        """
        results = []
        qr_images = []  # 存储生成的图片对象，用于后续生成PDF

        # 1. 生成所有二维码图片
        for content, label, original_text in items:
            qr_image = cls._generate_qr_image(content)
            if label:
                qr_image = cls._add_label(qr_image, label)
            file_path = cls._save_image(qr_image, label)
            base64_image = cls._image_to_base64(qr_image)
            results.append((file_path, base64_image, "image", original_text))
            qr_images.append(qr_image)

        # 2. 生成PDF并添加到结果列表
        if qr_images:  # 只在有图片时生成PDF
            pdf_data = await cls._generate_pdf(qr_images)
            pdf_path = await cls._save_pdf(pdf_data)
            pdf_base64 = base64.b64encode(pdf_data).decode()
            results.append((
                pdf_path,
                f"data:application/pdf;base64,{pdf_base64}",
                "pdf",
                "PDF文档"  # PDF的内容描述
            ))

        return results

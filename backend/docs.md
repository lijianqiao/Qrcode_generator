# 二维码生成器设计文档

## 1. 项目概述

一个基于FastAPI的简单二维码生成服务，支持单个/多个文本内容生成二维码，以及通过文件批量生成带标签的二维码。

## 2. 项目结构

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 应用入口
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py        # 配置管理
│   │   └── exceptions.py    # 自定义异常
│   ├── api/
│   │   ├── __init__.py
│   │   └── qrcode.py        # 二维码相关路由
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── qrcode.py        # Pydantic 模型
│   ├── services/
│   │   ├── __init__.py
│   │   ├── qrcode.py        # 二维码生成服务
│   │   └── file_service.py  # 文件处理服务
│   └── utils/
│       ├── __init__.py
│       └── helpers.py       # 工具函数
├── temp/                    # 临时文件目录
├── tests/                   # 测试目录
└── requirements.txt         # 依赖清单
```

## 3. 核心功能

### 3.1 单个二维码生成

- 支持输入单行文本生成二维码
- 实时预览生成的二维码
- 支持下载生成的二维码

### 3.2 多行文本二维码生成

- 支持在文本域输入多行内容
- 每行内容生成一个二维码
- 支持批量预览
- 支持PDF导出

### 3.3 文件批量处理

- 支持的文件格式：
  - CSV文件
  - Excel文件(.xlsx, .xls)
- 支持选择内容列和标签列
- 支持预览生成的二维码
- 支持PDF批量导出

## 4. API设计

### 4.1 二维码生成接口

```python
# 单个二维码生成
POST /api/qrcode/single
请求体：
{
    "content": "字符串内容"
}

# 多行文本二维码生成
POST /api/qrcode/multi
请求体：
{
    "contents": ["行1", "行2", "行3"]
}

# 文件上传并生成二维码
POST /api/qrcode/file
Form数据：
- file: UploadFile
- content_column: str  # 内容列名
- label_column: str    # 标签列名（可选）

# 获取生成的PDF
GET /api/qrcode/download/{task_id}
```

## 5. 数据模型

### 5.1 请求模型

```python
class SingleQRRequest(BaseModel):
    """单个二维码请求模型"""
    content: str

    class Config:
        json_schema_extra = {
            "example": {
                "content": "https://example.com"
            }
        }

class MultiQRRequest(BaseModel):
    """多行文本二维码请求模型"""
    contents: List[str]

    class Config:
        json_schema_extra = {
            "example": {
                "contents": [
                    "https://example1.com",
                    "https://example2.com"
                ]
            }
        }

class FileQRRequest(BaseModel):
    """文件处理请求模型"""
    content_column: str
    label_column: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "content_column": "url",
                "label_column": "name"
            }
        }
```

### 5.2 响应模型

```python
class QRCodeResponse(BaseModel):
    """二维码生成响应模型"""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
```

## 6. 错误处理

### 6.1 错误码定义

```python
class ErrorCode(Enum):
    INVALID_CONTENT = (1001, "无效的二维码内容")
    FILE_TOO_LARGE = (1002, "文件超过大小限制")
    INVALID_FILE_TYPE = (1003, "不支持的文件类型")
    COLUMN_NOT_FOUND = (1004, "指定的列不存在")
    PDF_GENERATION_FAILED = (1005, "PDF生成失败")
```

## 7. 文件处理限制

- 文件大小限制：100MB
- 支持的文件类型：.csv, .xlsx, .xls
- 单次处理最大行数：1000行

## 8. 依赖项

```text
fastapi==0.115.6
python-multipart==0.0.20
qrcode==8.0
Pillow==11.1.0
pydantic==2.10.4
aiofiles==24.1.0
pandas==2.0.0
openpyxl==3.0.10
fpdf2==2.7.8
```

## 9. 环境变量配置

```env
# 服务配置
APP_PORT=8000
APP_HOST=0.0.0.0

# 文件配置
MAX_FILE_SIZE=10485760  # 10MB
MAX_ROWS=1000
TEMP_FILE_EXPIRE=3600  # 1小时

# 二维码配置
QR_SIZE=300            # 二维码尺寸
QR_BORDER=4           # 二维码边框
LABEL_HEIGHT=30       # 标签高度
```

## 10. 注意事项

### 10.1 文件处理

- 确保上传文件编码为UTF-8
- Excel文件首行必须是列名
- 文件内容列必须存在且不为空

### 10.2 性能考虑

- 大文件处理采用流式处理
- 使用异步处理提高并发性能
- 定期清理临时文件

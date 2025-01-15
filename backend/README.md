# 二维码生成器

## 目录

- [项目概述](#项目概述)
- [系统架构](#系统架构)
- [功能特性](#功能特性)
- [使用说明](#使用说明)
- [注意事项](#注意事项)
- [错误处理](#错误处理)
- [部署流程](#部署流程)

## 项目概述

### 基本信息

- **项目名称**：二维码生成器
- **版本**：1.0
- **作者**：li
- **邮箱**：<lijianqiao2906@live.com>

### 功能简介

这是一个功能完整的二维码生成工具，支持单个二维码生成和批量生成，可以处理Excel和CSV文件，并支持为二维码添加自定义标签。

## 系统架构

### 核心组件

#### QRCodeConfig

二维码配置数据类，管理以下参数：

```python
@dataclass
class QRCodeConfig:
    size: Tuple[int, int] = (300, 300)
    box_size: int = 10
    border: int = 4
    fill_color: str = "black"
    back_color: str = "white"
    label_height: int = 30
    font_size: int = 20
```

#### 协议接口

- **ImageProcessor**：图片处理协议
- **QRCodeGenerator**：二维码生成协议
- **FileHandler**：文件处理协议

#### 处理器类

1. **BaseImageProcessor**
   - 基础图片处理功能
   - 图片尺寸调整

2. **LabeledImageProcessor**
   - 继承自BaseImageProcessor
   - 支持添加文本标签
   - 中文字体自适应

3. **DefaultQRCodeGenerator**
   - 二维码生成核心功能
   - 支持自定义参数

4. **文件处理器**
   - ExcelFileHandler：处理.xlsx和.xls文件
   - CSVFileHandler：处理.csv文件

### 主应用类 QRCodeApp

整合所有功能的主应用类，提供：

- 文件处理和二维码生成
- 图片下载和PDF导出
- 批量处理功能

## 功能特性

### 二维码生成

- [x] 自定义二维码尺寸和样式
- [x] 支持添加自定义标签文本
- [x] 批量生成功能
- [x] 单个生成功能

### 文件处理

- [x] 支持Excel(.xlsx, .xls)格式
- [x] 支持CSV格式
- [x] 自定义内容列和标签列
- [x] 数据预处理和验证

### 图片处理

- [x] 自动调整图片尺寸
- [x] 中文标签支持
- [x] 多字体自适应
- [x] 标签位置自动计算

### 导出功能

- [x] PNG格式导出
- [x] PDF批量导出
- [x] Base64编码支持

## 使用说明

### 单个二维码生成

```python
# 初始化应用
app = QRCodeApp(config)

# 生成单个二维码
app.handle_single_qrcode()
```

### 批量生成

```python
# Excel文件批量生成
handler = ExcelFileHandler()
results = handler.process(excel_file)

# CSV文件批量生成
handler = CSVFileHandler()
results = handler.process(csv_file)
```

### 自定义配置

```python
# 自定义二维码配置
config = QRCodeConfig(
    size=(400, 400),
    box_size=12,
    border=5,
    label_height=40,
    font_size=24
)
```

## 注意事项

### 1. 字体支持

- 确保系统安装了适当的中文字体
- 支持的字体路径：
  - Windows: MSYH.TTC, SIMHEI.TTF
  - Linux: DroidSansFallbackFull.ttf
  - macOS: PingFang.ttc

### 2. 文件处理

- 建议使用标准格式的Excel或CSV文件
- 文件大小建议控制在合理范围内
- 确保文件编码格式正确（推荐UTF-8）

### 3. 性能考虑

- 批量处理时注意内存使用
- 大文件处理时建议分批进行
- PDF导出时注意文件大小

## 错误处理

### 1. 字体加载

- 多级字体回退机制
- 自动降级到系统默认字体
- 错误提示和警告信息

### 2. 文件异常处理

- 文件格式验证
- 数据完整性检查
- 异常捕获和错误提示

### 3. 图片处理

- 尺寸自动调整
- 格式兼容性检查
- 内存使用优化

## 更新日志

### v1.0 (2025/01/13)

- 初始版本发布
- 支持基本二维码生成功能
- 支持Excel和CSV文件处理
- 添加中文标签支持

## 部署流程

### 1. 环境要求

- Python 3.12+
- Windows/Linux/macOS
- 2GB+ RAM
- 1GB+ 磁盘空间

### 2. 安装步骤

1. **克隆代码**

   ```bash
   git clone <repository_url>
   cd qrcode/backendserver
   ```

2. **创建虚拟环境**

   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # Linux/macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **安装依赖**

   ```bash
   pip install -r requirements.txt
   ```

4. **配置环境变量**
   - 复制 `.env.example` 为 `.env`
   - 根据需要修改配置项：

     ```ini
     # 服务配置
     APP_PORT=8000
     APP_HOST=0.0.0.0

     # 二维码配置
     QR_SIZE=300
     QR_BORDER=4
     LABEL_HEIGHT=60

     # 临时文件配置
     TEMP_FILE_EXPIRE=3600
     ```

5. **创建必要目录**

   ```bash
   mkdir -p temp/outputs logs
   ```

### 3. 启动服务

1. **开发、生产环境 [run.py 已经使用了uvicorn]**

   ```bash
   python run.py
   ```

### 4. 访问服务

- API文档：`http://localhost:8000/docs`
- 交互式API文档：`http://localhost:8000/redoc`

### 5. 注意事项

1. **字体配置**
   - Windows默认使用`simhei.ttf`
   - Linux需要安装中文字体：
   - 需要修改 app\services\qrcode_service.py 中_add_label 方法，使用对应字体

     ```bash
     # Ubuntu/Debian
     sudo apt-get install fonts-wqy-zenhei

     # CentOS/RHEL
     yum install wqy-zenhei-fonts
     ```

2. **日志配置**
   - 日志文件位于`logs`目录
   - 默认保留10个日志文件，每个最大10MB
   - 日志级别可在`app/utils/logger.py`中调整

3. **临时文件清理**
   - 临时文件存储在`temp/outputs`目录
   - 默认1小时后自动清理
   - 清理间隔可在`.env`中配置

4. **性能优化**
   - 建议使用nginx作为反向代理
   - 生产环境worker数建议设置为CPU核心数的2倍
   - 内存占用约为每个worker 100MB

5. **安全建议**
   - 生产环境建议使用HTTPS
   - 配置适当的CORS策略
   - 添加适当的访问控制
   - 定期清理日志和临时文件

### 6. 故障排除

1. **常见问题**
   - 端口被占用：修改`APP_PORT`或关闭占用进程
   - 字体缺失：安装相应的字体包
   - 权限问题：确保目录有正确的读写权限

2. **日志查看**

   ```bash
   # 实时查看日志
   tail -f logs/QRcode-*.log

   # 查看错误日志
   grep "ERROR" logs/QRcode-*.log
   ```

3. **服务状态检查**

   ```bash
   # 检查进程
   ps aux | grep uvicorn
   ```

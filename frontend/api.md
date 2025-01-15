# 二维码生成器 API 文档

## 基本信息

- **标题**: 二维码生成器
- **描述**: 一个基于FastAPI的二维码生成服务
- **版本**: 1.0.0
- **基础URL**: `/api`

## API 端点

### 1. 生成二维码

生成一个或多个二维码，支持带标签的二维码生成。

- **URL**: `/qrcode/generate`
- **方法**: `POST`
- **标签**: 二维码生成
- **Content-Type**: `application/json`

#### 请求体

```json
{
  "contents": [
    "https://example1.com,网站1",
    "https://example2.com,网站2",
    "https://example3.com,",
    "123,456,"  // 内容包含逗号，无标签
  ]
}
```

#### 响应

**成功响应 (200)**

```json
{
  "success": true,
  "message": "成功生成 4 个二维码",
  "data": {
    "qr_20250113_xxx.png": {
      "file_path": "temp/outputs/qr_20250113_xxx.png",
      "base64_image": "data:image/png;base64,..."
    }
  }
}
```

### 2. 获取Excel文件列名

读取上传的Excel文件（xlsx、xls、csv），返回文件的列名列表。

- **URL**: `/excel/columns`
- **方法**: `POST`
- **标签**: Excel处理
- **Content-Type**: `multipart/form-data`

#### 请求参数

- **file**: 文件
  - 类型: `file`
  - 必需: 是
  - 格式: binary
  - 支持格式: xlsx, xls, csv

#### 响应

**成功响应 (200)**

```json
{
  "success": true,
  "message": "成功读取文件列名",
  "data": [
    "库位编码",
    "库位名称",
    "库位地址",
    "库位管理员"
  ]
}
```

## 数据模型

### 请求模型

#### QRCodeRequest

- **contents**: string[] (必需)
  - 描述: 二维码内容列表,每项格式为'内容,标签'
  - 示例:

    ```json
    [
      "https://example1.com,网站1",
      "https://example2.com,网站2",
      "https://example3.com,",
      "123,456,"
    ]
    ```

### 响应模型

#### QRCodeData

- **file_path**: string (必需)
  - 描述: 文件路径
- **base64_image**: string (必需)
  - 描述: Base64编码的图片数据

#### QRCodeResponse

- **success**: boolean (必需)
  - 描述: 是否成功
- **message**: string (必需)
  - 描述: 响应消息
- **data**: Record<string, QRCodeData> | null (可选)
  - 描述: 响应数据, key为文件名

#### ExcelColumnResponse

- **success**: boolean (必需)
  - 描述: 是否成功
- **message**: string (必需)
  - 描述: 响应消息
- **data**: string[] | null (可选)
  - 描述: 列名列表

## 错误响应

所有接口在发生验证错误时会返回 422 状态码：

```json
{
  "detail": [
    {
      "loc": ["字段位置"],
      "msg": "错误信息",
      "type": "错误类型"
    }
  ]
}
```

## 使用说明

1. 所有请求都需要设置正确的 Content-Type 头
2. 二维码内容格式为 "内容,标签"，支持：
   - 带标签：`"123,标签"`
   - 不带标签：`"123,"`
   - 内容包含逗号：`"123,456,"`
   - 使用中文逗号：`"123，标签"`
3. Base64图片数据可以直接用于HTML的img标签的src属性
4. Excel文件必须包含表头（列名）
5. CSV文件支持多种编码（UTF-8、GBK、GB2312）

## 注意事项

1. 二维码内容不能为空
2. 批量生成时建议控制数量，避免请求过大
3. 生成的文件会定期自动清理
4. Base64图片数据较大时建议使用压缩或分批处理
5. Excel文件大小应合理，避免过大文件
6. 确保Excel文件格式正确，内容完整

# 二维码生成器

一个现代化的二维码生成工具，基于 Next.js 15 和 Material UI 构建，支持多种生成模式和批量处理功能。

## 主要功能

### 1. 单个二维码生成

- 支持输入文本内容生成单个二维码
- 可选择性添加标签
- 实时预览生成效果
- 支持下载生成的二维码图片
- 支持下载包含二维码的 PDF 文件

### 2. 多个二维码生成

- 支持同时输入多行内容，每行生成一个二维码
- 批量生成多个二维码
- 支持为每个二维码添加不同标签
- 预览和管理生成的二维码列表
- 支持下载单个二维码图片
- 支持下载包含所有二维码的 PDF 文件

### 3. Excel 批量处理

- 支持上传 Excel 文件（.xlsx、.xls、.csv）
- 可视化配置内容列和标签列
- 支持预览和编辑表格数据
- 表格数据支持搜索、排序和编辑
- 支持键盘导航和操作
- 数据编辑支持撤销/重做
- 实时预览选中行的二维码效果
- 详细的使用说明指导
- 支持下载单个二维码图片
- 支持下载包含所有二维码的 PDF 文件

### 4. 粘贴文本处理

- 支持从 Excel 复制数据并粘贴生成二维码
- 自动识别和分割多行内容
- 支持预览和编辑处理后的数据
- 批量生成对应的二维码
- 详细的使用说明指导
- 支持下载单个二维码图片
- 支持下载包含所有二维码的 PDF 文件

## 技术特点

- 🚀 基于 Next.js 15 App Router 构建
- 💅 使用 Material UI 实现现代化界面
- 🎨 响应式设计，支持多种设备
- ⌨️ 完整的键盘操作支持
- 🔄 状态管理与数据持久化
- 🎯 错误处理和用户反馈
- 📱 移动端优化
- ♿ 可访问性支持
- 📝 详细的使用说明
- 💾 多种下载格式支持

## 开发环境

- Node.js >= 18
- TypeScript 5.x
- Next.js 15.x
- Material UI 6.x

## 安装和运行

1. 克隆项目

```bash
git clone [repository-url]
```

2. 安装依赖

```bash
npm install
```

3. 运行开发服务器

```bash
npm run dev
```

4. 构建生产版本

```bash
npm run build
```

## 环境变量配置

创建 `.env.local` 文件并配置以下环境变量：

```env
NEXT_PUBLIC_API_URL=你的后端API地址
```

## 项目结构

```
app/
├── components/         # 可复用组件
│   ├── qrcode/        # 二维码相关组件
│   ├── table/         # 表格组件
│   └── layouts/       # 布局组件
├── hooks/             # 自定义 Hooks
├── services/          # API 服务
├── types/             # TypeScript 类型定义
├── theme/             # 主题配置
└── (routes)/          # 页面路由
```

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

[MIT License](LICENSE)

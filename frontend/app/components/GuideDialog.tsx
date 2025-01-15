'use client';

import { Dialog, DialogTitle, DialogContent, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ReactMarkdown from 'react-markdown';

const guideContent = `
# 二维码生成器使用说明

## 功能介绍

### 1️⃣ 单个二维码生成
- 输入文本内容，一键生成二维码
- 可添加自定义标签
- 实时预览效果
- 支持下载二维码图片
- 支持下载包含二维码的 PDF 文件

### 2️⃣ 多个二维码生成
- 在文本框中输入多行内容，每行将生成一个二维码
- 一次性生成多个二维码
- 支持个性化标签
- 预览和管理列表
- 支持下载单个二维码图片
- 支持下载包含所有二维码的 PDF 文件

### 3️⃣ Excel 批量处理
- 支持 Excel 文件上传（xlsx/xls/csv）
- 智能识别内容列和标签列
- 支持数据预览和编辑
- 表格搜索和排序功能
- 键盘快捷操作（上下键导航、Enter 选择）
- 支持撤销/重做编辑操作
- 实时预览选中行的二维码
- 支持下载单个二维码图片
- 支持下载包含所有二维码的 PDF 文件

### 4️⃣ 粘贴文本处理
- 支持从 Excel 复制数据并直接粘贴
- 自动识别内容列和标签列（以 Tab 分隔）
- 支持预览和编辑数据
- 双击单元格可以编辑内容
- 支持撤销/重做编辑操作
- 点击行可以预览对应的二维码
- 支持键盘上下键快速导航
- 支持下载单个二维码图片
- 支持下载包含所有二维码的 PDF 文件

## 使用技巧

### 🎯 数据编辑
- 双击表格单元格可以编辑内容
- 使用 Ctrl+Z 撤销修改
- 使用 Ctrl+Y 重做修改
- 编辑后需要重新生成二维码

### ⌨️ 键盘操作
- 使用上下键在表格中导航
- 使用 Enter 键选中当前行
- 使用 Tab 键在编辑时切换单元格

### 💾 下载功能
- 在预览区可以下载单个二维码图片
- 在工具栏可以下载包含所有二维码的 PDF
- 在表格中每个二维码都有快速下载按钮

### 🔍 搜索功能
- 使用工具栏的搜索框快速查找内容
- 搜索结果会实时显示在表格中
- 支持模糊搜索
`;

interface GuideDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function GuideDialog({ open, onClose }: GuideDialogProps) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          maxHeight: '80vh',
        },
      }}
    >
      <DialogTitle sx={{ 
        p: 2, 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}>
        <Box sx={{ 
          typography: 'h6', 
          fontSize: '1.125rem',
          fontWeight: 600,
          color: 'primary.main',
        }}>
          使用说明
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{
          '& h1': {
            fontSize: '1.5rem',
            fontWeight: 700,
            mb: 3,
            color: 'primary.main',
            textAlign: 'center',
          },
          '& h2': {
            fontSize: '1.25rem',
            fontWeight: 600,
            mt: 3,
            mb: 2,
            color: 'text.primary',
          },
          '& h3': {
            fontSize: '1.1rem',
            fontWeight: 600,
            mt: 2,
            mb: 1.5,
            color: 'text.primary',
          },
          '& ul': {
            pl: 2,
            mb: 2,
          },
          '& li': {
            mb: 0.75,
            color: 'text.secondary',
            fontSize: '0.95rem',
          },
        }}>
          <ReactMarkdown>{guideContent}</ReactMarkdown>
        </Box>
      </DialogContent>
    </Dialog>
  );
} 
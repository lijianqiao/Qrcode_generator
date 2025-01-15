'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Typography,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Paper,
  Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import * as XLSX from 'xlsx';
import { qrcodeApi } from '@/app/services/qrcode';
import { QRCodeTable } from '@/app/components/table/QRCodeTable';
import { useTableFeatures } from '@/app/hooks/useTableFeatures';
import { QRCodePreview } from '@/app/components/qrcode/QRCodePreview';

// 自定义上传按钮样式
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const steps = ['上传Excel文件', '选择二维码内容列', '选择标签列(可选)'];

interface ExcelData {
  id: string;
  [key: string]: string | number;
}

// 读取Excel文件并返回数据和列名
const readExcelFile = (file: File): Promise<{ data: ExcelData[]; columns: string[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, string | number>[];
        const columns = Object.keys(jsonData[0] || {});

        // 添加 id 字段
        const dataWithId = jsonData.map((row, index) => ({
          id: `${Date.now()}-${index}`,
          ...row,
        }));

        resolve({
          data: dataWithId,
          columns,
        });
      } catch {
        reject(new Error('解析Excel文件失败'));
      }
    };

    reader.onerror = () => {
      reject(new Error('读取文件失败'));
    };
    reader.readAsArrayBuffer(file);
  });
};

export default function BatchQRCode() {
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<'error' | 'success'>('error');
  const [excelData, setExcelData] = useState<ExcelData[]>([]);
  const [selectedLabelColumn, setSelectedLabelColumn] = useState<string>('');

  // 使用表格功能 hook
  const {
    searchTerm,
    setSearchTerm,
    filteredData,
    handleRowSelect,
    handleKeyNavigation,
    canUndo,
    canRedo,
    addToHistory,
    undo,
    redo,
    handleRowChange,
    qrCodesData,
    setQrCodesData,
    previewQRCode,
    setPreviewQRCode,
    selectedRow,
  } = useTableFeatures<ExcelData>({
    data: excelData,
    searchColumn: selectedColumn || '',
    onDataChange: (newData) => {
      setExcelData(newData);
    },
    qrcodeConfig: {
      contentColumn: selectedColumn,
      labelColumn: selectedLabelColumn,
    },
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    if (!selectedColumn) {
      setExcelData([]);
    }
    setOpen(false);
    setActiveStep(0);
    setFile(null);
    setColumns([]);
    setSelectedColumn('');
    setSelectedLabelColumn('');
    setError(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    
    try {
      const { data, columns } = await readExcelFile(file);
      setFile(file);
      setColumns(columns);
      setExcelData(data);
      setActiveStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : '文件处理失败');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 1 && !selectedColumn) {
      setError('请选择二维码内容列');
      return;
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    if (activeStep === 2) {
      setSelectedLabelColumn('');
    }
  };

  const handleFinish = () => {
    if (!selectedColumn) {
      setError('请选择二维码内容列');
      return;
    }

    // 添加到历史记录
    addToHistory(excelData);
    
    setOpen(false);
  };

  // 处理生成二维码
  const handleGenerateQRCodes = async () => {
    if (!selectedColumn) {
      setError('请选择二维码内容列');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 准备数据
      const contents = filteredData.map(row => {
        const content = String(row[selectedColumn]);
        const label = selectedLabelColumn ? String(row[selectedLabelColumn]) : '';
        return `${content},${label}`;
      });

      const response = await qrcodeApi.generate({ contents });
      
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      // 保存所有二维码数据
      setQrCodesData(response.data);
      setAlertSeverity('success');
      setError('二维码生成成功');
      
    } catch (err) {
      setAlertSeverity('error');
      setError(err instanceof Error ? err.message : '生成二维码失败');
      // 清除所有二维码数据
      setQrCodesData({});
      setPreviewQRCode(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {error && (
        <Alert 
          severity={alertSeverity} 
          sx={{ mb: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      {excelData.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ mb: 2, fontWeight: 600 }}
            >
              上传 Excel 文件
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              请上传包含二维码内容的 Excel 文件, 支持 .xlsx、.xls、.csv 格式
            </Typography>
            <Button
              variant="contained"
              onClick={handleClickOpen}
              sx={{ py: 1.5 }}
            >
              上传 Excel 文件
            </Button>
          </Box>
        </Paper>
      ) : (
        <Box sx={{ width: '100%', display: 'flex', gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 2,
                bgcolor: 'grey.50',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                使用说明
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                <Box component="li" sx={{ mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    已选择 [ {selectedColumn} ] 列作为二维码内容
                    {selectedLabelColumn && `, [ ${selectedLabelColumn} ] 列作为标签`}
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    上传 Excel 文件到表格中可以双击单元格编辑内容，支持撤销和重做, 确定数据无误之后, 点击 [ 生成二维码 ] 按钮
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    生成二维码之后若需要修改单元格内容, 则二维码需要重新生成
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                  再次点击每行可以在右侧预览对应的二维码, 并支持鼠标点击和键盘上下键进行快速查看
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                  支持单个图片下载或整页 PDF 下载
                  </Typography>
                </Box>
                <Box component="li">
                  <Typography variant="body2" color="text.secondary">
                    点击 [ 重新上传 ] 可以重新选择 Excel 文件和列
                  </Typography>
                </Box>
              </Box>
            </Paper>
            <QRCodeTable
              data={filteredData}
              columns={columns.map(col => ({
                id: col,
                header: col,
                accessor: (row: ExcelData) => String(row[col]),
                editable: true,
              }))}
              selectedRow={selectedRow}
              onRowSelect={handleRowSelect}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={undo}
              onRedo={redo}
              onKeyNavigation={handleKeyNavigation}
              onRowChange={handleRowChange}
              showGenerateQRCode={true}
              onGenerateQRCode={handleGenerateQRCodes}
              qrCodesData={qrCodesData}
              isGeneratingQRCode={loading}
              selectedColumn={selectedColumn}
              selectedLabelColumn={selectedLabelColumn}
              showReupload={true}
              onReupload={handleClickOpen}
            />
          </Box>

          {/* 预览区域 */}
          <QRCodePreview
            loading={loading}
            qrcode={previewQRCode}
            content={selectedRow ? String(selectedRow[selectedColumn] || '') : undefined}
            label={selectedRow && selectedLabelColumn ? String(selectedRow[selectedLabelColumn] || '') : undefined}
            emptyIcon={<CloudUploadIcon sx={{ fontSize: 48, opacity: 0.5 }} />}
          />
        </Box>
      )}

      {/* 上传对话框 */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>上传 Excel 文件</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Stepper activeStep={activeStep}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ mt: 4 }}>
              {activeStep === 0 ? (
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 2 }}
                    disabled={loading}
                  >
                    选择文件
                    <VisuallyHiddenInput
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
                    />
                  </Button>
                  {file && (
                    <Typography variant="body2" color="text.secondary">
                      已选择文件：{file.name}
                    </Typography>
                  )}
                  {loading && (
                    <CircularProgress 
                      size={24}
                      sx={{ mt: 2 }}
                    />
                  )}
                </Box>
              ) : activeStep === 1 ? (
                <FormControl>
                  <FormLabel>选择二维码内容列</FormLabel>
                  <RadioGroup
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                  >
                    {columns.map((column) => (
                      <FormControlLabel
                        key={column}
                        value={column}
                        control={<Radio />}
                        label={column}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              ) : (
                <FormControl>
                  <FormLabel>选择标签列（可选）</FormLabel>
                  <RadioGroup
                    value={selectedLabelColumn}
                    onChange={(e) => setSelectedLabelColumn(e.target.value)}
                  >
                    <FormControlLabel
                      value=""
                      control={<Radio />}
                      label="不使用标签"
                    />
                    {columns
                      .filter(col => col !== selectedColumn)
                      .map((column) => (
                        <FormControlLabel
                          key={column}
                          value={column}
                          control={<Radio />}
                          label={column}
                        />
                      ))}
                  </RadioGroup>
                </FormControl>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="inherit"
          >
            取消
          </Button>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            上一步
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleFinish : handleNext}
            disabled={activeStep === 1 && !selectedColumn}
          >
            {activeStep === steps.length - 1 ? '完成' : '下一步'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 
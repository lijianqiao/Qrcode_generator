import { QRCodeData, ApiResponse } from '@/app/types/api';
import { axiosInstance } from '@/app/lib/axios';

export const qrcodeApi = {
  // 生成二维码
  generate: async (params: { contents: string[] }): Promise<ApiResponse<Record<string, QRCodeData>>> => {
    const response = await axiosInstance.post<ApiResponse<Record<string, QRCodeData>>>('/qrcode/generate', params);
    return response.data;
  },

  // 获取 Excel 文件列名
  getExcelColumns: async (file: File): Promise<ApiResponse<string[]>> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post<ApiResponse<string[]>>('/excel/columns', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
}; 
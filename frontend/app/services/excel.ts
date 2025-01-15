import { axiosInstance } from '@/app/lib/axios';
import type { ApiResponse } from '@/app/types/api';

export const excelApi = {
  // 获取Excel列名
  getColumns(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return axiosInstance.post<ApiResponse<string[]>>('/excel/columns', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 获取Excel数据
  getData(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return axiosInstance.post<ApiResponse<Array<Record<string, string | number>>>>('/excel/data', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
}; 
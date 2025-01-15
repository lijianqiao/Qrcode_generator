export interface QRCodeData {
  qrcode_text: string;
  file_path: string;
  base64_image: string;
  file_type: 'image' | 'pdf';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface SingleQRRequest {
  content: string;
}

export interface MultiQRRequest {
  contents: string[];
}

export interface BatchQRRequest {
  items: [string, string | null][];
}

export type ExcelColumnResponse = ApiResponse<string[]>;

export interface ExcelData {
  [key: string]: string | number;
}

export type ExcelResponse = ApiResponse<ExcelData[]>;

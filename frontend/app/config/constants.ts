export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME,
  api: {
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT),
  },
  upload: {
    // 上传文件相关配置
    maxSize: 1024 * 1024 * 10, // 10MB
    acceptedFileTypes: {
      excel: '.xlsx,.xls,.csv',
    },
  },
  qrcode: {
    // 二维码相关配置
    maxBatchSize: 50, // 最大批量生成数量
  },
};

export const API_ERROR_MESSAGES = {
  default: '请求失败',
  network: '网络错误，请检查网络连接',
  timeout: '请求超时',
  unauthorized: '未授权，请登录',
  forbidden: '拒绝访问',
  notFound: '请求地址不存在',
  serverError: '服务器内部错误',
  validation: '参数验证失败',
};

export const ROUTES = {
  home: '/',
  qrcode: '/qrcode',
  excel: '/excel',
}; 
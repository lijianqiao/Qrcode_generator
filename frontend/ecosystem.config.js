module.exports = {
    apps: [{
        name: 'qrcode-frontend',
        script: '.next/standalone/server.js',
        env: {
            NODE_ENV: 'production',
            PORT: 3000,
            NEXT_PUBLIC_API_BASE_URL: 'http://10.11.230.83:8000/api'
        },
        instances: 'max',        // 使用所有 CPU 核心
        exec_mode: 'cluster',    // 使用集群模式
        max_memory_restart: '1G',// 超过内存限制自动重启
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        error_file: 'logs/error.log',
        out_file: 'logs/out.log',
        merge_logs: true,
        autorestart: true,      // 崩溃自动重启
        watch: false,           // 生产环境关闭文件监视
        max_restarts: 10,       // 最大重启次数
        restart_delay: 4000     // 重启延迟
    }]
}
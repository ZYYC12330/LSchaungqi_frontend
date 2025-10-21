// 运行时配置示例
// 复制此文件为 config.js 并修改配置

window.__APP_CONFIG__ = {
  // ==================== API 配置 ====================
  
  // 后端 API 地址
  // 留空 "" 表示使用相对路径 /api，通过 Next.js 代理转发（推荐，可避免 CORS 问题）
  // 或直接填写完整 URL，如 "https://demo.langcore.cn"
  API_URL: "",
  
  // API Token
  API_TOKEN: "your_api_token_here",
  
  // Workflow ID
  WORKFLOW_ID: "your_workflow_id_here",
  
  
  // ==================== 应用配置 ====================
  
  // 调试模式：开启后会在控制台输出配置信息
  DEBUG: false,
  
  // API 请求超时时间（毫秒）
  TIMEOUT: 60000,
  
  
  // ==================== 使用说明 ====================
  
  // 1. 复制此文件为 config.js：
  //    cp config.example.js config.js
  //
  // 2. 修改上面的配置
  //
  // 3. 保存后刷新浏览器（无需重新构建！）
  //
  // 4. 开启 DEBUG 可以在浏览器控制台看到配置信息
  
  
  // ==================== 环境示例 ====================
  
  // 本地开发：
  // API_URL: "http://localhost:8000",
  // DEBUG: true,
  
  // 测试环境：
  // API_URL: "https://test-api.example.com",
  // DEBUG: true,
  
  // 生产环境：
  // API_URL: "https://api.example.com",
  // DEBUG: false,
}


# 环境变量配置说明

## 快速开始

在项目根目录创建 `.env.local` 文件，并添加以下内容：

```bash
# API 基础 URL
NEXT_PUBLIC_API_URL=https://demo.langcore.cn

# API 认证 Token
NEXT_PUBLIC_API_TOKEN=sk-zzvwbcaxoss3

# Workflow ID
NEXT_PUBLIC_WORKFLOW_ID=cmghkokkd02a1qjb2on8r9lc5
```

## 配置说明

### NEXT_PUBLIC_API_URL
- **说明**: 后端 API 的基础 URL
- **默认值**: `https://demo.langcore.cn`
- **示例**: `https://your-api-server.com`

### NEXT_PUBLIC_API_TOKEN
- **说明**: API 认证令牌（Bearer Token）
- **默认值**: `sk-zzvwbcaxoss3`
- **获取方式**: 联系后端团队获取
- **安全提示**: 
  - 不要将 Token 提交到版本控制
  - 生产环境使用独立的 Token
  - 定期更换 Token

### NEXT_PUBLIC_WORKFLOW_ID
- **说明**: 智能分析工作流的 ID
- **默认值**: `cmghkokkd02a1qjb2on8r9lc5`
- **说明**: 这个 ID 对应后端的分析工作流配置

## 不同环境配置

### 开发环境 (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://demo.langcore.cn
NEXT_PUBLIC_API_TOKEN=sk-zzvwbcaxoss3
NEXT_PUBLIC_WORKFLOW_ID=cmghkokkd02a1qjb2on8r9lc5
```

### 生产环境 (.env.production)
```bash
NEXT_PUBLIC_API_URL=https://api.production.com
NEXT_PUBLIC_API_TOKEN=your-production-token
NEXT_PUBLIC_WORKFLOW_ID=your-production-workflow-id
```

### 测试环境 (.env.test)
```bash
NEXT_PUBLIC_API_URL=https://api.test.com
NEXT_PUBLIC_API_TOKEN=your-test-token
NEXT_PUBLIC_WORKFLOW_ID=your-test-workflow-id
```

## 注意事项

1. **环境变量文件优先级**
   - `.env.local` > `.env.production` > `.env`
   - 本地开发使用 `.env.local`

2. **Next.js 环境变量规则**
   - 客户端可访问的变量必须以 `NEXT_PUBLIC_` 开头
   - 不带前缀的变量仅在服务端可用

3. **安全性**
   - `.env.local` 已在 `.gitignore` 中
   - 不要将敏感信息提交到代码库
   - 生产环境使用环境变量管理工具

4. **生效时间**
   - 修改环境变量后需要重启开发服务器
   - 使用 `Ctrl+C` 停止服务器，然后重新运行 `npm run dev`

## 验证配置

启动开发服务器后，打开浏览器控制台，输入：

```javascript
console.log({
  API_URL: process.env.NEXT_PUBLIC_API_URL,
  HAS_TOKEN: !!process.env.NEXT_PUBLIC_API_TOKEN,
  WORKFLOW_ID: process.env.NEXT_PUBLIC_WORKFLOW_ID
})
```

应该看到正确的配置值。

## 故障排除

### 问题：环境变量未生效
**解决方案**:
1. 检查文件名是否正确（`.env.local`）
2. 确认变量名有 `NEXT_PUBLIC_` 前缀
3. 重启开发服务器

### 问题：API 调用失败
**解决方案**:
1. 检查 `NEXT_PUBLIC_API_URL` 是否正确
2. 验证 `NEXT_PUBLIC_API_TOKEN` 是否有效
3. 确认网络连接正常
4. 查看浏览器网络面板的错误信息


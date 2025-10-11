# 配置快速指南 ⚡

## 🎉 好消息

**现在修改配置无需重新构建了！**

---

## 🚀 快速开始（3步搞定）

### 步骤 1: 创建配置文件

```bash
# 进入项目目录
cd /path/to/intelligent-selection-system

# 复制示例配置
cp public/config.example.js public/config.js
```

或者手动创建 `public/config.js`：

```javascript
window.__APP_CONFIG__ = {
  API_URL: "https://demo.langcore.cn",
  API_TOKEN: "your_api_token_here",
  WORKFLOW_ID: "your_workflow_id_here",
  DEBUG: false,
}
```

### 步骤 2: 修改配置

编辑 `public/config.js`，填入你的实际配置：

```javascript
window.__APP_CONFIG__ = {
  API_URL: "https://your-api-server.com",
  API_TOKEN: "your_actual_token",
  WORKFLOW_ID: "your_actual_workflow_id",
  DEBUG: true,  // 开启调试
}
```

### 步骤 3: 刷新浏览器

- 保存文件
- 按 **F5** 或 **Ctrl+R** 刷新浏览器
- **搞定！** ✅

---

## 📝 常见场景

### 场景 1: 本地开发

```javascript
// public/config.js
window.__APP_CONFIG__ = {
  API_URL: "http://localhost:8000",  // 本地后端
  API_TOKEN: "dev_token",
  WORKFLOW_ID: "test_workflow",
  DEBUG: true,  // 开启调试，方便查看日志
}
```

### 场景 2: 测试环境

```javascript
window.__APP_CONFIG__ = {
  API_URL: "https://test-api.example.com",
  API_TOKEN: "test_token_123",
  WORKFLOW_ID: "test_workflow_456",
  DEBUG: true,
}
```

### 场景 3: 生产环境

```javascript
window.__APP_CONFIG__ = {
  API_URL: "https://api.example.com",
  API_TOKEN: "prod_token_xyz",
  WORKFLOW_ID: "prod_workflow_abc",
  DEBUG: false,  // 生产环境关闭调试
}
```

---

## 🔄 修改配置流程

### 旧方式（需要重新构建）❌

```bash
# 1. 修改 .env.production
nano .env.production

# 2. 重新构建（耗时 30秒-2分钟）
pnpm build

# 3. 重启应用
pm2 restart intelligent-selection-system

# 总耗时：2-3分钟
```

### 新方式（无需构建）✅

```bash
# 1. 修改 public/config.js
nano public/config.js

# 2. 刷新浏览器
# 按 F5

# 总耗时：10秒
```

---

## 🛠️ 服务器部署配置

### 初次部署

```bash
# 1. 上传代码
git clone <repo> /var/www/intelligent-selection
cd /var/www/intelligent-selection

# 2. 创建配置文件
cp public/config.example.js public/config.js
nano public/config.js  # 修改配置

# 3. 安装依赖并构建（只需一次）
pnpm install --prod
pnpm build

# 4. 启动
pm2 start ecosystem.config.js
```

### 后续修改配置

```bash
# 1. SSH 到服务器
ssh user@server

# 2. 修改配置
cd /var/www/intelligent-selection
nano public/config.js

# 3. 保存退出
# 用户刷新浏览器即可！无需重启应用！
```

---

## 🎯 配置项说明

| 配置项 | 说明 | 示例值 | 必填 |
|--------|------|--------|------|
| `API_URL` | 后端 API 地址 | `https://api.example.com` | ✅ |
| `API_TOKEN` | API 认证令牌 | `your_token_here` | ✅ |
| `WORKFLOW_ID` | Workflow ID | `your_workflow_id` | ✅ |
| `DEBUG` | 调试模式 | `true` / `false` | ❌ (默认 false) |
| `TIMEOUT` | API 超时（毫秒） | `60000` | ❌ (默认 60000) |

---

## 🔍 调试技巧

### 1. 开启调试模式

```javascript
window.__APP_CONFIG__ = {
  // ...
  DEBUG: true,  // 👈 开启
}
```

刷新浏览器后，打开控制台（F12）会看到配置信息。

### 2. 查看当前配置

浏览器控制台输入：
```javascript
window.__APP_CONFIG__
```

### 3. 临时修改配置（测试用）

浏览器控制台输入：
```javascript
window.__APP_CONFIG__.API_URL = "https://new-api.com"
window.__APP_CONFIG__.DEBUG = true
// 然后重新操作即可测试新配置
```

---

## ⚠️ 注意事项

### 1. 配置文件位置

```
项目根目录/
  └── public/
      ├── config.js          👈 你的配置（不要提交到 Git）
      └── config.example.js  👈 示例配置（可以提交）
```

### 2. Git 忽略

确保 `public/config.js` 在 `.gitignore` 中：

```gitignore
# 配置文件
public/config.js
```

### 3. 强制刷新

如果修改后没生效，尝试强制刷新：

- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

---

## 📦 Docker 部署

### Dockerfile 配置

```dockerfile
# 复制示例配置
COPY public/config.example.js /app/public/

# 注意：实际的 config.js 通过挂载提供
```

### docker-compose.yml

```yaml
services:
  web:
    build: .
    volumes:
      - ./config.js:/app/public/config.js  # 挂载配置文件
    ports:
      - "3000:3000"
```

### 使用

```bash
# 1. 创建本地配置
cp config.example.js config.js
nano config.js  # 修改

# 2. 启动容器
docker-compose up -d

# 3. 修改配置
nano config.js

# 4. 刷新浏览器即可！
```

---

## 🆚 对比：环境变量 vs 运行时配置

| 特性 | 环境变量 | 运行时配置 |
|------|---------|-----------|
| 修改后是否需要构建 | ✅ 需要 | ❌ 不需要 |
| 修改生效时间 | 2-3分钟 | 10秒 |
| 开发体验 | 一般 | ✨ 优秀 |
| 生产环境更新 | 需要重启 | 无需重启 |
| 多环境支持 | 多个文件 | 一个文件 |

---

## 💡 最佳实践

### 开发环境

```javascript
// public/config.js
window.__APP_CONFIG__ = {
  API_URL: "http://localhost:8000",
  DEBUG: true,  // 开启调试
  TIMEOUT: 10000,  // 短超时，快速发现问题
}
```

### 生产环境

```javascript
// public/config.js
window.__APP_CONFIG__ = {
  API_URL: "https://api.example.com",
  DEBUG: false,  // 关闭调试
  TIMEOUT: 60000,  // 正常超时
}
```

### 不同环境使用不同文件

```bash
# 开发环境
cp public/config.dev.js public/config.js

# 生产环境
cp public/config.prod.js public/config.js
```

---

## 🎓 进阶使用

### 动态切换环境

创建一个环境切换脚本：

```bash
#!/bin/bash
# switch-env.sh

ENV=$1

if [ "$ENV" = "dev" ]; then
    cp public/config.dev.js public/config.js
    echo "✅ 切换到开发环境"
elif [ "$ENV" = "test" ]; then
    cp public/config.test.js public/config.js
    echo "✅ 切换到测试环境"
elif [ "$ENV" = "prod" ]; then
    cp public/config.prod.js public/config.js
    echo "✅ 切换到生产环境"
else
    echo "❌ 未知环境: $ENV"
    echo "使用方法: ./switch-env.sh [dev|test|prod]"
fi
```

使用：
```bash
chmod +x switch-env.sh
./switch-env.sh dev   # 切换到开发环境
./switch-env.sh prod  # 切换到生产环境
```

---

## 📞 获取帮助

- 📖 详细文档：[RUNTIME_CONFIG.md](./RUNTIME_CONFIG.md)
- 📘 部署指南：[DEPLOYMENT.md](./DEPLOYMENT.md)

---

**享受无需构建的配置修改体验！** 🎊


# 运行时配置说明 🎯

## 🎉 好消息：不用再重新构建了！

现在你可以修改配置而无需重新构建项目！

---

## 📝 如何修改配置？

### 方式 1: 修改 public/config.js（推荐）⭐

**文件位置**: `public/config.js`

```javascript
window.__APP_CONFIG__ = {
  // API 配置
  API_URL: "https://demo.langcore.cn",
  API_TOKEN: "your_api_token_here",
  WORKFLOW_ID: "your_workflow_id_here",
  
  // 其他配置
  DEBUG: false,
  TIMEOUT: 60000,
}
```

**修改后只需**：
1. ✅ 保存文件
2. ✅ 刷新浏览器（或 F5）
3. ✅ **无需重新构建！**

---

### 方式 2: 环境变量（需要重新构建）

如果不想使用运行时配置，仍可使用环境变量：

`.env.production`:
```env
NEXT_PUBLIC_API_URL=https://demo.langcore.cn
NEXT_PUBLIC_API_TOKEN=your_token
NEXT_PUBLIC_WORKFLOW_ID=your_workflow_id
```

修改后需要：
```bash
pnpm build
pm2 restart intelligent-selection-system
```

---

## 🔄 配置优先级

```
运行时配置 (public/config.js)
    ↓
环境变量 (.env.production)
    ↓
代码中的默认值
```

**这意味着**：
- 如果 `public/config.js` 存在，优先使用它
- 如果没有运行时配置，使用环境变量
- 都没有则使用默认值

---

## 🚀 使用场景

### 场景 1: 开发环境快速切换 API

开发时频繁切换测试服务器：

```javascript
// public/config.js
window.__APP_CONFIG__ = {
  API_URL: "http://localhost:8000",  // 本地测试
  // API_URL: "https://test-api.com",  // 测试服务器
  // API_URL: "https://prod-api.com",  // 生产服务器
  API_TOKEN: "dev_token_123",
  WORKFLOW_ID: "test_workflow",
  DEBUG: true,  // 开启调试日志
}
```

保存后**刷新浏览器**即可！

---

### 场景 2: 部署后修改配置

服务器上修改配置：

```bash
# 1. 编辑配置文件
nano /var/www/intelligent-selection/public/config.js

# 2. 修改配置
# 按 Ctrl+O 保存，Ctrl+X 退出

# 3. 无需重启应用！直接刷新浏览器即可
```

---

### 场景 3: 多环境部署

**开发环境** (`public/config.js`):
```javascript
window.__APP_CONFIG__ = {
  API_URL: "https://dev-api.example.com",
  DEBUG: true,
}
```

**生产环境** (`public/config.js`):
```javascript
window.__APP_CONFIG__ = {
  API_URL: "https://api.example.com",
  DEBUG: false,
}
```

只需在不同服务器上放置不同的 `config.js` 即可！

---

## 🛠️ 调试技巧

### 1. 开启调试模式

```javascript
window.__APP_CONFIG__ = {
  // ...其他配置
  DEBUG: true,  // 👈 开启调试
}
```

刷新浏览器后，打开控制台（F12）会看到：
```
🔧 App Config: {
  API_URL: "https://demo.langcore.cn",
  API_TOKEN: "***ken_here",
  WORKFLOW_ID: "***w_id",
  DEBUG: true,
  TIMEOUT: 60000
}
```

### 2. 浏览器控制台查看配置

打开浏览器控制台（F12），输入：
```javascript
window.__APP_CONFIG__
```

---

## 📦 部署说明

### 构建时

```bash
pnpm build
```

**构建一次后**，`public/config.js` 会被复制到 `.next/static/`，可以随时修改。

### 部署到服务器

```bash
# 1. 上传项目（包括 public/config.js）
rsync -avz ./ user@server:/var/www/intelligent-selection/

# 2. 构建（只需一次）
cd /var/www/intelligent-selection
pnpm build

# 3. 启动
pm2 start ecosystem.config.js

# 4. 以后修改配置只需：
nano public/config.js  # 修改
# 刷新浏览器即可！无需重启应用
```

---

## ⚠️ 注意事项

### 1. 安全性

**重要**：`public/config.js` 会暴露给前端，**不要放敏感信息**！

✅ **可以放**：
- API 地址
- 公开的配置项
- 功能开关

❌ **不要放**：
- 密码
- 私钥
- 服务器端密钥

**API Token 和 Workflow ID** 虽然会暴露，但通常这些是用于前端调用的公开凭证，配合服务器端验证是安全的。

### 2. 缓存问题

如果修改后浏览器没有更新配置：

```bash
# 强制刷新
Ctrl + Shift + R  # Windows/Linux
Cmd + Shift + R   # Mac
```

或清除浏览器缓存。

### 3. 生产环境建议

生产环境建议在 Nginx 层面处理：

```nginx
location = /config.js {
    # 禁止缓存配置文件
    add_header Cache-Control "no-store, no-cache, must-revalidate";
    expires -1;
}
```

---

## 🔄 迁移现有配置

如果你之前使用环境变量，现在迁移到运行时配置：

### 1. 复制环境变量到 config.js

从 `.env.production`:
```env
NEXT_PUBLIC_API_URL=https://demo.langcore.cn
NEXT_PUBLIC_API_TOKEN=your_token
NEXT_PUBLIC_WORKFLOW_ID=your_workflow_id
```

到 `public/config.js`:
```javascript
window.__APP_CONFIG__ = {
  API_URL: "https://demo.langcore.cn",
  API_TOKEN: "your_token",
  WORKFLOW_ID: "your_workflow_id",
}
```

### 2. 重新构建一次

```bash
pnpm build
pm2 restart intelligent-selection-system
```

### 3. 以后修改

只需编辑 `public/config.js`，刷新浏览器即可！

---

## 📊 对比表格

| 特性 | 环境变量方式 | 运行时配置方式 |
|------|-------------|---------------|
| 修改配置 | 需要重新构建 | **只需刷新浏览器** |
| 构建时间 | 每次修改都需要 | **构建一次即可** |
| 部署便利性 | 较麻烦 | **非常方便** |
| 多环境支持 | 需要多个 .env 文件 | **一个文件搞定** |
| 调试友好性 | 一般 | **支持调试模式** |
| 安全性 | 构建时编译，稍好 | 前端可见（都一样） |

---

## 🎯 实际案例

### 案例 1: 开发时快速测试

```javascript
// public/config.js
window.__APP_CONFIG__ = {
  // 测试本地后端
  API_URL: "http://localhost:5000",
  API_TOKEN: "dev_token",
  WORKFLOW_ID: "test_workflow",
  DEBUG: true,
  TIMEOUT: 10000,  // 10秒超时，方便测试
}
```

保存，刷新，立即生效！

### 案例 2: 生产环境紧急切换 API

线上发现 API 有问题，需要紧急切换到备用地址：

```bash
# SSH 到服务器
ssh user@server

# 修改配置（30秒完成）
cd /var/www/intelligent-selection
nano public/config.js
# 修改 API_URL
# 保存退出

# 通知用户刷新浏览器即可！
# 无需重启应用，无停机时间！
```

---

## 📞 常见问题

### Q1: 修改后没生效？

**A**: 
1. 确认保存了 `public/config.js`
2. 强制刷新浏览器 (Ctrl+Shift+R)
3. 检查浏览器控制台是否有报错

### Q2: 可以删除环境变量吗？

**A**: 可以，但建议保留作为默认值。运行时配置优先级更高。

### Q3: Docker 部署怎么用？

**A**: 
```dockerfile
# Dockerfile
COPY public/config.js /app/public/

# 或者在容器启动时挂载
docker run -v ./config.js:/app/public/config.js ...
```

### Q4: 能动态切换配置吗？

**A**: 可以！在浏览器控制台直接修改：
```javascript
window.__APP_CONFIG__.API_URL = "https://new-api.com"
// 然后重新调用 API 即可
```

---

## ✅ 总结

- 🎉 **无需重新构建**：修改 `public/config.js` 后刷新浏览器即可
- 🚀 **快速开发**：开发时可以快速切换不同环境
- 💡 **灵活部署**：生产环境配置修改无需重启
- 🔍 **调试友好**：支持调试模式，方便排查问题

---

**现在开始享受无需构建的配置修改体验吧！** 🎊


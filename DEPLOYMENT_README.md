# 部署文档总览 📚

欢迎使用智能选型系统！本文档提供完整的部署指南和资源索引。

---

## 📖 文档导航

### 快速开始
- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - ⚡ 5分钟快速部署指南（推荐新手）
- **[BUILD_CHECKLIST.md](./BUILD_CHECKLIST.md)** - ✅ 打包部署检查清单

### 详细文档
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - 📘 完整部署文档（包含所有部署方式）
- **[ENV_SETUP.md](./ENV_SETUP.md)** - ⚙️ 环境配置说明

### 功能文档
- **[DATA_INTEGRATION.md](./DATA_INTEGRATION.md)** - 🔌 数据集成说明
- **[SAVE_CONFIRMATION_FEATURE.md](./SAVE_CONFIRMATION_FEATURE.md)** - 💾 保存确认功能说明

---

## 🚀 快速部署（3步上线）

### 第1步：配置环境变量

创建 `.env.production` 文件：
```bash
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=https://demo.langcore.cn
NEXT_PUBLIC_API_TOKEN=你的API_TOKEN
NEXT_PUBLIC_WORKFLOW_ID=你的WORKFLOW_ID
EOF
```

### 第2步：构建项目

```bash
# 安装依赖
pnpm install --prod

# 构建
pnpm build
```

### 第3步：启动应用

```bash
# 方式1: 直接启动
pnpm start

# 方式2: 使用 PM2（推荐）
npm install -g pm2
pm2 start ecosystem.config.js
```

**完成！** 访问 `http://localhost:3000`

---

## 📦 构建命令

### 开发环境
```bash
pnpm dev          # 启动开发服务器
pnpm lint         # 代码检查
```

### 生产环境
```bash
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
```

### 检查构建产物
```bash
# Windows
dir .next /s

# Linux/Mac
du -sh .next
ls -lh .next
```

---

## 🗂️ 部署文件说明

### 核心文件
- `package.json` - 项目依赖和脚本
- `next.config.mjs` - Next.js 配置
- `.env.production` - 生产环境变量（需自行创建）

### 部署配置文件
- `ecosystem.config.js` - PM2 配置（已提供）
- `nginx.conf.example` - Nginx 配置示例（已提供）
- `deploy.sh` - 自动化部署脚本（已提供）
- `env.example.txt` - 环境变量模板（已提供）

### 构建产物
- `.next/` - Next.js 构建输出
- `public/` - 静态资源
- `node_modules/` - 依赖包（不需要上传到生产服务器，在服务器上安装）

---

## 🌐 部署方式对比

| 方式 | 难度 | 性能 | 推荐场景 |
|------|------|------|----------|
| **直接运行** (`pnpm start`) | ⭐ | ⭐⭐ | 开发测试 |
| **PM2** | ⭐⭐ | ⭐⭐⭐⭐ | 生产环境（推荐） |
| **PM2 + Nginx** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 生产环境 + 域名 |
| **Docker** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 容器化部署 |
| **静态导出** | ⭐⭐ | ⭐⭐⭐ | CDN 部署（不推荐本项目） |

---

## 🛠️ 环境要求

### 服务器要求
- **操作系统**: Linux (Ubuntu 20.04+), CentOS 7+, Windows Server
- **Node.js**: >= 18.17.0
- **内存**: >= 2GB（推荐 4GB+）
- **磁盘**: >= 5GB 可用空间
- **网络**: 需要访问外网（下载依赖和访问 API）

### 本地开发要求
- **Node.js**: >= 18.17.0
- **pnpm**: >= 8.0.0（或 npm >= 9.0.0）
- **Git**: 用于版本控制

### 检查环境
```bash
# 检查 Node.js 版本
node -v

# 检查 pnpm 版本
pnpm -v

# 检查可用内存
free -h  # Linux
wmic OS get FreePhysicalMemory  # Windows

# 检查磁盘空间
df -h  # Linux
wmic logicaldisk get size,freespace,caption  # Windows
```

---

## 🔧 常用配置

### 环境变量说明

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `NEXT_PUBLIC_API_URL` | 后端 API 地址 | `https://demo.langcore.cn` |
| `NEXT_PUBLIC_API_TOKEN` | API 认证令牌 | `your_token_here` |
| `NEXT_PUBLIC_WORKFLOW_ID` | Workflow ID | `your_workflow_id` |

⚠️ **注意**: 
- 所有客户端使用的环境变量必须以 `NEXT_PUBLIC_` 开头
- 修改环境变量后需要重新构建: `pnpm build`

### PM2 配置说明

`ecosystem.config.js` 主要配置项：
```js
{
  name: 'intelligent-selection-system',  // 应用名称
  instances: 'max',                      // 实例数（CPU 核心数）
  exec_mode: 'cluster',                  // 集群模式
  max_memory_restart: '1G',              // 内存限制
}
```

### Nginx 配置要点

- **端口映射**: 80/443 → 3000
- **反向代理**: 将请求转发到 Next.js
- **静态资源缓存**: 提升性能
- **Gzip 压缩**: 减少传输大小
- **限流保护**: 防止 API 滥用

---

## 📊 部署流程图

```
┌─────────────────┐
│   本地开发      │
│  (pnpm dev)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   代码提交      │
│   (Git Push)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   服务器拉取    │
│  (Git Pull)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  安装依赖       │
│ (pnpm install)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   构建项目      │
│  (pnpm build)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   启动应用      │
│    (PM2)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Nginx 代理     │
│  (可选)         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   HTTPS 配置    │
│  (Certbot)      │
└─────────────────┘
```

---

## 🎯 典型部署场景

### 场景 1: 本地测试
```bash
pnpm install
pnpm dev
# 访问 http://localhost:3000
```

### 场景 2: 单服务器部署（无域名）
```bash
pnpm install --prod
pnpm build
pm2 start ecosystem.config.js
# 访问 http://服务器IP:3000
```

### 场景 3: 单服务器部署（有域名）
```bash
# 1. 构建应用
pnpm install --prod && pnpm build && pm2 start ecosystem.config.js

# 2. 配置 Nginx
sudo cp nginx.conf.example /etc/nginx/sites-available/intelligent-selection
# 修改域名
sudo ln -s /etc/nginx/sites-available/intelligent-selection /etc/nginx/sites-enabled/
sudo systemctl reload nginx

# 3. 配置 HTTPS
sudo certbot --nginx -d your-domain.com
```

### 场景 4: Docker 部署
```bash
# 修改 next.config.mjs 添加 output: 'standalone'
docker-compose up -d
```

---

## 🔍 故障排查

### 问题 1: 构建失败
```bash
# 清理缓存重试
rm -rf .next node_modules
pnpm install
pnpm build
```

### 问题 2: 应用无法启动
```bash
# 查看日志
pm2 logs intelligent-selection-system

# 检查端口占用
lsof -i :3000  # Linux
netstat -ano | findstr :3000  # Windows
```

### 问题 3: 502 Bad Gateway
```bash
# 检查应用状态
pm2 status

# 检查 Nginx 配置
sudo nginx -t

# 重启服务
pm2 restart all
sudo systemctl reload nginx
```

### 问题 4: 环境变量不生效
```bash
# 确认文件存在
cat .env.production

# 重新构建
pnpm build

# 重启应用
pm2 restart all
```

---

## 📞 获取帮助

### 文档资源
1. 📘 [Next.js 部署文档](https://nextjs.org/docs/deployment)
2. 📗 [PM2 文档](https://pm2.keymetrics.io/docs/usage/quick-start/)
3. 📕 [Nginx 文档](https://nginx.org/en/docs/)

### 快速链接
- [快速部署指南](./QUICK_DEPLOY.md)
- [完整部署文档](./DEPLOYMENT.md)
- [检查清单](./BUILD_CHECKLIST.md)

### 常见问题
查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 中的"常见问题"章节

---

## ✅ 部署成功标志

部署成功后，你应该能够：
- ✅ 访问网站首页
- ✅ 上传文件并分析
- ✅ 查看分析结果
- ✅ 查看产品详情
- ✅ 查看采购方案总结
- ✅ 所有功能正常工作

---

## 🔐 安全提醒

1. ✅ **使用 HTTPS**: 生产环境必须启用
2. ✅ **环境变量**: 不要将 `.env` 文件提交到 Git
3. ✅ **定期更新**: 保持依赖包最新
4. ✅ **访问控制**: 配置防火墙和限流
5. ✅ **备份数据**: 定期备份代码和配置

---

## 📝 更新日志

- **2025-01-11**: 创建部署文档
- **2025-01-11**: 添加保存确认功能
- **2025-01-11**: 完善数据集成

---

**祝你部署顺利！** 🎉

如有问题，请查看详细文档或联系技术支持。


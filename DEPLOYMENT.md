# 部署指南

## 目录
1. [环境准备](#环境准备)
2. [构建项目](#构建项目)
3. [部署方式](#部署方式)
4. [Nginx 配置](#nginx-配置)
5. [常见问题](#常见问题)

---

## 环境准备

### 1. 检查 Node.js 版本
```bash
node -v  # 需要 >= 18.17.0
npm -v   # 或使用 pnpm
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.production`：
```bash
cp .env.example .env.production
```

编辑 `.env.production`，填入实际的配置：
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_API_TOKEN=your_actual_api_token
NEXT_PUBLIC_WORKFLOW_ID=your_actual_workflow_id
```

⚠️ **重要**: 
- 所有环境变量必须以 `NEXT_PUBLIC_` 开头才能在客户端使用
- 生产环境的敏感信息不要提交到 Git

---

## 构建项目

### 方式 1: 标准构建（推荐）

适用于 Node.js 服务器部署

```bash
# 1. 安装依赖
pnpm install
# 或
npm install

# 2. 构建生产版本
pnpm build
# 或
npm run build

# 3. 本地测试构建结果
pnpm start
# 或
npm start

# 访问 http://localhost:3000 验证
```

构建产物：
- `.next/` 目录：构建输出
- `public/` 目录：静态资源
- `package.json`：需要部署到服务器

### 方式 2: 静态导出（可选）

适用于纯静态文件服务器（如 Nginx、Apache、CDN）

⚠️ **注意**: 当前项目使用了动态路由和 Server Components，不建议使用静态导出。

如果需要静态导出，修改 `next.config.mjs`：
```js
const nextConfig = {
  output: 'export',  // 添加这一行
  // ... 其他配置
}
```

然后执行：
```bash
pnpm build
```

构建产物在 `out/` 目录。

---

## 部署方式

### 选项 1: 使用 PM2 部署（推荐）

PM2 是生产环境 Node.js 进程管理工具。

#### 1. 安装 PM2
```bash
npm install -g pm2
```

#### 2. 创建 PM2 配置文件

在项目根目录创建 `ecosystem.config.js`：
```js
module.exports = {
  apps: [
    {
      name: 'intelligent-selection-system',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: './',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
}
```

#### 3. 部署到服务器

```bash
# 1. 上传整个项目到服务器
# 使用 scp、rsync 或 Git

# 2. 在服务器上安装依赖
cd /path/to/intelligent-selection-system
pnpm install --prod

# 3. 构建项目
pnpm build

# 4. 启动应用
pm2 start ecosystem.config.js

# 5. 设置开机自启
pm2 startup
pm2 save

# 6. 常用命令
pm2 list           # 查看运行状态
pm2 logs           # 查看日志
pm2 restart all    # 重启应用
pm2 stop all       # 停止应用
pm2 delete all     # 删除应用
```

### 选项 2: 使用 Docker 部署

#### 1. 创建 Dockerfile

在项目根目录创建 `Dockerfile`：
```dockerfile
FROM node:18-alpine AS base

# 安装依赖阶段
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable pnpm && pnpm build

# 运行阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

#### 2. 修改 next.config.mjs

```js
const nextConfig = {
  output: 'standalone',  // 添加这一行
  // ... 其他配置
}
```

#### 3. 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
      - NEXT_PUBLIC_API_TOKEN=${NEXT_PUBLIC_API_TOKEN}
      - NEXT_PUBLIC_WORKFLOW_ID=${NEXT_PUBLIC_WORKFLOW_ID}
    restart: unless-stopped
```

#### 4. 部署命令

```bash
# 构建镜像
docker-compose build

# 启动容器
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止容器
docker-compose down
```

### 选项 3: 使用 Nginx 反向代理

适合将 Next.js 应用隐藏在 Nginx 后面。

---

## Nginx 配置

### 1. 基础配置（Node.js 方式）

创建 `/etc/nginx/sites-available/intelligent-selection`:

```nginx
# 上游服务器
upstream nextjs_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名

    # 日志
    access_log /var/log/nginx/intelligent-selection-access.log;
    error_log /var/log/nginx/intelligent-selection-error.log;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 代理 Next.js 应用
    location / {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 静态资源缓存
    location /_next/static {
        proxy_pass http://nextjs_backend;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    # 文件上传大小限制
    client_max_body_size 100M;
}
```

### 2. HTTPS 配置（使用 Let's Encrypt）

```bash
# 1. 安装 Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# 2. 获取证书
sudo certbot --nginx -d your-domain.com

# 3. 自动续期
sudo certbot renew --dry-run
```

Nginx 会自动更新配置，添加 SSL 证书。

### 3. 静态文件部署（如使用静态导出）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/intelligent-selection/out;
    index index.html;

    # 日志
    access_log /var/log/nginx/intelligent-selection-access.log;
    error_log /var/log/nginx/intelligent-selection-error.log;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;

    # 静态资源缓存
    location /_next/static {
        alias /var/www/intelligent-selection/out/_next/static;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # 其他静态资源
    location /static {
        alias /var/www/intelligent-selection/out/static;
        add_header Cache-Control "public, max-age=3600";
    }

    # SPA 路由支持
    location / {
        try_files $uri $uri.html $uri/ /index.html;
    }
}
```

### 4. 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/intelligent-selection /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx

# 查看状态
sudo systemctl status nginx
```

---

## 完整部署流程

### 使用 PM2 + Nginx 的完整流程：

```bash
# ========== 本地操作 ==========

# 1. 准备代码
git clone <repository-url>
cd intelligent-selection-system

# 2. 配置环境变量
cp .env.example .env.production
# 编辑 .env.production 填入实际配置

# 3. 测试构建
pnpm install
pnpm build
pnpm start  # 验证本地是否正常

# ========== 服务器操作 ==========

# 4. 上传代码到服务器
rsync -avz --exclude 'node_modules' --exclude '.next' \
  ./ user@your-server:/var/www/intelligent-selection/

# 或使用 Git
ssh user@your-server
cd /var/www/intelligent-selection
git pull origin main

# 5. 安装依赖并构建
cd /var/www/intelligent-selection
pnpm install --prod
pnpm build

# 6. 启动应用（PM2）
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # 设置开机自启

# 7. 配置 Nginx
sudo nano /etc/nginx/sites-available/intelligent-selection
# 粘贴上面的 Nginx 配置
sudo ln -s /etc/nginx/sites-available/intelligent-selection /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 8. 配置 HTTPS（可选）
sudo certbot --nginx -d your-domain.com

# 9. 验证部署
curl http://your-domain.com
# 或在浏览器访问
```

---

## 更新部署

### 使用 Git 更新：

```bash
# 1. 连接到服务器
ssh user@your-server

# 2. 拉取最新代码
cd /var/www/intelligent-selection
git pull origin main

# 3. 安装新依赖（如有）
pnpm install --prod

# 4. 重新构建
pnpm build

# 5. 重启应用
pm2 restart intelligent-selection-system

# 6. 查看日志确认
pm2 logs intelligent-selection-system
```

### 自动化部署脚本：

创建 `deploy.sh`：
```bash
#!/bin/bash
set -e

echo "🚀 开始部署..."

# 拉取代码
echo "📦 拉取最新代码..."
git pull origin main

# 安装依赖
echo "📚 安装依赖..."
pnpm install --prod

# 构建项目
echo "🔨 构建项目..."
pnpm build

# 重启应用
echo "♻️ 重启应用..."
pm2 restart intelligent-selection-system

echo "✅ 部署完成！"
pm2 logs intelligent-selection-system --lines 50
```

使用：
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 性能优化

### 1. 启用 Gzip 压缩（Nginx）

在 nginx 配置中添加：
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript 
           application/x-javascript application/xml+rss 
           application/json application/javascript;
```

### 2. 设置缓存策略

```nginx
# 静态资源长期缓存
location /_next/static {
    add_header Cache-Control "public, max-age=31536000, immutable";
}

# 其他静态资源
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
    add_header Cache-Control "public, max-age=3600";
}
```

### 3. CDN 加速（可选）

配置 CDN 指向你的域名，加速静态资源访问。

---

## 监控和日志

### PM2 监控

```bash
# 实时监控
pm2 monit

# 查看日志
pm2 logs

# 查看特定应用日志
pm2 logs intelligent-selection-system

# 清除日志
pm2 flush
```

### Nginx 日志

```bash
# 访问日志
tail -f /var/log/nginx/intelligent-selection-access.log

# 错误日志
tail -f /var/log/nginx/intelligent-selection-error.log
```

---

## 常见问题

### 1. 端口被占用

```bash
# 查找占用端口的进程
lsof -i :3000
# 或
netstat -tulpn | grep 3000

# 杀死进程
kill -9 <PID>
```

### 2. 环境变量不生效

确保：
- 环境变量以 `NEXT_PUBLIC_` 开头
- 修改环境变量后重新构建：`pnpm build`
- 重启应用：`pm2 restart all`

### 3. 403 Forbidden（Nginx）

```bash
# 检查文件权限
ls -la /var/www/intelligent-selection

# 修改权限
sudo chown -R www-data:www-data /var/www/intelligent-selection
sudo chmod -R 755 /var/www/intelligent-selection
```

### 4. 502 Bad Gateway

检查：
- Next.js 应用是否正常运行：`pm2 status`
- Nginx upstream 配置是否正确
- 防火墙是否开放端口：`sudo ufw status`

### 5. 内存不足

```bash
# 增加 Node.js 内存限制
NODE_OPTIONS="--max-old-space-size=4096" pm2 restart all
```

---

## 安全建议

1. **环境变量**: 不要将敏感信息提交到 Git
2. **HTTPS**: 生产环境必须使用 HTTPS
3. **防火墙**: 只开放必要端口（80, 443）
4. **定期更新**: 保持依赖包最新
5. **访问控制**: 配置 Nginx 限制访问频率

```nginx
# 限流配置
limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;

server {
    location /api {
        limit_req zone=mylimit burst=20 nodelay;
        proxy_pass http://nextjs_backend;
    }
}
```

---

## 备份策略

### 1. 代码备份
使用 Git 管理代码

### 2. 数据备份
```bash
# 备份 sessionStorage 数据（客户端存储，无需备份）
# 如果未来有数据库，添加数据库备份脚本
```

### 3. 配置备份
```bash
# 备份 Nginx 配置
sudo cp /etc/nginx/sites-available/intelligent-selection \
  ~/backups/nginx-config-$(date +%Y%m%d).conf

# 备份环境变量
cp .env.production ~/backups/.env.production-$(date +%Y%m%d)
```

---

## 联系和支持

如有问题，请查看：
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [PM2 文档](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx 文档](https://nginx.org/en/docs/)


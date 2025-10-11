# 快速部署指南

## 最简单的部署方式（5分钟上线）

### 前提条件
- 服务器已安装 Node.js >= 18
- 服务器已安装 pnpm 或 npm

---

## 步骤 1: 准备代码

在本地：
```bash
# 克隆或上传代码到服务器
# 方式 1: 使用 Git
ssh user@your-server
git clone <repository-url> /var/www/intelligent-selection

# 方式 2: 使用 scp
scp -r ./ user@your-server:/var/www/intelligent-selection/
```

---

## 步骤 2: 配置环境变量

在服务器上：
```bash
cd /var/www/intelligent-selection

# 创建生产环境配置
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=https://demo.langcore.cn
NEXT_PUBLIC_API_TOKEN=你的API_TOKEN
NEXT_PUBLIC_WORKFLOW_ID=你的WORKFLOW_ID
EOF
```

---

## 步骤 3: 安装并构建

```bash
# 安装依赖
pnpm install --prod

# 构建项目
pnpm build

# 启动项目
pnpm start
```

此时应用运行在 `http://localhost:3000`

---

## 步骤 4: 后台运行（推荐 PM2）

### 安装 PM2
```bash
npm install -g pm2
```

### 启动应用
```bash
cd /var/www/intelligent-selection

# 启动
pm2 start npm --name "intelligent-selection" -- start

# 设置开机自启
pm2 startup
pm2 save
```

### 常用命令
```bash
pm2 list           # 查看所有应用
pm2 logs           # 查看日志
pm2 restart all    # 重启
pm2 stop all       # 停止
```

---

## 步骤 5: 配置域名访问（可选）

### 安装 Nginx
```bash
sudo apt update
sudo apt install nginx
```

### 配置 Nginx
```bash
sudo nano /etc/nginx/sites-available/intelligent-selection
```

粘贴以下配置（替换 `your-domain.com`）：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 启用配置
```bash
sudo ln -s /etc/nginx/sites-available/intelligent-selection /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 步骤 6: 配置 HTTPS（推荐）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书（自动配置 Nginx）
sudo certbot --nginx -d your-domain.com

# 完成！证书会自动续期
```

---

## 完成！

现在访问：
- HTTP: `http://your-domain.com`
- HTTPS: `https://your-domain.com`

---

## 更新部署

```bash
cd /var/www/intelligent-selection
git pull
pnpm install --prod
pnpm build
pm2 restart intelligent-selection
```

---

## 故障排查

### 应用无法启动
```bash
# 查看日志
pm2 logs intelligent-selection

# 检查端口占用
lsof -i :3000
```

### 502 Bad Gateway
```bash
# 检查应用是否运行
pm2 status

# 检查 Nginx 配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 环境变量不生效
```bash
# 确保已创建 .env.production
cat .env.production

# 重新构建
pnpm build

# 重启应用
pm2 restart intelligent-selection
```

---

## 性能优化建议

1. **使用 CDN**: 将静态资源托管到 CDN
2. **启用缓存**: Nginx 配置静态资源缓存
3. **压缩传输**: Nginx 启用 Gzip
4. **监控日志**: 定期检查 `pm2 logs`

---

## 安全建议

1. ✅ 使用 HTTPS
2. ✅ 设置防火墙（只开放 80, 443）
3. ✅ 定期更新依赖
4. ✅ 不要在代码中硬编码敏感信息
5. ✅ 定期备份

---

需要更详细的部署说明？查看 [DEPLOYMENT.md](./DEPLOYMENT.md)


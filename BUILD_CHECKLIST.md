# 打包部署检查清单

## 打包前检查 ✓

### 1. 环境配置
- [ ] 创建 `.env.production` 文件
- [ ] 填入正确的 `NEXT_PUBLIC_API_URL`
- [ ] 填入正确的 `NEXT_PUBLIC_API_TOKEN`
- [ ] 填入正确的 `NEXT_PUBLIC_WORKFLOW_ID`
- [ ] 确保没有将 `.env` 文件提交到 Git

### 2. 代码检查
- [ ] 运行 `pnpm lint` 检查代码质量
- [ ] 确保所有功能在本地测试通过
- [ ] 确认所有依赖都在 `package.json` 中
- [ ] 检查是否有未提交的更改 `git status`

### 3. 构建测试
- [ ] 本地执行 `pnpm build` 确保构建成功
- [ ] 本地执行 `pnpm start` 测试生产版本
- [ ] 测试所有主要功能：
  - [ ] 文件上传
  - [ ] 分析结果显示
  - [ ] 板卡详情查看
  - [ ] 报价总结页面
  - [ ] 退出确认对话框

### 4. 性能检查
- [ ] 检查构建产物大小 `du -sh .next`
- [ ] 确认静态资源正常加载
- [ ] 检查是否有 console.log 需要清理

---

## 部署前准备 ✓

### 服务器环境
- [ ] 服务器已安装 Node.js >= 18
- [ ] 服务器已安装 pnpm 或 npm
- [ ] 服务器有足够的磁盘空间（至少 2GB）
- [ ] 服务器有足够的内存（建议 2GB+）

### 网络和域名
- [ ] 域名已解析到服务器 IP
- [ ] 防火墙已开放 80 端口（HTTP）
- [ ] 防火墙已开放 443 端口（HTTPS，如需要）
- [ ] 服务器可以访问外网（下载依赖）

### 软件安装（可选但推荐）
- [ ] 安装 PM2: `npm install -g pm2`
- [ ] 安装 Nginx: `sudo apt install nginx`
- [ ] 安装 Certbot（HTTPS）: `sudo apt install certbot`

---

## 部署步骤 ✓

### 方式一：完整部署（推荐）

1. **上传代码到服务器**
   ```bash
   # 使用 Git（推荐）
   ssh user@server
   git clone <repo-url> /var/www/intelligent-selection
   cd /var/www/intelligent-selection
   
   # 或使用 rsync
   rsync -avz --exclude 'node_modules' --exclude '.next' \
     ./ user@server:/var/www/intelligent-selection/
   ```

2. **配置环境变量**
   ```bash
   cd /var/www/intelligent-selection
   nano .env.production
   # 粘贴配置并保存
   ```

3. **安装依赖**
   ```bash
   pnpm install --prod
   ```

4. **构建项目**
   ```bash
   pnpm build
   ```

5. **启动应用（PM2）**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

6. **配置 Nginx**
   ```bash
   sudo cp nginx.conf.example /etc/nginx/sites-available/intelligent-selection
   sudo nano /etc/nginx/sites-available/intelligent-selection
   # 修改 server_name 为你的域名
   sudo ln -s /etc/nginx/sites-available/intelligent-selection /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

7. **配置 HTTPS（推荐）**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

### 方式二：快速部署

只需运行（前提：已配置好环境变量）：
```bash
cd /var/www/intelligent-selection
pnpm install --prod
pnpm build
pm2 start npm --name "intelligent-selection" -- start
```

---

## 部署后验证 ✓

### 1. 应用状态检查
- [ ] PM2 显示应用正在运行: `pm2 status`
- [ ] 查看日志无错误: `pm2 logs intelligent-selection --lines 50`
- [ ] 应用监听正确端口: `lsof -i :3000`

### 2. 网络访问测试
- [ ] 本地访问成功: `curl http://localhost:3000`
- [ ] 域名访问成功: `curl http://your-domain.com`
- [ ] HTTPS 访问成功: `curl https://your-domain.com`

### 3. 功能测试
- [ ] 首页正常加载
- [ ] 文件上传功能正常
- [ ] API 请求正常（查看 Network 面板）
- [ ] 分析结果正常显示
- [ ] 所有页面路由正常工作
- [ ] 浏览器 Console 无错误

### 4. 性能测试
- [ ] 首页加载时间 < 3秒
- [ ] 静态资源加载正常
- [ ] 图片显示正常
- [ ] 响应式布局正常（移动端测试）

### 5. 安全检查
- [ ] HTTPS 证书有效
- [ ] 安全头正确设置（查看 Response Headers）
- [ ] 敏感信息未暴露
- [ ] 环境变量正确加载

---

## 常用命令 📝

### 查看状态
```bash
pm2 status                    # 应用状态
pm2 monit                     # 实时监控
pm2 logs                      # 查看日志
systemctl status nginx        # Nginx 状态
```

### 重启服务
```bash
pm2 restart intelligent-selection  # 重启应用
pm2 reload intelligent-selection   # 零停机重启
sudo systemctl reload nginx        # 重载 Nginx
```

### 停止服务
```bash
pm2 stop intelligent-selection     # 停止应用
pm2 delete intelligent-selection   # 删除应用
sudo systemctl stop nginx          # 停止 Nginx
```

### 查看日志
```bash
pm2 logs intelligent-selection --lines 100  # 应用日志
tail -f /var/log/nginx/access.log          # Nginx 访问日志
tail -f /var/log/nginx/error.log           # Nginx 错误日志
```

---

## 更新部署流程 ✓

### 自动化脚本
使用项目中的 `deploy.sh`：
```bash
cd /var/www/intelligent-selection
chmod +x deploy.sh
./deploy.sh
```

### 手动更新
```bash
cd /var/www/intelligent-selection
git pull origin main
pnpm install --prod
pnpm build
pm2 restart intelligent-selection
```

### 更新后检查
- [ ] 应用成功重启
- [ ] 查看日志确认无错误
- [ ] 访问网站测试新功能

---

## 回滚计划 ✓

如果部署出现问题：

### 1. 快速回滚（Git）
```bash
cd /var/www/intelligent-selection
git log --oneline -10              # 查看最近提交
git reset --hard <commit-hash>     # 回滚到指定版本
pnpm install --prod
pnpm build
pm2 restart intelligent-selection
```

### 2. 备份恢复
```bash
# 恢复备份的代码
cp -r ~/backups/intelligent-selection-<date> /var/www/intelligent-selection
cd /var/www/intelligent-selection
pnpm install --prod
pnpm build
pm2 restart intelligent-selection
```

---

## 监控和维护 📊

### 日常监控
- [ ] 每日检查 PM2 日志
- [ ] 每周检查磁盘空间
- [ ] 每月检查依赖更新
- [ ] 定期备份代码和配置

### 日志管理
```bash
# 清理旧日志
pm2 flush

# 压缩归档
tar -czf logs-$(date +%Y%m%d).tar.gz logs/
```

### 性能监控
```bash
# CPU 和内存使用
pm2 monit

# 服务器资源
htop
df -h
free -h
```

---

## 故障排查 🔧

### 应用无法启动
1. 检查日志: `pm2 logs intelligent-selection`
2. 检查端口: `lsof -i :3000`
3. 检查环境变量: `cat .env.production`
4. 重新构建: `pnpm build`

### 502 Bad Gateway
1. 检查应用状态: `pm2 status`
2. 检查 Nginx 配置: `sudo nginx -t`
3. 检查 upstream: `curl http://localhost:3000`
4. 重启服务: `pm2 restart all && sudo systemctl reload nginx`

### 页面显示异常
1. 清除浏览器缓存
2. 检查静态资源路径
3. 查看浏览器 Console
4. 检查 API 响应

### 内存溢出
1. 增加 Node.js 内存: `NODE_OPTIONS="--max-old-space-size=4096"`
2. 检查内存泄漏
3. 考虑增加服务器内存

---

## 安全加固 🔒

- [ ] 启用 HTTPS
- [ ] 配置防火墙
- [ ] 设置访问限流
- [ ] 定期更新依赖
- [ ] 备份敏感数据
- [ ] 配置日志审计

---

## 联系和支持 📞

遇到问题？
1. 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 详细文档
2. 查看 [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) 快速指南
3. 检查项目 Issues
4. 查看 Next.js 官方文档

---

**最后更新**: 2025-01-11


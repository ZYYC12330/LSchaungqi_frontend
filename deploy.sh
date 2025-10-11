#!/bin/bash
set -e

echo "🚀 开始部署智能选型系统..."

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 拉取代码
echo -e "${YELLOW}📦 拉取最新代码...${NC}"
git pull origin main

# 安装依赖
echo -e "${YELLOW}📚 安装依赖...${NC}"
pnpm install --prod

# 构建项目
echo -e "${YELLOW}🔨 构建项目...${NC}"
pnpm build

# 重启应用
echo -e "${YELLOW}♻️  重启应用...${NC}"
pm2 restart intelligent-selection-system

# 等待应用启动
sleep 3

# 检查状态
echo -e "${YELLOW}🔍 检查应用状态...${NC}"
pm2 status intelligent-selection-system

echo -e "${GREEN}✅ 部署完成！${NC}"
echo ""
echo "查看实时日志："
echo "  pm2 logs intelligent-selection-system"
echo ""
echo "查看最近50行日志："
pm2 logs intelligent-selection-system --lines 50 --nostream


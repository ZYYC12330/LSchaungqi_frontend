# 智能选型系统

> 基于 AI 的仿真机和板卡智能选型解决方案


pm2 start pnpm --name "LSchaungqi-frontend" -- run dev

pm2 stop LSchaungqi-frontend


docker build --network host .

docker run -p 8019:8000 linprog-app



## 📖 简介

本系统是一个智能化的产品选型平台，通过上传需求文档，自动分析并生成最优的仿真机和板卡采购方案。系统集成了先进的 AI 技术和线性规划优化算法，为用户提供专业、高效的选型服务。

## ✨ 核心功能

- 🚀 **智能文档分析**: 上传 Word 文档，AI 自动提取技术需求
- 🎯 **精准匹配**: 基于需求智能匹配最合适的产品
- 💰 **成本优化**: 线性规划算法计算最优采购方案
- 📊 **可视化展示**: 直观展示匹配度、规格参数和价格信息
- 💾 **数据持久化**: 分析结果自动保存，刷新页面不丢失

## 🚀 快速开始

### 前置要求

- Node.js 16+ 或 18+
- pnpm（推荐）或 npm

### 安装步骤

1. **克隆或进入项目目录**
   ```bash
   cd D:\workspace\LangCore\XM_LScq\frontend\intelligent-selection-system
   ```

2. **安装依赖**
   ```bash
   pnpm install
   # 或
   npm install
   ```

3. **配置环境变量**
   
   `.env.local` 文件已自动创建，包含以下配置：
   ```bash
   NEXT_PUBLIC_API_URL=https://demo.langcore.cn
   NEXT_PUBLIC_API_TOKEN=sk-zzvwbcaxoss3
   NEXT_PUBLIC_WORKFLOW_ID=cmghkokkd02a1qjb2on8r9lc5
   ```

4. **启动开发服务器**
   ```bash
   pnpm dev
   # 或
   npm run dev
   ```

5. **访问应用**
   
   打开浏览器访问：[http://localhost:3000](http://localhost:3000)

## 📚 文档

- [📘 快速启动指南](./QUICKSTART.md) - 5 分钟上手
- [📗 集成文档](./README_INTEGRATION.md) - 完整技术文档
- [📙 环境配置](./ENV_SETUP.md) - 环境变量详解
- [📕 集成完成报告](./INTEGRATION_COMPLETE.md) - 实施细节

## 🎯 使用流程

### 1️⃣ 上传文档
- 访问首页
- 拖放或选择 Word 文档（.doc/.docx）
- 点击"开始智能分析"

### 2️⃣ 智能分析
- 系统自动上传文件
- AI 解析需求内容
- 匹配产品数据库
- 计算最优方案

### 3️⃣ 查看结果
- 仿真机选型结果（匹配度、规格、价格）
- 板卡选型结果（型号、数量、成本）
- 详细的选型建议

### 4️⃣ 采购方案
- 完整的产品配置
- 详细的价格明细
- 自动计算总成本

## 🛠️ 技术栈

- **前端框架**: Next.js 15.2.4
- **UI 框架**: React 19
- **UI 组件**: Radix UI
- **样式方案**: Tailwind CSS 4
- **状态管理**: React Context + sessionStorage
- **类型系统**: TypeScript 5
- **字体**: Geist Sans & Geist Mono
- **图标**: Lucide React

## 📁 项目结构

```
intelligent-selection-system/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # 首页（文件上传）
│   ├── results/page.tsx         # 结果展示页
│   ├── summary/page.tsx         # 采购总结页
│   ├── products/page.tsx        # 产品列表页
│   ├── layout.tsx               # 根布局
│   └── globals.css              # 全局样式
├── components/                   # React 组件
│   ├── ui/                      # UI 基础组件
│   └── product-tooltip.tsx      # 产品提示组件
├── contexts/                     # React Context
│   └── AnalysisContext.tsx      # 分析结果状态管理
├── lib/                          # 工具函数
│   ├── api.ts                   # API 调用封装
│   └── utils.ts                 # 通用工具函数
├── types/                        # TypeScript 类型
│   └── api.ts                   # API 数据类型定义
├── hooks/                        # 自定义 Hooks
├── public/                       # 静态资源
├── .env.local                   # 环境变量（已创建）
├── next.config.mjs              # Next.js 配置
├── tailwind.config.ts           # Tailwind 配置
├── tsconfig.json                # TypeScript 配置
└── package.json                 # 项目依赖
```

## 🔧 可用命令

```bash
# 开发
pnpm dev          # 启动开发服务器（热重载）
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器

# 代码质量
pnpm lint         # 运行 ESLint
pnpm type-check   # TypeScript 类型检查（如果配置）
```

## 🌟 主要特性

### 智能分析引擎
- AI 驱动的需求解析
- 自然语言处理技术
- 精准的规格匹配

### 优化算法
- 线性规划求解器
- 成本最小化目标
- 多约束条件支持

### 用户体验
- 现代化 UI 设计
- 响应式布局
- 实时反馈提示
- 数据持久化

## 📊 API 集成

系统已完全集成后端 API：

### 文件上传
```http
POST /api/file
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

### 工作流执行
```http
POST /api/workflow/run/{workflowId}
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "input": { "file": "..." },
  "runMode": "sync"
}
```

详见 [API 文档](./README_INTEGRATION.md#api-调用流程)

## 🔐 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `NEXT_PUBLIC_API_URL` | API 基础 URL | `https://demo.langcore.cn` |
| `NEXT_PUBLIC_API_TOKEN` | 认证 Token | `sk-zzvwbcaxoss3` |
| `NEXT_PUBLIC_WORKFLOW_ID` | 工作流 ID | `cmghkokkd02a1qjb2on8r9lc5` |

## 🐛 故障排除

### 问题：无法启动开发服务器
**解决方案**:
```bash
# 清除缓存并重新安装
rm -rf node_modules .next
pnpm install
pnpm dev
```

### 问题：分析失败
**解决方案**:
1. 检查网络连接
2. 确认 `.env.local` 配置正确
3. 查看浏览器控制台错误信息
4. 确认文件格式为 .doc 或 .docx

### 问题：页面空白
**解决方案**:
1. 按 F12 打开开发者工具
2. 查看 Console 标签的错误信息
3. 检查 Network 标签的网络请求
4. 清除浏览器缓存后重试

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 📞 联系我们

如有问题或建议，请通过以下方式联系：

- 📧 Email: [your-email@example.com](mailto:your-email@example.com)
- 💬 Issue: [GitHub Issues](https://github.com/your-repo/issues)
- 📖 文档: [完整文档](./README_INTEGRATION.md)

## 🙏 致谢

感谢以下开源项目：

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)

---

**Made with ❤️ by LangCore Team**


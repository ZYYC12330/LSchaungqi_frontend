# 快速启动指南

## 第一次使用

### 1. 配置环境变量

在项目根目录创建 `.env.local` 文件：

```bash
NEXT_PUBLIC_API_URL=https://demo.langcore.cn
NEXT_PUBLIC_API_TOKEN=sk-zzvwbcaxoss3
NEXT_PUBLIC_WORKFLOW_ID=cmghkokkd02a1qjb2on8r9lc5
```

### 2. 安装依赖

```bash
pnpm install
```

如果没有 pnpm，可以先安装：
```bash
npm install -g pnpm
```

或使用 npm：
```bash
npm install
```

### 3. 启动开发服务器

```bash
pnpm dev
```

或：
```bash
npm run dev
```

### 4. 访问应用

打开浏览器访问：`http://localhost:3000`

## 使用流程

### Step 1: 上传文件
1. 访问首页 (`http://localhost:3000`)
2. 拖放或选择 Word 文档（.doc 或 .docx）
3. 点击"开始智能分析"按钮

### Step 2: 等待分析
- 系统会自动上传文件到服务器
- 后端 AI 会分析文档内容
- 提取技术需求并匹配产品库
- 计算最优采购方案

### Step 3: 查看结果
- 自动跳转到结果页面
- 查看仿真机选型结果（匹配度、规格、价格）
- 查看板卡选型结果（型号、数量、价格）
- 点击需求可查看所有匹配产品（可选）

### Step 4: 采购总结
- 点击"查看采购方案总结"按钮
- 查看完整的仿真机配置
- 查看板卡采购清单
- 查看总成本计算

## 命令参考

```bash
# 开发模式
pnpm dev          # 启动开发服务器（支持热重载）

# 生产构建
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器

# 代码检查
pnpm lint         # 运行 ESLint 检查代码
```

## 项目结构

```
intelligent-selection-system/
├── app/                    # Next.js 应用页面
│   ├── page.tsx           # 首页（文件上传）
│   ├── results/           # 结果页面
│   ├── summary/           # 总结页面
│   └── products/          # 产品列表页
├── components/            # React 组件
│   └── ui/               # UI 组件库
├── contexts/              # React Context
│   └── AnalysisContext.tsx  # 分析结果状态管理
├── lib/                   # 工具函数
│   ├── api.ts            # API 调用封装
│   └── utils.ts          # 通用工具
├── types/                 # TypeScript 类型定义
│   └── api.ts            # API 数据类型
└── .env.local            # 环境变量（需手动创建）
```

## 常见问题

### Q: 分析失败怎么办？
**A**: 
1. 检查网络连接
2. 确认 `.env.local` 配置正确
3. 查看浏览器控制台错误信息
4. 确认上传的文件格式正确（.doc 或 .docx）

### Q: 结果页面空白？
**A**: 
1. 确认已完成文件上传和分析
2. 检查浏览器控制台是否有错误
3. 清除浏览器缓存后重试

### Q: 如何重新分析？
**A**: 
1. 点击页面左上角的返回按钮
2. 或直接访问首页 `http://localhost:3000`
3. 重新上传文件即可

### Q: 数据会保存吗？
**A**: 
- 分析结果会自动保存在浏览器的 sessionStorage 中
- 关闭浏览器标签后数据会保留
- 关闭整个浏览器后数据会清除
- 数据有效期为 24 小时

## 技术支持

如遇到问题：
1. 查看 `README_INTEGRATION.md` 了解详细技术文档
2. 查看 `ENV_SETUP.md` 了解环境变量配置
3. 检查浏览器控制台错误信息
4. 联系开发团队

## 下一步

- 📖 阅读 [集成文档](./README_INTEGRATION.md) 了解技术细节
- ⚙️ 查看 [环境配置](./ENV_SETUP.md) 配置不同环境
- 🚀 开始使用系统进行智能选型！


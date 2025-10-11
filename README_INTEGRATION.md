# 智能选型系统 - 前后端集成文档

## 概述

本系统已集成后端 API，实现了从文件上传到智能分析、结果展示的完整流程。

## 环境配置

### 1. 创建环境变量文件

在项目根目录创建 `.env.local` 文件（如果还没有）：

```bash
NEXT_PUBLIC_API_URL=https://demo.langcore.cn
NEXT_PUBLIC_API_TOKEN=sk-zzvwbcaxoss3
NEXT_PUBLIC_WORKFLOW_ID=cmghkokkd02a1qjb2on8r9lc5
```

**注意：** `.env.local` 文件已在 `.gitignore` 中，不会被提交到版本控制。

### 2. 安装依赖

```bash
pnpm install
# 或
npm install
```

### 3. 启动开发服务器

```bash
pnpm dev
# 或
npm run dev
```

访问 `http://localhost:3000` 即可使用系统。

## 功能流程

### 1. 文件上传 (`/`)
- 用户上传 Word 文档（.doc, .docx）
- 点击"开始智能分析"触发分析流程

### 2. 智能分析
**后端调用流程：**
1. **上传文件** → `POST /api/file`
   - 请求：FormData 包含文件
   - 响应：`{ status: "success", data: { fileId: "..." } }`

2. **运行工作流** → `POST /api/workflow/run/{WORKFLOW_ID}`
   - 请求：
     ```json
     {
       "input": {
         "file": "https://demo.langcore.cn/api/file/{fileId}"
       },
       "runMode": "sync"
     }
     ```
   - 响应：包含仿真机和板卡分析结果

### 3. 结果展示 (`/results`)
- 显示仿真机选型结果
  - 原始需求
  - 匹配度（基于 score 评分）
  - 选型产品
  - 建议说明
- 显示板卡选型结果
  - 优化后的板卡配置
  - 数量和单价
  - 采购建议

### 4. 采购总结 (`/summary`)
- 仿真机详细规格
- 板卡采购清单
- 总成本计算

## 技术架构

### 核心文件

1. **API 服务层** (`lib/api.ts`)
   - `uploadFile(file)`: 上传文件
   - `runWorkflow(fileId)`: 运行分析工作流
   - `analyzeFile(file)`: 完整分析流程

2. **类型定义** (`types/api.ts`)
   - 定义所有 API 响应数据结构
   - 辅助函数（格式化、颜色映射等）

3. **状态管理** (`contexts/AnalysisContext.tsx`)
   - 使用 React Context 管理分析结果
   - 自动保存到 sessionStorage
   - 24小时过期机制

4. **页面组件**
   - `app/page.tsx`: 文件上传页
   - `app/results/page.tsx`: 结果展示页
   - `app/summary/page.tsx`: 采购总结页
   - `app/products/page.tsx`: 产品列表页（保留原模拟数据）

### 数据流

```
用户上传文件
    ↓
调用 analyzeFile()
    ↓
1. uploadFile() → 获取 fileId
    ↓
2. runWorkflow(fileId) → 获取分析结果
    ↓
保存到 AnalysisContext
    ↓
跳转到 /results 页面
    ↓
从 Context 读取数据并展示
```

## 数据结构说明

### 仿真机结果 (SimulatorResult)

```typescript
{
  result_id: {
    id: string,
    details: [
      {
        category: "CPU" | "Memory" | "Hard Disk" | "Slots",
        score: number,  // 0-1 之间，表示匹配度
        reason: string,
        original: string,  // 原始需求
        cpu?: string,
        memory?: string,
        hard_disk?: string,
        slots?: string
      }
    ],
    total_score: number
  }
}
```

### 板卡结果 (CardResult)

```typescript
{
  Body: {
    success: boolean,
    message: string,
    total_cards: number,
    optimized_solution: [
      {
        model: string,      // 板卡型号
        quantity: number,   // 数量
        unit_price: number, // 单价
        total_price: number // 总价
      }
    ],
    total_cost: number,
    channel_satisfaction: [...]
  }
}
```

## 错误处理

系统包含完善的错误处理机制：

1. **网络错误**: 显示 Toast 提示
2. **API 错误**: 捕获并显示具体错误信息
3. **数据缺失**: 自动重定向到首页
4. **超时处理**: 同步模式，等待后端完成分析

## 部署说明

### 生产环境配置

1. 创建 `.env.production` 文件：
```bash
NEXT_PUBLIC_API_URL=https://your-production-api.com
NEXT_PUBLIC_API_TOKEN=your-production-token
NEXT_PUBLIC_WORKFLOW_ID=your-workflow-id
```

2. 构建生产版本：
```bash
pnpm build
```

3. 启动生产服务器：
```bash
pnpm start
```

### Docker 部署

如果需要 Docker 部署，可以使用项目中的 Dockerfile。

## 常见问题

### 1. 分析失败怎么办？
- 检查网络连接
- 确认 API Token 是否正确
- 查看浏览器控制台错误信息

### 2. 数据不显示？
- 检查是否已完成文件上传和分析
- 查看 sessionStorage 中是否有 `intelligent_selection_analysis_result`
- 确认后端返回的数据结构是否正确

### 3. 如何清除缓存数据？
- 打开浏览器开发者工具
- Application → Session Storage → 删除对应键值
- 或者重新上传文件进行分析

## 开发注意事项

1. **环境变量**
   - 所有客户端可访问的环境变量必须以 `NEXT_PUBLIC_` 开头
   - 修改 `.env.local` 后需要重启开发服务器

2. **状态管理**
   - 分析结果自动保存到 sessionStorage
   - 页面刷新后数据保持（24小时内）
   - 清除浏览器数据会丢失分析结果

3. **API 调用**
   - 所有 API 调用都在 `lib/api.ts` 中集中管理
   - 使用 APIError 类处理错误
   - 支持同步模式（runMode: "sync"）

## 后续优化建议

1. **性能优化**
   - 添加请求缓存机制
   - 实现进度条显示真实上传/分析进度
   - 支持大文件分片上传

2. **功能增强**
   - 支持历史记录查看
   - 导出采购方案为 PDF/Excel
   - 支持多文件批量分析

3. **用户体验**
   - 添加分析结果对比功能
   - 支持自定义筛选条件
   - 提供更详细的产品说明

## 联系方式

如有问题，请联系开发团队。


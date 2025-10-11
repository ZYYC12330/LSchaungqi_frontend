# 数据集成完成文档

## 概述
已成功将workflow返回的JSON数据集成到智能选型系统的前端页面中。

## 数据结构支持

### 1. 仿真机数据 (sim)
- **位置**: `to_chatbot.sim`
- **字段**:
  - `id`: 仿真机ID
  - `details[]`: 包含CPU、内存、硬盘、插槽的详细信息
    - `category`: 类别 (CPU, Memory, Hard Disk, Slots)
    - `score`: 匹配评分 (0-1)
    - `reason`: 匹配原因
    - `original`: 原始需求
    - 对应的字段 (`cpu`, `memory`, `hard_disk`, `slots`)
  - `total_score`: 总评分

### 2. 板卡数据 (card)
- **位置**: `to_chatbot.card`
- **字段**:
  - `success`: 优化是否成功
  - `message`: 消息
  - `total_cards`: 总板卡数
  - `requirements_summary[]`: 需求摘要
  - `feasibility_checks[]`: 可行性检查
  - `optimized_solution[]`: 优化方案
    - `model`: 板卡型号
    - `quantity`: 数量
    - `unit_price`: 单价
    - `total_price`: 总价
    - `id`: 板卡ID
  - `total_cost`: 总成本
  - `channel_satisfaction[]`: 通道满足情况

### 3. 所有板卡详情 (all_cards)
- **位置**: `to_chatbot.all_cards[]`
- **用途**: 点击需求链接后跳转展示所有匹配的板卡
- **字段**:
  - `Channels_type`: 通道类型 (如 "serialPortChannels", "canBusChannels" 等)
  - `matched_board[]`: 匹配的板卡列表
    - `id`: 板卡ID
    - `reason`: 匹配原因
    - `price_cny`: 价格（人民币）
    - `description`: **产品描述（用于悬停显示）**
    - `match_degree`: 匹配度 (0-1)
    - `original`: 原始需求

## 页面集成说明

### 1. Results 页面 (`app/results/page.tsx`)
**功能**:
- 显示仿真机选型表格
- 显示板卡选型表格
- **悬停显示**: 鼠标悬停在产品型号上时显示 `description` 字段内容
- **点击跳转**: 点击"客户原始需求"单元格跳转到产品详情页

**数据来源**:
- 仿真机: `analysisResult.simulator.result_id.details`
- 板卡: `analysisResult.cards.Body.optimized_solution`
- 描述: 从 `all_cards` 中根据 `id` 匹配获取

### 2. Products 页面 (`app/products/page.tsx`)
**功能**:
- 显示某个通道类型的所有匹配板卡
- 高亮显示已选中的板卡（在优化方案中的）
- 显示板卡ID、匹配度、价格、匹配原因、产品描述

**数据来源**:
- 从 URL 参数获取 `channelType`
- 从 `analysisResult.cards.all_cards` 中查找对应的 `matched_board`
- 从 `analysisResult.cards.Body.optimized_solution` 获取推荐板卡

### 3. Summary 页面 (`app/summary/page.tsx`)
**功能**:
- 显示仿真机完整配置信息（包含ID和名称）
- 显示板卡采购清单（包含ID和详细描述）
- 显示总成本

**数据来源**:
- 仿真机: `analysisResult.simulator.result_id`
- 板卡: `analysisResult.cards.Body.optimized_solution`
- 描述: 从 `all_cards` 中匹配获取

### 4. ProductTooltip 组件 (`components/product-tooltip.tsx`)
**功能**:
- 鼠标悬停显示产品详细描述
- 支持多行文本和换行符

**使用方式**:
```tsx
<ProductTooltip productName="产品型号" description="产品描述内容">
  <span>产品型号</span>
</ProductTooltip>
```

## API 数据处理 (`lib/api.ts`)

### 兼容性
API处理逻辑支持多种数据格式:
- `to_chatbot` (新格式) ✓
- `to_web` (旧格式) ✓

### 字段映射
- `sim` → `simulator`
- `card` → `cards.Body`
- `all_cards` → `cards.all_cards`

### 示例响应处理
```json
{
  "output": {
    "to_chatbot": {
      "sim": { ... },
      "card": { ... },
      "all_cards": [ ... ]
    }
  }
}
```

## 类型定义 (`types/api.ts`)

新增类型:
- `MatchedBoard`: 匹配板卡详情
- `AllCardChannel`: 所有板卡信息
- `OptimizedCard`: 增加 `id` 字段

扩展类型:
- `CardResult.all_cards`: 可选的所有板卡数组
- `AnalysisResult.simulatorName`: 可选的仿真机名称

## 使用示例

### 1. 完整的workflow输出示例
参见: `SAMPLE_workflow_output.json`

### 2. 上传文件并分析
```typescript
import { analyzeFile } from "@/lib/api"

const result = await analyzeFile(file)
// result 将包含 simulator, cards (with all_cards)
```

### 3. 在页面中使用
```typescript
const { analysisResult } = useAnalysis()

// 获取all_cards
const allCards = analysisResult.cards.all_cards || []

// 根据ID查找板卡描述
const card = allCards
  .flatMap(group => group.matched_board)
  .find(board => board.id === cardId)
```

## 通道类型映射

支持的通道类型 (`CHANNEL_TYPE_NAMES`):
- `analogInputChannels` - 模拟输入通道
- `analogOutputChannels` - 模拟输出通道
- `digitalInputChannels` - 数字输入通道
- `digitalOutputChannels` - 数字输出通道
- `serialPortChannels` - 串口通道
- `canBusChannels` - CAN总线通道
- `pwmOutputChannels` - PWM输出通道
- `encoderChannels` - 编码器通道
- `differentialInputChannels` - 差分输入通道
- 等等...

## 数据流程

```
用户上传文件
    ↓
uploadFile() → 返回 fileId
    ↓
runWorkflow(fileId) → 返回完整结果 (包含 all_cards)
    ↓
setAnalysisResult() → 保存到 context
    ↓
页面使用 useAnalysis() 获取数据
    ↓
Results 页面显示概览 + 悬停提示
    ↓
Products 页面显示详细列表
    ↓
Summary 页面显示最终方案
```

## 注意事项

1. **描述字段格式**: `description` 字段可能包含换行符 `\n`，前端使用 `whitespace-pre-line` CSS 类正确显示

2. **板卡ID匹配**: 
   - 优化方案中的板卡通过 `id` 字段关联
   - 需要在 `all_cards` 中查找对应的 `description`

3. **通道类型**: 
   - 使用 `Channels_type` 字段标识通道类型
   - 需要与 `CHANNEL_TYPE_NAMES` 映射以显示中文名称

4. **数据持久化**: 
   - 使用 `sessionStorage` 存储分析结果
   - 24小时后自动过期

5. **错误处理**: 
   - 如果未找到 `all_cards`，返回空数组 `[]`
   - Products 页面会显示"未找到匹配的产品"

## 测试建议

1. 使用 `SAMPLE_workflow_output.json` 中的数据进行前端测试
2. 验证悬停提示正确显示 `description` 内容
3. 验证点击需求跳转到正确的产品详情页
4. 验证所有通道类型都能正确显示中文名称

## 完成状态

✅ 类型定义更新
✅ API处理逻辑更新
✅ ProductTooltip 组件支持动态描述
✅ Results 页面集成
✅ Products 页面集成
✅ Summary 页面集成
✅ 数据流程测试
✅ 示例数据准备


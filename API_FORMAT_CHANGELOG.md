# API 格式变更说明

## 概述

Workflow API 接口返回的数据格式已更新。前端代码已完成适配，同时保持对旧格式的兼容性。

## 格式对比

### 新格式（当前）

```json
{
  "to_chatbot": {
    "sim": {
      "id": "...",
      "details": [...],
      "total_score": 2.8
    },
    "card": {
      "success": true,
      "message": "...",
      "total_cards": 26,
      "requirements_summary": [...],
      "feasibility_checks": [...],
      "optimized_solution": [...],
      "total_cost": 1470,
      "channel_satisfaction": [...],
      "unsatisfied_requirements": [...]
    },
    "all_cards": [...],
    "raw_sim": [...],
    "unsatisfied": [...]
  }
}
```

### 旧格式（仍然兼容）

```json
{
  "output": {
    "to_web": {
      "simulator": {...},
      "cards": {...}
    }
  }
}
```

## 主要变化

### 1. 顶层结构变化

- **新格式**: 数据直接在根级别的 `to_chatbot` 下
- **旧格式**: 数据在 `output.to_web` 或 `output.to_chatbot` 下

### 2. 字段名称变化

| 旧字段名 | 新字段名 | 说明 |
|---------|---------|------|
| `simulator` | `sim` | 仿真机数据 |
| `cards` | `card` | 板卡数据 |

### 3. 新增字段

新格式增加了以下字段：

- **`raw_sim`**: 原始仿真机完整信息
  ```typescript
  interface RawSimulator {
    id: string
    category: string
    type: string
    model: string
    brief_description: string
    detailed_description: string
    manufacturer: string
    price_cny: number
    series: string
    cpu: string
    hard_disk: string
    memory: string
    slots: string
  }
  ```

- **`unsatisfied`**: 未满足的需求列表
  ```typescript
  interface UnsatisfiedRequirement {
    original: string        // 原始需求描述
    reason: string         // 无法满足的原因
    Channels_type: string  // 通道类型
  }
  ```

### 4. 数据结构保持不变

以下数据结构在新旧格式中保持一致：

- `details` - 仿真机匹配详情
- `optimized_solution` - 优化的板卡方案
- `all_cards` - 所有匹配的板卡信息
- `channel_satisfaction` - 通道满足情况

## 代码适配

### 类型定义 (`types/api.ts`)

新增了以下类型定义：

```typescript
// 原始仿真机信息
export interface RawSimulator { ... }

// 未满足的需求
export interface UnsatisfiedRequirement { ... }

// 新格式输出数据
export interface ToChatbotOutput { ... }

// 旧格式输出数据
export interface ToWebOutput { ... }
```

### API 解析逻辑 (`lib/api.ts`)

更新了 `runWorkflow` 函数，支持多种格式：

```typescript
// 支持多种数据格式：
// 1. 新格式：直接在根级别的 to_chatbot
// 2. 旧格式：output.to_chatbot 或 output.to_web
const outputData = rawData.to_chatbot || rawData.output?.to_chatbot || rawData.output?.to_web

// 处理仿真机数据（支持 sim 和 simulator 两种格式）
const simulatorData = outputData.sim || outputData.simulator

// 处理板卡数据（支持 card 和 cards 两种格式）
const cardData = outputData.card || outputData.cards
```

## 向后兼容性

前端代码已实现完全向后兼容：

✅ 支持新格式 (`to_chatbot` 在根级别)
✅ 支持旧格式 (`output.to_web` 或 `output.to_chatbot`)
✅ 支持新旧字段名 (`sim`/`simulator`, `card`/`cards`)
✅ 新增字段为可选，不影响旧数据的处理

## 测试验证

使用 `SAMPLE_workflow_output.json` 验证了新格式的正确解析：

- ✅ 仿真机数据正确提取
- ✅ 板卡数据正确提取
- ✅ 所有通道信息正确显示
- ✅ 未找到的板卡正确标识
- ✅ 新增字段 `raw_sim` 和 `unsatisfied` 正确解析

## 使用说明

前端代码无需任何修改即可处理新格式的数据。所有页面（results, products, summary）均已验证兼容。

如需访问新增的字段：

```typescript
// 访问原始仿真机信息（如果可用）
const rawSim = analysisResult.rawSimulator

// 访问未满足的需求（如果可用）
const unsatisfied = analysisResult.unsatisfied
```

## 更新日期

2025-10-11


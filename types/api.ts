// API 响应类型定义

// 文件上传响应
export interface FileUploadResponse {
  status: string
  data: {
    fileId: string
  }
}

// 仿真机匹配详情
export interface SimulatorDetail {
  category: string
  score: number
  reason: string
  original: string
  cpu?: string
  hard_disk?: string
  memory?: string
  slots?: string
}

// 仿真机结果
export interface SimulatorResult {
  result_id: {
    id: string
    details: SimulatorDetail[]
    total_score: number
  }
}

// 板卡信息
export interface OptimizedCard {
  model: string
  quantity: number
  unit_price: number
  total_price: number
  id: string
}

// 匹配的板卡详情
export interface MatchedBoard {
  id: string
  reason: string
  price_cny: number
  description: string
  match_degree: number
  original: string
  model?: string // 产品型号字段（后端提供）
}

// 所有板卡信息
export interface AllCardChannel {
  matched_board: MatchedBoard[]
  Channels_type: string
}

// 需求摘要
export interface RequirementSummary {
  index: number
  channel_type: string
  required: number
}

// 可行性检查
export interface FeasibilityCheck {
  channel_type: string
  required: number
  available_total: number
  max_single_card: number
  status: string
}

// 通道满足情况
export interface ChannelSatisfaction {
  channel_type: string
  required: number
  satisfied: number
  status: string
}

// 板卡结果
export interface CardResult {
  Body: {
    success: boolean
    message: string
    total_cards: number
    requirements_summary: RequirementSummary[]
    feasibility_checks: FeasibilityCheck[]
    optimized_solution: OptimizedCard[]
    total_cost: number
    channel_satisfaction: ChannelSatisfaction[]
  }
  all_cards?: AllCardChannel[]
}

// 原始仿真机信息
export interface RawSimulator {
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

// 未满足的需求
export interface UnsatisfiedRequirement {
  original: string
  reason: string
  Channels_type: string
}

// 新格式 to_chatbot 输出数据
export interface ToChatbotOutput {
  sim: {
    id: string
    details: SimulatorDetail[]
    total_score: number
  }
  card: {
    success: boolean
    message: string
    total_cards: number
    requirements_summary: RequirementSummary[]
    feasibility_checks: FeasibilityCheck[]
    optimized_solution: OptimizedCard[]
    total_cost: number
    channel_satisfaction: ChannelSatisfaction[]
    unsatisfied_requirements?: Array<{
      channel_type: string
      required: number
      available: number
    }>
  }
  all_cards: AllCardChannel[]
  raw_sim: RawSimulator[]
  unsatisfied: UnsatisfiedRequirement[]
}

// 旧格式 to_web 输出数据
export interface ToWebOutput {
  simulator: SimulatorResult
  cards: {
    success: boolean
    message: string
    total_cards: number
    requirements_summary: RequirementSummary[]
    feasibility_checks: FeasibilityCheck[]
    optimized_solution: OptimizedCard[]
    total_cost: number
    channel_satisfaction: ChannelSatisfaction[]
  }
}

// Workflow API 原始响应（兼容新旧格式）
export interface WorkflowAPIResponse {
  status?: string
  // 新格式：直接在根级别
  to_chatbot?: ToChatbotOutput
  // 旧格式：嵌套在 output 下
  output?: {
    to_web?: ToWebOutput
    to_chatbot?: ToChatbotOutput
  }
}

// Workflow 完整响应（处理后的扁平结构）
export interface WorkflowResponse {
  simulator: SimulatorResult
  cards: CardResult
}

// 分析结果上下文类型
export interface AnalysisResult {
  simulator: SimulatorResult
  cards: CardResult
  timestamp: number
  simulatorName?: string
  rawSimulator?: RawSimulator[]  // 原始仿真机信息
  unsatisfied?: UnsatisfiedRequirement[]  // 未满足的需求
}

// 通道类型名称映射
export const CHANNEL_TYPE_NAMES: Record<string, string> = {
  analogInputChannels: "模拟输入通道",
  analogOutputChannels: "模拟输出通道",
  digitalInputChannels: "数字输入通道",
  digitalOutputChannels: "数字输出通道",
  digitalIOChannels: "数字IO通道",
  serialPortChannels: "串口通道",
  canBusChannels: "CAN总线通道",
  pwmOutputChannels: "PWM输出通道",
  encoderChannels: "编码器通道",
  ssiBusChannels: "SSI总线通道",
  spiBusChannels: "SPI总线通道",
  i2cBusChannels: "I2C总线通道",
  pcmLvdChannels: "PCM LVD通道",
  bissCChannels: "BiSSC通道",
  afdxChannels: "AFDX通道",
  ppsPulseChannels: "PPS脉冲通道",
  rtdResistanceChannels: "RTD电阻通道",
  differentialInputChannels: "差分输入通道",
  milStd1553BChannels: "MIL-STD-1553B通道",
  timerCounterChannels: "定时计数通道",
  relayOutputChannels: "继电器输出通道",
}

// 辅助函数：获取通道类型中文名
export function getChannelTypeName(channelType: string): string {
  return CHANNEL_TYPE_NAMES[channelType] || channelType
}

// 辅助函数：格式化匹配度
export function formatMatchRate(score: number): string {
  return `${Math.round(score * 100)}%`
}

// 辅助函数：获取匹配度颜色类名
export function getMatchColor(score: number): string {
  const percentage = score * 100
  if (percentage >= 95) return "bg-green-500/10 text-green-700 border-green-500/20"
  if (percentage >= 85) return "bg-blue-500/10 text-blue-700 border-blue-500/20"
  return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
}


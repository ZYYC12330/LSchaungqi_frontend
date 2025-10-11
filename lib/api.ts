import type { FileUploadResponse, WorkflowResponse, WorkflowAPIResponse } from "@/types/api"

// API 配置
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://demo.langcore.cn"
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN 
const WORKFLOW_ID = process.env.NEXT_PUBLIC_WORKFLOW_ID 

// 错误类型
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: any,
  ) {
    super(message)
    this.name = "APIError"
  }
}

/**
 * 对文件名进行 RFC 5987 编码
 * @param filename 原始文件名
 * @returns 编码后的文件名
 */
function encodeRFC5987Filename(filename: string): string {
  // 使用 encodeURIComponent 进行百分号编码
  const encoded = encodeURIComponent(filename)
    // RFC 5987 允许某些字符不编码，以提高可读性
    .replace(/['()]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/\*/g, '%2A')
  
  // RFC 5987 格式：charset'lang'encoded-value
  // 这里使用 UTF-8 编码，不指定语言
  return `UTF-8''${encoded}`
}

/**
 * 上传文件到服务器
 * @param file 要上传的文件
 * @returns 文件 ID
 */
export async function uploadFile(file: File): Promise<string> {
  try {
    const formData = new FormData()
    
    // 对包含中文的文件名进行 RFC 5987 编码
    const encodedFilename = encodeRFC5987Filename(file.name)
    
    // 创建新的 File 对象，使用编码后的文件名
    const encodedFile = new File([file], encodedFilename, { type: file.type })
    
    formData.append("file", encodedFile)

    const response = await fetch(`${API_URL}/api/file`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new APIError(`文件上传失败: ${response.statusText}`, response.status)
    }

    const data: FileUploadResponse = await response.json()

    if (data.status !== "success" || !data.data?.fileId) {
      throw new APIError("文件上传响应格式错误", response.status, data)
    }

    return data.data.fileId
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    throw new APIError(`文件上传失败: ${error instanceof Error ? error.message : "未知错误"}`)
  }
}

/**
 * 运行工作流进行智能分析
 * @param fileId 文件 ID
 * @returns 分析结果
 */
export async function runWorkflow(fileId: string): Promise<WorkflowResponse> {
  try {
    // 构建文件 URL
    const fileUrl = `${API_URL}/api/file/${fileId}`

    const response = await fetch(`${API_URL}/api/workflow/run/${WORKFLOW_ID}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          file_url: fileUrl,
        },
        runMode: "sync",
      }),
    })

    if (!response.ok) {
      throw new APIError(`工作流执行失败: ${response.statusText}`, response.status)
    }

    const rawData: any = await response.json()

    // 支持多种数据格式：to_chatbot 或 to_web
    const outputData = rawData.output?.to_chatbot || rawData.output?.to_web || rawData.to_chatbot

    // 验证返回数据结构
    if (!outputData?.sim && !outputData?.simulator) {
      throw new APIError("工作流响应数据格式错误", response.status, rawData)
    }

    // 处理仿真机数据（支持 sim 和 simulator 两种格式）
    const simulatorData = outputData.sim || outputData.simulator

    // 处理板卡数据
    const cardData = outputData.card || outputData.cards

    // 将嵌套的响应数据转换为扁平结构
    const data: WorkflowResponse = {
      simulator: {
        result_id: {
          id: simulatorData.id,
          details: simulatorData.details,
          total_score: simulatorData.total_score,
        },
      },
      cards: {
        Body: {
          success: cardData.success,
          message: cardData.message,
          total_cards: cardData.total_cards,
          requirements_summary: cardData.requirements_summary || [],
          feasibility_checks: cardData.feasibility_checks || [],
          optimized_solution: cardData.optimized_solution || [],
          total_cost: cardData.total_cost || 0,
          channel_satisfaction: cardData.channel_satisfaction || [],
        },
        all_cards: outputData.all_cards || [],
      },
    }

    return data
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    throw new APIError(`工作流执行失败: ${error instanceof Error ? error.message : "未知错误"}`)
  }
}

/**
 * 完整的分析流程：上传文件并运行工作流
 * @param file 要分析的文件
 * @returns 分析结果
 */
export async function analyzeFile(file: File): Promise<WorkflowResponse> {
  // 1. 上传文件
  const fileId = await uploadFile(file)

  // 2. 运行工作流
  const result = await runWorkflow(fileId)

  return result
}


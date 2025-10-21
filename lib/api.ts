import type { FileUploadResponse, WorkflowResponse, WorkflowAPIResponse } from "@/types/api"
import { config } from "@/lib/config"

// API 配置（使用运行时配置）
const API_URL = config.API_URL
const API_TOKEN = config.API_TOKEN
const WORKFLOW_ID = config.WORKFLOW_ID 

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

    // 打印调试信息
    console.log("📤 上传文件:", {
      原始文件名: file.name,
      编码文件名: encodedFilename,
      文件大小: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      文件类型: file.type,
      API地址: `${API_URL}/api/file`,
      Token: API_TOKEN ? `${API_TOKEN.substring(0, 10)}...` : "未设置"
    })

    const response = await fetch(`${API_URL}/api/file`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: formData,
    })

    console.log("📥 响应状态:", response.status, response.statusText)

    if (!response.ok) {
      // 尝试读取错误响应体
      let errorMessage = response.statusText
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData)
        console.error("❌ 服务器返回错误:", errorData)
      } catch {
        // 如果不是 JSON 格式，尝试读取文本
        try {
          const errorText = await response.text()
          if (errorText) {
            errorMessage = errorText
            console.error("❌ 服务器返回错误文本:", errorText)
          }
        } catch {
          // 忽略
        }
      }
      throw new APIError(`文件上传失败 (状态码 ${response.status}): ${errorMessage}`, response.status)
    }

    const data: FileUploadResponse = await response.json()
    console.log("✅ 上传成功，响应数据:", data)

    if (data.status !== "success" || !data.data?.fileId) {
      console.error("❌ 响应格式错误:", data)
      throw new APIError("文件上传响应格式错误", response.status, data)
    }

    return data.data.fileId
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    
    // 提供更详细的错误信息
    console.error("❌ 文件上传异常:", error)
    
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new APIError(`网络连接失败: 无法连接到 ${API_URL}，请检查：\n1. API地址是否正确\n2. 网络连接是否正常\n3. 服务器是否在运行`)
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

    const rawData: WorkflowAPIResponse = await response.json()

    // 支持多种数据格式：
    // 1. 新格式：直接在根级别的 to_chatbot
    // 2. 旧格式：output.to_chatbot 或 output.to_web
    const outputData = rawData.to_chatbot || rawData.output?.to_chatbot || rawData.output?.to_web

    // 验证返回数据结构
    if (!outputData) {
      throw new APIError("工作流响应数据格式错误：缺少输出数据", response.status, rawData)
    }

    // 使用类型断言来访问属性（因为两种格式的属性名不同）
    const chatbotData = outputData as any
    
    if (!chatbotData.sim && !chatbotData.simulator) {
      throw new APIError("工作流响应数据格式错误：缺少仿真机数据", response.status, rawData)
    }

    // 处理仿真机数据（支持 sim 和 simulator 两种格式）
    const simulatorData = chatbotData.sim || chatbotData.simulator

    // 处理板卡数据（支持 card 和 cards 两种格式）
    const cardData = chatbotData.card || chatbotData.cards

    if (!cardData) {
      throw new APIError("工作流响应数据格式错误：缺少板卡数据", response.status, rawData)
    }

    // 将嵌套的响应数据转换为扁平结构
    const data: WorkflowResponse = {
      simulator: {
        result_id: {
          id: simulatorData.id,
          details: simulatorData.details || [],
          total_score: simulatorData.total_score || 0,
        },
      },
      cards: {
        Body: {
          success: cardData.success !== false,
          message: cardData.message || "",
          total_cards: cardData.total_cards || 0,
          requirements_summary: cardData.requirements_summary || [],
          feasibility_checks: cardData.feasibility_checks || [],
          optimized_solution: cardData.optimized_solution || [],
          total_cost: cardData.total_cost || 0,
          channel_satisfaction: cardData.channel_satisfaction || [],
        },
        all_cards: chatbotData.all_cards || [],
      },
      // 添加 raw_sim 和 unsatisfied 数据
      rawSimulator: chatbotData.raw_sim || [],
      unsatisfied: chatbotData.unsatisfied || [],
      // 添加 sim_pick_list 数据
      simPickList: chatbotData.sim_pick_list || [],
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


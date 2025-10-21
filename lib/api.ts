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
    // 如果使用代理（API_URL 为空），需要使用完整的目标 URL
    const fileUrl = API_URL
      ? `${API_URL}/api/file/${fileId}`
      : `https://demo.langcore.cn/api/file/${fileId}`

    console.log("🚀 运行工作流:", {
      工作流ID: WORKFLOW_ID,
      文件URL: fileUrl,
      API地址: `${API_URL}/api/workflow/run/${WORKFLOW_ID}`,
    })

    // 创建 AbortController 用于超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.warn("⏰ 请求超时，正在取消...")
      controller.abort()
    }, config.TIMEOUT || 600000) // 使用配置的超时时间，默认10分钟

    let response: Response
    try {
      response = await fetch(`${API_URL}/api/workflow/run/${WORKFLOW_ID}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: {
            file_url: fileUrl,
          },
          runMode: "sync"
        }),
        signal: controller.signal,
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new APIError(`请求超时: 超过 ${config.TIMEOUT || 600000}ms 限制`)
      }
      throw fetchError
    }

    clearTimeout(timeoutId)

    console.log("📥 工作流响应状态:", response.status, response.statusText)

    if (!response.ok) {
      let errorText = response.statusText
      try {
        errorText = await response.text()
      } catch {
        // 如果读取响应体失败，使用状态文本
      }
      console.error("❌ 工作流执行失败:", errorText)
      throw new APIError(`工作流执行失败 (${response.status}): ${errorText}`, response.status)
    }

    // 获取响应体内容长度
    const contentLength = response.headers.get('content-length')
    if (contentLength) {
      const sizeMB = parseInt(contentLength) / (1024 * 1024)
      console.log(`📊 响应体大小: ${sizeMB.toFixed(2)} MB`)
      if (sizeMB > 50) {
        console.warn("⚠️ 响应体较大，可能需要较长时间处理")
      }
    }

    let rawData: WorkflowAPIResponse
    let responseText: string = ""

    try {
      // 检查响应是否是流式的
      const transferEncoding = response.headers.get('transfer-encoding')
      const isChunked = transferEncoding?.includes('chunked')
      console.log(`🔄 响应传输编码: ${transferEncoding}`)

      if (isChunked) {
        console.log("🌊 检测到分块传输响应，等待完整接收")
      }

      // 使用流式处理避免一次性加载大文件到内存
      // 对于流式响应，可能需要更长时间，设置合理的超时
      const textPromise = response.text()
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('读取响应体超时')), 300000) // 5分钟超时
      })

      try {
        responseText = await Promise.race([textPromise, timeoutPromise])
      } catch (timeoutError) {
        console.error("⏰ 读取响应体超时:", timeoutError)
        throw new APIError("读取服务器响应超时，请稍后重试", response.status, timeoutError)
      }

      console.log(`📦 响应文本长度: ${responseText.length} 字符`)

      // 检查 Content-Type
      const contentType = response.headers.get('content-type')
      console.log(`📋 响应 Content-Type: ${contentType}`)

      // 如果不是JSON格式，记录前500个字符用于调试
      if (!contentType?.includes('application/json')) {
        console.error("❌ 响应不是JSON格式!")
        console.error("📄 响应内容预览:", responseText.substring(0, 500) + (responseText.length > 500 ? "..." : ""))
        throw new APIError(
          `工作流响应格式错误：服务器返回了 ${contentType || '未知格式'} 而不是JSON格式。响应内容: ${responseText.substring(0, 200)}${responseText.length > 200 ? "..." : ""}`,
          response.status
        )
      }

      rawData = JSON.parse(responseText)
      console.log("✅ JSON 解析成功")
    } catch (parseError) {
      // 如果是JSON解析错误，提供更多调试信息
      if (parseError instanceof SyntaxError) {
        console.error("❌ JSON 语法错误:", parseError.message)
        console.error("📄 响应内容预览:", responseText.substring(0, 500) + (responseText.length > 500 ? "..." : ""))

        // 尝试提供更有用的错误信息
        let errorMessage = "工作流响应JSON格式错误"
        if (responseText.includes("<html>") || responseText.includes("<!DOCTYPE")) {
          errorMessage = "服务器返回了HTML错误页面而不是JSON响应"
        } else if (responseText.includes("502") || responseText.includes("504") || responseText.includes("timeout")) {
          errorMessage = "服务器网关错误或超时"
        } else if (responseText.length > 1000) {
          errorMessage = `响应过大 (${responseText.length} 字符)，可能导致解析失败`
        }

        throw new APIError(`${errorMessage}: ${parseError.message}`, response.status, {
          parseError,
          responsePreview: responseText.substring(0, 300),
          contentType: response.headers.get('content-type'),
          responseLength: responseText.length
        })
      }

      // 如果不是语法错误，重新抛出原始错误
      throw parseError
    }

    // 只在开发模式下记录完整数据
    if (config.DEBUG) {
      console.log("📦 工作流原始数据:", JSON.stringify(rawData, null, 2).substring(0, 1000) + "...")
    } else {
      console.log("📦 工作流数据已接收，跳过详细日志")
    }

    // 支持多种数据格式：
    // 1. 新格式：直接在根级别的 to_chatbot
    // 2. 旧格式：output.to_chatbot 或 output.to_web
    const outputData = rawData.to_chatbot || rawData.output?.to_chatbot || rawData.output?.to_web

    // 验证返回数据结构
    if (!outputData) {
      console.error("❌ 缺少输出数据，rawData 结构:", Object.keys(rawData))
      throw new APIError("工作流响应数据格式错误：缺少输出数据", response.status, rawData)
    }

    console.log("✅ 找到输出数据，outputData 结构:", Object.keys(outputData))

    // 使用类型断言来访问属性（因为两种格式的属性名不同）
    const chatbotData = outputData as any
    
    if (!chatbotData.sim && !chatbotData.simulator) {
      console.error("❌ 缺少仿真机数据，outputData 结构:", Object.keys(chatbotData))
      throw new APIError("工作流响应数据格式错误：缺少仿真机数据", response.status, rawData)
    }

    console.log("✅ 找到仿真机数据")

    // 处理仿真机数据（支持 sim 和 simulator 两种格式）
    const simulatorData = chatbotData.sim || chatbotData.simulator

    // 处理板卡数据（支持 card 和 cards 两种格式）
    const cardData = chatbotData.card || chatbotData.cards

    if (!cardData) {
      console.error("❌ 缺少板卡数据，outputData 结构:", Object.keys(chatbotData))
      console.log("💡 提示：如果工作流正在处理中，可能需要等待...")
      // 不抛出错误，使用空数据
      console.warn("⚠️ 使用空板卡数据继续处理")
    }

    console.log("✅ 数据验证通过，开始转换数据结构")

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
          success: cardData?.success !== false,
          message: cardData?.message || "",
          total_cards: cardData?.total_cards || 0,
          requirements_summary: cardData?.requirements_summary || [],
          feasibility_checks: cardData?.feasibility_checks || [],
          optimized_solution: cardData?.optimized_solution || [],
          total_cost: cardData?.total_cost || 0,
          channel_satisfaction: cardData?.channel_satisfaction || [],
        },
        all_cards: chatbotData.all_cards || [],
      },
      // 添加 raw_sim 和 unsatisfied 数据
      rawSimulator: chatbotData.raw_sim || [],
      unsatisfied: chatbotData.unsatisfied || [],
      // 添加 sim_pick_list 数据
      simPickList: chatbotData.sim_pick_list || [],
    }

    console.log("✅ 数据转换完成")
    return data
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }

    // 特殊处理网络相关错误
    if (error instanceof TypeError && error.message.includes("fetch")) {
      console.error("❌ 网络连接错误:", error.message)
      throw new APIError(
        "网络连接失败：无法连接到服务器，请检查网络连接或稍后重试",
        undefined,
        error
      )
    }

    // 特殊处理超时错误
    if (error instanceof Error && error.name === 'AbortError') {
      console.error("❌ 请求超时:", error.message)
      throw new APIError(
        `请求超时：服务器响应时间过长，已取消请求`,
        undefined,
        error
      )
    }

    console.error("❌ 工作流执行异常:", error)
    console.error("   错误类型:", error instanceof Error ? error.constructor.name : typeof error)
    console.error("   错误消息:", error instanceof Error ? error.message : String(error))
    if (error instanceof Error && error.stack) {
      console.error("   错误堆栈:", error.stack.split('\n').slice(0, 3).join('\n'))
    }

    throw new APIError(
      `工作流执行失败: ${error instanceof Error ? error.message : "未知错误"}`,
      undefined,
      error
    )
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


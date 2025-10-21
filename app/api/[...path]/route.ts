import { NextRequest, NextResponse } from 'next/server'

// 目标 API 服务器
const TARGET_API_URL = 'https://demo.langcore.cn/api'

// 不需要转发的 headers
const SKIP_HEADERS = [
  'host',
  'connection',
  'content-length',
  'content-encoding', // fetch 自动解压缩，不要转发此 header
  'transfer-encoding',
  'keep-alive',
  'upgrade',
  'expect',
]

/**
 * 通用 API 代理处理器
 * 将所有 /api/* 请求转发到目标服务器
 */
async function handleProxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    // Next.js 15 要求 await params
    const { path: pathArray } = await params
    
    // 构建目标 URL
    const path = pathArray.join('/')
    const targetUrl = `${TARGET_API_URL}/${path}`
    
    // 复制 URL 搜索参数
    const url = new URL(targetUrl)
    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.append(key, value)
    })

    // 复制请求 headers（排除不需要的）
    const headers = new Headers()
    request.headers.forEach((value, key) => {
      if (!SKIP_HEADERS.includes(key.toLowerCase())) {
        headers.set(key, value)
      }
    })

    // 准备请求体
    let body: BodyInit | null = null
    const contentType = request.headers.get('content-type')
    
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      if (contentType?.includes('multipart/form-data')) {
        // FormData 请求（文件上传）
        body = await request.formData()
        // 删除 content-type，让浏览器自动设置正确的 boundary
        headers.delete('content-type')
      } else if (contentType?.includes('application/json')) {
        // JSON 请求
        body = await request.text()
      } else {
        // 其他类型的请求体
        body = await request.arrayBuffer()
      }
    }

    console.log(`🔄 代理请求: ${request.method} /api/${path} -> ${url.toString()}`)
    if (headers.has('authorization')) {
      console.log(`   🔑 Authorization: ${headers.get('authorization')?.substring(0, 20)}...`)
    }

    // 创建 AbortController 用于超时控制
    const controller = new AbortController()
    const timeoutMs = 10 * 60 * 1000 // 10分钟超时
    const timeoutId = setTimeout(() => {
      console.warn(`⏰ 代理请求超时: ${request.method} /api/${path}`)
      controller.abort()
    }, timeoutMs)

    let response: Response
    try {
      // 发送请求到目标服务器
      response = await fetch(url.toString(), {
        method: request.method,
        headers,
        body,
        signal: controller.signal,
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      console.error(`❌ 代理请求失败: ${request.method} /api/${path}`, fetchError)

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { status: 'error', message: '请求超时：服务器响应时间过长' },
          { status: 408 }
        )
      }

      return NextResponse.json(
        {
          status: 'error',
          message: fetchError instanceof Error ? fetchError.message : '网络请求失败'
        },
        { status: 502 }
      )
    }

    clearTimeout(timeoutId)
    console.log(`✅ 代理响应: ${response.status} ${response.statusText}`)

    // 如果响应失败，记录错误详情
    if (!response.ok) {
      let errorText = response.statusText
      let contentType = response.headers.get('content-type') || 'text/plain'

      try {
        errorText = await response.text()
      } catch {
        // 如果读取响应体失败，使用状态文本
        errorText = response.statusText || `HTTP ${response.status}`
      }

      console.error(`❌ 代理错误响应 (${response.status}):`, errorText.substring(0, 500) + (errorText.length > 500 ? "..." : ""))

      // 检查是否是HTML错误页面
      if (contentType.includes('text/html') || errorText.includes('<html>') || errorText.includes('<!DOCTYPE')) {
        console.error("⚠️ 服务器返回了HTML错误页面，可能是网关错误或服务器问题")
        // 转换为JSON错误响应
        return NextResponse.json(
          {
            status: 'error',
            message: `服务器错误 (${response.status}): 网关或服务器问题`,
            details: errorText.substring(0, 200) + (errorText.length > 200 ? "..." : "")
          },
          { status: response.status }
        )
      }

      return new NextResponse(errorText, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // 复制响应 headers
    const responseHeaders = new Headers()
    response.headers.forEach((value, key) => {
      if (!SKIP_HEADERS.includes(key.toLowerCase())) {
        responseHeaders.set(key, value)
      }
    })

    // 添加 CORS headers
    responseHeaders.set('Access-Control-Allow-Origin', '*')
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    responseHeaders.set('Access-Control-Allow-Headers', '*')

    // 检查是否是流式响应
    const transferEncoding = response.headers.get('transfer-encoding')
    const isChunked = transferEncoding?.includes('chunked')
    const contentLength = response.headers.get('content-length')
    const hasContentLength = contentLength !== null

    console.log(`🔄 响应传输编码: ${transferEncoding}`)
    console.log(`📏 响应内容长度: ${contentLength || '未知'}`)

    // 如果是流式响应（分块传输或没有content-length），直接返回流
    if (isChunked || !hasContentLength) {
      console.log("🌊 检测到流式响应，使用流式转发")

      // 对于流式响应，直接返回 Response 对象，保持流的完整性
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      })
    }

    // 处理普通响应体，避免一次性加载大文件到内存
    const sizeMB = parseInt(contentLength) / (1024 * 1024)
    console.log(`📊 代理响应体大小: ${sizeMB.toFixed(2)} MB`)

    let responseBody: ArrayBuffer | string
    try {
      // 对于大响应体，使用流式处理
      if (parseInt(contentLength) > 10 * 1024 * 1024) { // 大于10MB
        console.log("📦 大响应体，使用流式处理")
        responseBody = await response.arrayBuffer()
      } else {
        // 小响应体，直接读取文本
        const textBody = await response.text()

        // 在开发模式下记录响应体（仅对JSON且大小合理）
        if (process.env.NODE_ENV === 'development' && responseHeaders.get('content-type')?.includes('application/json') && textBody.length < 10000) {
          try {
            const jsonBody = JSON.parse(textBody)
            console.log(`📦 响应数据:`, JSON.stringify(jsonBody, null, 2).substring(0, 500) + '...')
          } catch {
            // 忽略非JSON响应或解析错误
          }
        }

        responseBody = new TextEncoder().encode(textBody).buffer
      }
    } catch (bodyError) {
      console.error("❌ 读取响应体失败:", bodyError)
      return NextResponse.json(
        { status: 'error', message: '读取服务器响应失败' },
        { status: 502 }
      )
    }

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('❌ 代理错误:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : '代理请求失败',
      },
      { status: 500 }
    )
  }
}

// 处理 OPTIONS 预检请求
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400',
    },
  })
}

// 导出所有 HTTP 方法的处理器
export const GET = handleProxy
export const POST = handleProxy
export const PUT = handleProxy
export const DELETE = handleProxy
export const PATCH = handleProxy


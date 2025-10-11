// 运行时配置管理
// 优先使用运行时配置（public/config.js），回退到环境变量

interface AppConfig {
  API_URL: string
  API_TOKEN: string
  WORKFLOW_ID: string
  DEBUG?: boolean
  TIMEOUT?: number
}

// 类型声明
declare global {
  interface Window {
    __APP_CONFIG__?: AppConfig
  }
}

/**
 * 获取配置项
 * 优先级：运行时配置 > 环境变量 > 默认值
 */
function getConfig<K extends keyof AppConfig>(
  key: K,
  defaultValue?: AppConfig[K]
): AppConfig[K] | undefined {
  // 1. 尝试从运行时配置获取
  if (typeof window !== "undefined" && window.__APP_CONFIG__) {
    const value = window.__APP_CONFIG__[key]
    if (value !== undefined) {
      return value
    }
  }

  // 2. 回退到环境变量
  const envKey = `NEXT_PUBLIC_${key}`
  const envValue = process.env[envKey as keyof NodeJS.ProcessEnv]
  if (envValue !== undefined) {
    return envValue as AppConfig[K]
  }

  // 3. 使用默认值
  return defaultValue
}

// 导出配置
export const config = {
  get API_URL(): string {
    return getConfig("API_URL", "https://demo.langcore.cn") as string
  },

  get API_TOKEN(): string {
    return getConfig("API_TOKEN", "") as string
  },

  get WORKFLOW_ID(): string {
    return getConfig("WORKFLOW_ID", "") as string
  },

  get DEBUG(): boolean {
    return getConfig("DEBUG", false) as boolean
  },

  get TIMEOUT(): number {
    return getConfig("TIMEOUT", 60000) as number
  },
}

// 开发环境下打印配置（方便调试）
if (typeof window !== "undefined" && config.DEBUG) {
  console.log("🔧 App Config:", {
    API_URL: config.API_URL,
    API_TOKEN: config.API_TOKEN ? "***" + config.API_TOKEN.slice(-4) : "未设置",
    WORKFLOW_ID: config.WORKFLOW_ID ? "***" + config.WORKFLOW_ID.slice(-4) : "未设置",
    DEBUG: config.DEBUG,
    TIMEOUT: config.TIMEOUT,
  })
}


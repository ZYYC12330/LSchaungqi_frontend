"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { AnalysisResult } from "@/types/api"

interface AnalysisContextType {
  analysisResult: AnalysisResult | null
  setAnalysisResult: (result: AnalysisResult | null) => void
  clearAnalysisResult: () => void
  isSaved: boolean
  setIsSaved: (saved: boolean) => void
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined)

const STORAGE_KEY = "intelligent_selection_analysis_result"

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [analysisResult, setAnalysisResultState] = useState<AnalysisResult | null>(null)
  const [isSaved, setIsSavedState] = useState(true)

  // 从 sessionStorage 加载数据
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY)
        if (stored) {
          const data = JSON.parse(stored) as AnalysisResult
          // 检查数据是否过期（24小时）
          const isExpired = Date.now() - data.timestamp > 24 * 60 * 60 * 1000
          if (!isExpired) {
            setAnalysisResultState(data)
          } else {
            sessionStorage.removeItem(STORAGE_KEY)
          }
        }
      } catch (error) {
        console.error("Failed to load analysis result from storage:", error)
        sessionStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  // 保存到 sessionStorage
  const setAnalysisResult = (result: AnalysisResult | null) => {
    setAnalysisResultState(result)
    // 新的分析结果视为未保存
    if (result) {
      setIsSavedState(false)
    }
    if (typeof window !== "undefined") {
      if (result) {
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result))
        } catch (error) {
          console.error("Failed to save analysis result to storage:", error)
        }
      } else {
        sessionStorage.removeItem(STORAGE_KEY)
      }
    }
  }

  // 设置保存状态
  const setIsSaved = (saved: boolean) => {
    setIsSavedState(saved)
  }

  // 清除数据
  const clearAnalysisResult = () => {
    setAnalysisResultState(null)
    setIsSavedState(true)
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY)
    }
  }

  return (
    <AnalysisContext.Provider
      value={{
        analysisResult,
        setAnalysisResult,
        clearAnalysisResult,
        isSaved,
        setIsSaved,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  )
}

// 自定义 Hook
export function useAnalysis() {
  const context = useContext(AnalysisContext)
  if (context === undefined) {
    throw new Error("useAnalysis must be used within an AnalysisProvider")
  }
  return context
}


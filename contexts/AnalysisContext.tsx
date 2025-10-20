"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { AnalysisResult } from "@/types/api"

// 历史记录项
export interface HistoryItem {
  id: string
  timestamp: number
  fileName: string
  simulatorName?: string
  result: AnalysisResult
}

interface AnalysisContextType {
  analysisResult: AnalysisResult | null
  setAnalysisResult: (result: AnalysisResult | null) => void
  clearAnalysisResult: () => void
  isSaved: boolean
  setIsSaved: (saved: boolean) => void
  // 历史记录相关
  historyList: HistoryItem[]
  addToHistory: (fileName: string, result: AnalysisResult) => void
  loadFromHistory: (historyId: string) => void
  deleteFromHistory: (historyId: string) => void
  clearHistory: () => void
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined)

const STORAGE_KEY = "intelligent_selection_analysis_result"
const HISTORY_KEY = "intelligent_selection_history"
const MAX_HISTORY_ITEMS = 20

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [analysisResult, setAnalysisResultState] = useState<AnalysisResult | null>(null)
  const [isSaved, setIsSavedState] = useState(true)
  const [historyList, setHistoryList] = useState<HistoryItem[]>([])

  // 从 sessionStorage 加载当前数据
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

  // 从 localStorage 加载历史记录
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedHistory = localStorage.getItem(HISTORY_KEY)
        if (storedHistory) {
          const history = JSON.parse(storedHistory) as HistoryItem[]
          // 过滤掉过期的记录（30天）
          const validHistory = history.filter(
            (item) => Date.now() - item.timestamp < 30 * 24 * 60 * 60 * 1000,
          )
          setHistoryList(validHistory)
          // 如果有过期记录被删除，更新 localStorage
          if (validHistory.length !== history.length) {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(validHistory))
          }
        }
      } catch (error) {
        console.error("Failed to load history from storage:", error)
        localStorage.removeItem(HISTORY_KEY)
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

  // 添加到历史记录
  const addToHistory = (fileName: string, result: AnalysisResult) => {
    if (typeof window === "undefined") return

    const newHistoryItem: HistoryItem = {
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      fileName,
      simulatorName: result.simulatorName,
      result,
    }

    const updatedHistory = [newHistoryItem, ...historyList].slice(0, MAX_HISTORY_ITEMS)
    setHistoryList(updatedHistory)

    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory))
    } catch (error) {
      console.error("Failed to save history to storage:", error)
    }
  }

  // 从历史记录加载
  const loadFromHistory = (historyId: string) => {
    const historyItem = historyList.find((item) => item.id === historyId)
    if (historyItem) {
      setAnalysisResult(historyItem.result)
    }
  }

  // 删除历史记录
  const deleteFromHistory = (historyId: string) => {
    if (typeof window === "undefined") return

    const updatedHistory = historyList.filter((item) => item.id !== historyId)
    setHistoryList(updatedHistory)

    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory))
    } catch (error) {
      console.error("Failed to update history in storage:", error)
    }
  }

  // 清除所有历史记录
  const clearHistory = () => {
    if (typeof window === "undefined") return

    setHistoryList([])
    try {
      localStorage.removeItem(HISTORY_KEY)
    } catch (error) {
      console.error("Failed to clear history from storage:", error)
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
        historyList,
        addToHistory,
        loadFromHistory,
        deleteFromHistory,
        clearHistory,
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


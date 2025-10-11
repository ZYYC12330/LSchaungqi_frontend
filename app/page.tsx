"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Upload, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useAnalysis } from "@/contexts/AnalysisContext"
import { analyzeFile, APIError } from "@/lib/api"
import { toast } from "sonner"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>("")
  const router = useRouter()
  const { setAnalysisResult, clearAnalysisResult } = useAnalysis()

  // 清除旧的分析结果（当用户准备上传新文件时）
  useEffect(() => {
    // 清除sessionStorage中可能存在的旧数据，确保用户开始新的分析流程
    // 注意：我们不立即清除，而是在setAnalysisResult时自动处理
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleAnalyze = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress("正在上传文件...")

    try {
      // 调用 API 进行文件分析
      setUploadProgress("正在解析文档内容...")
      const result = await analyzeFile(file)

      setUploadProgress("正在提取技术需求...")

      // 保存分析结果到 context
      setAnalysisResult({
        simulator: result.simulator,
        cards: result.cards,
        timestamp: Date.now(),
      })

      setUploadProgress("分析完成！")
      toast.success("分析完成", {
        description: "已为您生成最优选型方案",
      })

      // 跳转到结果页面
      setTimeout(() => {
        router.push("/results")
      }, 500)
    } catch (error) {
      console.error("Analysis failed:", error)

      let errorMessage = "分析失败，请重试"
      if (error instanceof APIError) {
        errorMessage = error.message
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      toast.error("分析失败", {
        description: errorMessage,
      })

      setIsUploading(false)
      setUploadProgress("")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">智能选型系统</h1>
          <p className="text-lg text-muted-foreground">上传需求文档，自动匹配最优仿真机和板卡方案</p>
        </div>

        <Card className="p-8 border-2">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">步骤 1: 上传需求文件</h2>
              <p className="text-muted-foreground">请上传包含项目需求的 Word 文档（.doc, .docx）</p>
            </div>

            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium text-foreground mb-2">拖放文件到此处</p>
                <p className="text-sm text-muted-foreground mb-4">或</p>
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer bg-transparent" asChild>
                    <span>选择文件</span>
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".doc,.docx"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {file && (
                <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                  <FileText className="w-8 h-8 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleAnalyze}
                disabled={!file || isUploading}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6"
                size="lg"
              >
                {isUploading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⚙️</span>
                    分析中...
                  </span>
                ) : (
                  "开始智能分析"
                )}
              </Button>
            </div>

            {isUploading && (
              <div className="mt-8 p-6 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <p className="text-sm font-medium text-primary">{uploadProgress || "正在分析需求文档..."}</p>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="animate-fade-in">⚙️ 正在处理，请稍候...</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

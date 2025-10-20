"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { Download, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react"
import { useAnalysis } from "@/contexts/AnalysisContext"
import { useEffect, useState } from "react"

export default function SummaryPage() {
  const router = useRouter()
  const { analysisResult, isSaved, setIsSaved } = useAnalysis()
  const [showExitDialog, setShowExitDialog] = useState(false)

  // 如果没有分析结果，重定向到首页
  useEffect(() => {
    if (!analysisResult) {
      router.push("/")
    }
  }, [analysisResult, router])

  // 处理返回首页
  const handleBackToHome = () => {
    if (!isSaved) {
      setShowExitDialog(true)
    } else {
      router.push("/")
    }
  }

  // 确认退出
  const confirmExit = () => {
    setShowExitDialog(false)
    router.push("/")
  }

  // 处理导出（标记为已保存）
  const handleExport = () => {
    setIsSaved(true)
    // TODO: 实际的导出逻辑
    alert("导出功能开发中...")
  }

  if (!analysisResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  // 提取仿真机详情
  const simulatorDetails = analysisResult.simulator.result_id.details || []
  const simulatorId = analysisResult.simulator.result_id.id
  const cpuDetail = simulatorDetails.find((d) => d.category === "CPU")
  const memoryDetail = simulatorDetails.find((d) => d.category === "Memory")
  const diskDetail = simulatorDetails.find((d) => d.category === "Hard Disk")
  const slotsDetail = simulatorDetails.find((d) => d.category === "Slots")

  // 从 raw_sim 获取仿真机名称和价格
  const rawSimulator = analysisResult.rawSimulator?.[0]
  const simulatorName = rawSimulator?.model || analysisResult.simulatorName || "未知型号"
  const simulatorCost = rawSimulator?.price_cny || 0

  // 提取板卡优化方案
  const cardData = analysisResult.cards.Body
  const optimizedCards = cardData.optimized_solution || []
  const totalCardCost = cardData.total_cost || 0
  const allCards = analysisResult.cards.all_cards || []

  // 为每个优化方案的板卡找到详细描述
  const cardsWithDetails = optimizedCards.map((card) => {
    let fullDescription = ""
    for (const channelGroup of allCards) {
      const matchedCard = channelGroup.matched_board.find((b) => b.id === card.id)
      if (matchedCard) {
        fullDescription = matchedCard.description
        break
      }
    }
    return {
      ...card,
      description: fullDescription,
    }
  })

  // 计算项目总成本
  const totalCost = simulatorCost + totalCardCost

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push("/results")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回结果页
          </Button>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <h1 className="text-4xl font-bold text-foreground">采购方案总结</h1>
          </div>
          <p className="text-lg text-muted-foreground">以下是根据您的需求生成的最优采购方案</p>
        </div>

        <div className="space-y-6">
          {/* Simulator Plan */}
          <Card className="p-8 border-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">仿真机最优采购方案</h2>
              <Badge className="bg-primary text-primary-foreground px-4 py-1 text-base">推荐方案</Badge>
            </div>

            <div className="space-y-6">
              <div className="bg-secondary/50 p-6 rounded-lg">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-primary font-mono">{simulatorName}</h3>
                  <p className="text-xs text-muted-foreground mt-1">ID: {simulatorId}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {cpuDetail && (
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">CPU</p>
                        <p className="text-foreground">{cpuDetail.cpu}</p>
                        <p className="text-sm text-muted-foreground mt-1">{cpuDetail.reason}</p>
                      </div>
                    )}
                    {diskDetail && (
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">硬盘</p>
                        <p className="text-foreground">{diskDetail.hard_disk}</p>
                        {diskDetail.reason && (
                          <p className="text-sm text-muted-foreground mt-1">{diskDetail.reason}</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {memoryDetail && (
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">内存</p>
                        <p className="text-foreground">{memoryDetail.memory}</p>
                        {memoryDetail.reason && (
                          <p className="text-sm text-muted-foreground mt-1">{memoryDetail.reason}</p>
                        )}
                      </div>
                    )}
                    {slotsDetail && (
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">IO扩展插槽</p>
                        <p className="text-foreground">{slotsDetail.slots}</p>
                        {slotsDetail.reason && (
                          <p className="text-sm text-muted-foreground mt-1">{slotsDetail.reason}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg">
                <span className="text-lg font-semibold text-foreground">总成本</span>
                <span className="text-3xl font-bold text-accent">¥{simulatorCost.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          {/* Board Plan */}
          <Card className="p-8 border-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">板卡最优采购方案</h2>
              <Badge className="bg-primary text-primary-foreground px-4 py-1 text-base">推荐方案</Badge>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                {cardsWithDetails.map((card, index) => (
                  <div
                    key={index}
                    className="p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-mono font-semibold text-primary">{card.model}</p>
                        <p className="text-xs text-muted-foreground mt-1">ID: {card.id}</p>
                        {card.description && (
                          <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">{card.description}</p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-foreground whitespace-nowrap">
                          <span className="font-semibold">{card.quantity}</span> 块 ×{" "}
                          <span className="font-semibold">¥{card.unit_price}</span>
                        </p>
                        <p className="text-lg font-bold text-accent mt-1">¥{card.total_price.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg">
                <span className="text-lg font-semibold text-foreground">总成本</span>
                <span className="text-3xl font-bold text-accent">¥{totalCardCost.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          {/* Total Summary */}
          <Card className="p-8 border-2 border-primary/50 bg-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">项目总成本</h3>
                <p className="text-muted-foreground">仿真机 + 板卡组合方案</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">
                  ¥{simulatorCost.toLocaleString()} + ¥{totalCardCost.toLocaleString()}
                </p>
                <p className="text-4xl font-bold text-primary">¥{totalCost.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button onClick={handleBackToHome} variant="outline" size="lg" className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
            <Button onClick={handleExport} size="lg" className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
              <Download className="w-4 h-4 mr-2" />
              导出采购方案
            </Button>
          </div>
        </div>

        {/* 退出确认对话框 */}
        <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>报价还未保存</AlertDialogTitle>
              <AlertDialogDescription>
                您的采购方案还未导出保存，退出后可能会丢失当前数据。是否确定要直接退出？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={confirmExit} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                确定退出
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

function Badge({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${className}`}>{children}</span>
  )
}

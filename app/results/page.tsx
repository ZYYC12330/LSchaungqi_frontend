"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ProductTooltip } from "@/components/product-tooltip"
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
import { ArrowRight, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react"
import { useAnalysis } from "@/contexts/AnalysisContext"
import { formatMatchRate, getMatchColor, getChannelTypeName } from "@/types/api"
import { useEffect, useState } from "react"

export default function ResultsPage() {
  const router = useRouter()
  const { analysisResult, isSaved } = useAnalysis()
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

  // 提取仿真机结果
  const simulatorDetails = analysisResult.simulator.result_id.details || []
  const simulatorResults = simulatorDetails.map((detail) => ({
    requirement: detail.original,
    matchRate: formatMatchRate(detail.score),
    product: detail.cpu || detail.memory || detail.hard_disk || detail.slots || "N/A",
    description: detail.cpu || detail.memory || detail.hard_disk || detail.slots || "",
    price: "包含",
    suggestion: detail.reason,
  }))

  // 提取板卡结果
  const cardData = analysisResult.cards.Body
  const allCards = analysisResult.cards.all_cards || []

  // 为每个优化方案的板卡找到对应的描述信息
  const boardResults = cardData.optimized_solution.map((card) => {
    // 查找该板卡在all_cards中的详细信息
    let description = ""
    let originalRequirement = ""

    for (const channelGroup of allCards) {
      const matchedCard = channelGroup.matched_board.find((b) => b.id === card.id)
      if (matchedCard) {
        description = matchedCard.description
        originalRequirement = matchedCard.original
        break
      }
    }

    return {
      requirement: originalRequirement || card.model,
      matchRate: "100%", // 优化方案默认100%匹配
      product: card.model,
      description: description,
      price: `¥${card.unit_price}/块`,
      suggestion: `建议采购${card.quantity}块`,
    }
  })

  const handleRequirementClick = (requirement: string, channelType?: string) => {
    // 对于板卡，使用channel_type而不是requirement文本
    const queryParam = channelType || requirement
    router.push(`/products?requirement=${encodeURIComponent(queryParam)}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <Button variant="ghost" onClick={handleBackToHome} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首页
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <h1 className="text-3xl font-bold text-foreground">分析完成</h1>
          </div>
          <p className="text-muted-foreground">根据您的需求文档，我们为您匹配了以下最优方案</p>
        </div>

        <div className="space-y-8">
          {/* Simulator Selection */}
          <Card className="p-6 border-2">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                1
              </span>
              仿真机选型
            </h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold">客户原始需求</TableHead>
                    <TableHead className="font-bold">匹配度</TableHead>
                    <TableHead className="font-bold">选型产品</TableHead>
                    <TableHead className="font-bold">单价</TableHead>
                    <TableHead className="font-bold">建议</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {simulatorResults.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.requirement}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getMatchColor(parseFloat(row.matchRate) / 100)}>
                          {row.matchRate}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ProductTooltip productName={row.product} description={row.description}>
                          <span className="font-mono text-primary cursor-help">{row.product}</span>
                        </ProductTooltip>
                      </TableCell>
                      <TableCell className="font-semibold">{row.price}</TableCell>
                      <TableCell className="text-muted-foreground">{row.suggestion}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Board Selection */}
          <Card className="p-6 border-2">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                2
              </span>
              板卡选型
            </h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold">客户原始需求</TableHead>
                    <TableHead className="font-bold">匹配度</TableHead>
                    <TableHead className="font-bold">选型产品</TableHead>
                    <TableHead className="font-bold">单价</TableHead>
                    <TableHead className="font-bold">建议</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {boardResults.map((row, index) => {
                    // 从requirement中找到对应的channel_type
                    const channelGroup = allCards.find((group) =>
                      group.matched_board.some((b) => b.original === row.requirement),
                    )
                    const channelType = channelGroup?.Channels_type

                    return (
                      <TableRow key={index}>
                        <TableCell
                          className="font-medium cursor-pointer hover:text-primary hover:underline transition-colors"
                          onClick={() => handleRequirementClick(row.requirement, channelType)}
                        >
                          {row.requirement}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getMatchColor(parseFloat(row.matchRate) / 100)}>
                            {row.matchRate}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <ProductTooltip productName={row.product} description={row.description}>
                            <span className="font-mono text-primary cursor-help">{row.product}</span>
                          </ProductTooltip>
                        </TableCell>
                        <TableCell className="font-semibold">{row.price}</TableCell>
                        <TableCell className="text-muted-foreground">{row.suggestion}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={() => router.push("/summary")}
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              查看采购方案总结
              <ArrowRight className="ml-2 w-5 h-5" />
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

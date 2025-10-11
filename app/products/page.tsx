"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Package, AlertCircle } from "lucide-react"
import { Suspense, useEffect } from "react"
import { useAnalysis } from "@/contexts/AnalysisContext"
import { formatMatchRate } from "@/types/api"

function ProductsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const channelType = searchParams.get("requirement") || ""
  const { analysisResult } = useAnalysis()

  // 如果没有分析结果，重定向到首页
  useEffect(() => {
    if (!analysisResult) {
      router.push("/")
    }
  }, [analysisResult, router])

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

  // 从all_cards中查找匹配的板卡
  const allCards = analysisResult.cards.all_cards || []
  const channelGroup = allCards.find((group) => group.Channels_type === channelType)

  if (!channelGroup || !channelGroup.matched_board || channelGroup.matched_board.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 w-4 h-4" />
            返回结果页面
          </Button>
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">未找到匹配的产品</p>
          </div>
        </div>
      </div>
    )
  }

  const matchedBoards = channelGroup.matched_board
  const originalRequirement = matchedBoards[0]?.original || ""

  // 找出推荐的板卡（在优化方案中的）
  const optimizedSolution = analysisResult.cards.Body.optimized_solution
  const recommendedIds = new Set(optimizedSolution.map((card) => card.id))

  const products = matchedBoards.map((board) => ({
    name: `板卡 ID: ${board.id.substring(0, 8)}...`,
    matchRate: formatMatchRate(board.match_degree),
    price: `¥${board.price_cny}`,
    specs: board.reason,
    description: board.description,
    isRecommended: recommendedIds.has(board.id),
    id: board.id,
  }))

  const getMatchColor = (rate: string) => {
    const value = Number.parseInt(rate)
    if (value >= 95) return "bg-green-500/10 text-green-700 border-green-500/20"
    if (value >= 85) return "bg-blue-500/10 text-blue-700 border-blue-500/20"
    return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 w-4 h-4" />
          返回结果页面
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">所有匹配产品</h1>
          </div>
          <p className="text-muted-foreground">
            需求：<span className="font-semibold text-foreground">{originalRequirement}</span>
          </p>
          <p className="text-sm text-muted-foreground mt-1">共找到 {products.length} 个匹配产品</p>
        </div>

        <Card className="p-6 border-2">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold">产品ID</TableHead>
                  <TableHead className="font-bold">匹配度</TableHead>
                  <TableHead className="font-bold">价格</TableHead>
                  <TableHead className="font-bold">匹配原因</TableHead>
                  <TableHead className="font-bold">产品描述</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className={product.isRecommended ? "bg-green-50/50" : ""}>
                    <TableCell className="font-mono text-primary font-semibold text-xs">
                      {product.id}
                      {product.isRecommended && (
                        <Badge className="ml-2 bg-green-600 text-white text-xs">已选</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getMatchColor(product.matchRate)}>
                        {product.matchRate}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{product.price}</TableCell>
                    <TableCell className="text-sm">{product.specs}</TableCell>
                    <TableCell className="text-muted-foreground text-sm whitespace-pre-line max-w-md">
                      {product.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
      <ProductsContent />
    </Suspense>
  )
}

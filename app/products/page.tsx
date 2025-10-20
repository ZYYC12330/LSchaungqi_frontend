"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Package, AlertCircle } from "lucide-react"
import { Suspense, useEffect } from "react"
import { useAnalysis } from "@/contexts/AnalysisContext"
import { formatMatchRate, getSimulatorRequirementTypeName } from "@/types/api"
import type { RawSimulator } from "@/types/api"

function ProductsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get("type") || "card"
  const requirement = searchParams.get("requirement") || ""
  const channelType = requirement // 保持向后兼容
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

  // 处理仿真机候选列表
  if (type === "simulator") {
    const simPickList = analysisResult.simPickList || []
    const rawSimulators = analysisResult.rawSimulator || []
    const selectedSimulatorId = analysisResult.simulator.result_id.id

    // 根据需求类型查找对应的候选列表
    const candidateGroup = simPickList.find((group) => {
      if (!group.kkrr || group.kkrr.length === 0) return false
      const firstCandidate = group.kkrr[0]
      // 检查第一个候选项是否包含该需求类型的字段
      return firstCandidate.hasOwnProperty(requirement)
    })

    if (!candidateGroup || !candidateGroup.kkrr || candidateGroup.kkrr.length === 0) {
      return (
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-12 max-w-7xl">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6">
              <ArrowLeft className="mr-2 w-4 h-4" />
              返回结果页面
            </Button>
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">未找到匹配的仿真机候选</p>
            </div>
          </div>
        </div>
      )
    }

    const originalRequirement = candidateGroup.kkrr[0]?.original || ""
    const requirementTypeName = getSimulatorRequirementTypeName(requirement)

    // 创建仿真机产品列表，包含完整信息
    const simulatorProducts = candidateGroup.kkrr.map((candidate) => {
      // 优先使用候选项自带的 model 和 price_cny，否则从 rawSimulators 中查找
      const rawSim = rawSimulators.find((sim) => sim.id === candidate.id)
      
      // 获取型号：优先使用 candidate.model，其次使用 rawSim.model
      const model = candidate.model || rawSim?.model || `仿真机 ${candidate.id.substring(0, 8)}...`
      
      // 获取价格：优先使用 candidate.price_cny，其次使用 rawSim.price_cny
      let price = "N/A"
      if (candidate.price_cny) {
        const priceNum = typeof candidate.price_cny === 'string' 
          ? parseFloat(candidate.price_cny) 
          : candidate.price_cny
        price = `¥${priceNum.toLocaleString()}`
      } else if (rawSim?.price_cny) {
        price = `¥${rawSim.price_cny.toLocaleString()}`
      }
      
      // 处理 score，可能是数字或布尔值
      let matchRate = "0%"
      if (typeof candidate.score === 'boolean') {
        matchRate = candidate.score ? "100%" : "0%"
      } else {
        matchRate = formatMatchRate(candidate.score)
      }
      
      return {
        id: candidate.id,
        model: model,
        matchRate: matchRate,
        price: price,
        config: (candidate as any)[requirement] || "N/A",
        reason: candidate.reason,
        isSelected: candidate.id === selectedSimulatorId,
        manufacturer: rawSim?.manufacturer || "N/A",
        series: rawSim?.series || "N/A",
      }
    })

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
              <h1 className="text-3xl font-bold text-foreground">所有候选仿真机</h1>
            </div>
            <p className="text-muted-foreground">
              需求类型：<span className="font-semibold text-foreground">{requirementTypeName}</span>
            </p>
            <p className="text-muted-foreground">
              原始需求：<span className="font-semibold text-foreground">{originalRequirement}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">共找到 {simulatorProducts.length} 个候选仿真机</p>
          </div>

          <Card className="p-6 border-2">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold">仿真机型号</TableHead>
                    <TableHead className="font-bold">匹配度</TableHead>
                    <TableHead className="font-bold">整机价格</TableHead>
                    <TableHead className="font-bold">{requirementTypeName}</TableHead>
                    <TableHead className="font-bold">匹配原因</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {simulatorProducts.map((product) => (
                    <TableRow key={product.id} className={product.isSelected ? "bg-green-50/50" : ""}>
                      <TableCell className="font-mono text-primary font-semibold">
                        {product.model}
                        {product.isSelected && (
                          <Badge className="ml-2 bg-green-600 text-white text-xs">已选</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getMatchColor(product.matchRate)}>
                          {product.matchRate}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{product.price}</TableCell>
                      <TableCell className="text-sm">{product.config}</TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-md">
                        {product.reason}
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
    name: board.model || `板卡 ID: ${board.id.substring(0, 8)}...`,
    matchRate: formatMatchRate(board.match_degree),
    price: `¥${board.price_cny}`,
    specs: board.reason,
    description: board.description,
    isRecommended: recommendedIds.has(board.id),
    id: board.id,
    model: board.model,
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
                  <TableHead className="font-bold">产品型号</TableHead>
                  <TableHead className="font-bold">匹配度</TableHead>
                  <TableHead className="font-bold">价格</TableHead>
                  <TableHead className="font-bold">匹配原因</TableHead>
                  <TableHead className="font-bold">产品描述</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className={product.isRecommended ? "bg-green-50/50" : ""}>
                    <TableCell className="font-mono text-primary font-semibold">
                      {product.model || product.name}
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

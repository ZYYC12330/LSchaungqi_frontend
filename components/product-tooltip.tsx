"use client"

import type React from "react"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ProductTooltipProps {
  productName: string
  description?: string
  children: React.ReactNode
}

export function ProductTooltip({ productName, description, children }: ProductTooltipProps) {
  // 如果没有提供描述信息，不显示tooltip
  if (!description) {
    return <>{children}</>
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="right" className="max-w-md p-4">
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-foreground">{productName}</h4>
            <div className="text-xs text-foreground whitespace-pre-line leading-relaxed">{description}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

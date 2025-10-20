"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAnalysis } from "@/contexts/AnalysisContext"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
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
import { ChevronLeft, ChevronRight, History, Trash2, FileText, Clock } from "lucide-react"
import { toast } from "sonner"

export function HistorySidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false)
  const router = useRouter()
  const { historyList, loadFromHistory, deleteFromHistory, clearHistory } = useAnalysis()

  const handleLoadHistory = (historyId: string) => {
    loadFromHistory(historyId)
    toast.success("已加载历史记录")
    router.push("/results")
  }

  const handleDeleteClick = (historyId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setItemToDelete(historyId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteFromHistory(itemToDelete)
      toast.success("已删除历史记录")
      setItemToDelete(null)
    }
    setDeleteDialogOpen(false)
  }

  const handleClearAll = () => {
    clearHistory()
    toast.success("已清空所有历史记录")
    setClearAllDialogOpen(false)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "刚刚"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}小时前`
    } else if (diffInHours < 48) {
      return "昨天"
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}天前`
    } else {
      return date.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    }
  }

  return (
    <>
      {/* 侧边栏 */}
      <div
        className={`fixed left-0 top-0 h-full bg-background border-r border-border transition-all duration-300 z-50 ${
          isOpen ? "w-80" : "w-0"
        }`}
      >
        {/* 侧边栏内容 */}
        <div className={`h-full flex flex-col ${isOpen ? "opacity-100" : "opacity-0"}`}>
          {/* 头部 */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">查询历史</h2>
              </div>
              <Badge variant="secondary" className="text-xs">
                {historyList.length}/{20}
              </Badge>
            </div>
            {historyList.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setClearAllDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                清空历史
              </Button>
            )}
          </div>

          {/* 历史记录列表 */}
          <ScrollArea className="flex-1">
            {historyList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <History className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">暂无查询历史</p>
                <p className="text-muted-foreground/70 text-xs mt-1">
                  上传文档后会自动记录
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {historyList.map((item) => (
                  <div
                    key={item.id}
                    className="group p-3 rounded-lg border border-border hover:border-primary hover:bg-accent/50 cursor-pointer transition-all"
                    onClick={() => handleLoadHistory(item.id)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.fileName}
                          </p>
                          {item.simulatorName && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {item.simulatorName}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={(e) => handleDeleteClick(item.id, e)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(item.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* 切换按钮 */}
      <Button
        variant="outline"
        size="sm"
        className={`fixed top-4 z-50 transition-all duration-300 shadow-lg ${
          isOpen ? "left-80" : "left-0"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <>
            <ChevronLeft className="w-4 h-4 mr-1" />
            收起
          </>
        ) : (
          <>
            <ChevronRight className="w-4 h-4 mr-1" />
            历史
          </>
        )}
      </Button>

      {/* 删除单个记录确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这条历史记录吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 清空所有记录确认对话框 */}
      <AlertDialog open={clearAllDialogOpen} onOpenChange={setClearAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认清空</AlertDialogTitle>
            <AlertDialogDescription>
              确定要清空所有历史记录吗？此操作无法撤销，将删除 {historyList.length} 条记录。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              清空全部
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}


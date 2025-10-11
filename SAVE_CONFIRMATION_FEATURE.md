# 报价保存确认功能

## 功能概述

在用户返回首页之前，系统会检查报价是否已保存。如果报价未保存，将弹出确认对话框提醒用户："报价还未保存，是否直接退出？"

## 功能特性

### 1. 自动保存状态追踪
- 新的分析结果生成时，自动标记为"未保存"
- 用户导出报价后，自动标记为"已保存"
- 用户确认退出或清除数据时，重置保存状态

### 2. 智能提示
- **Results 页面**: 点击"返回首页"按钮时检查保存状态
- **Summary 页面**: 点击"返回首页"按钮时检查保存状态
- **已保存**: 直接返回首页，无提示
- **未保存**: 显示确认对话框

### 3. 用户操作选项
- **取消**: 返回当前页面，继续操作
- **确定退出**: 直接返回首页（数据不会丢失，保存在sessionStorage中）

## 实现细节

### 1. Context 状态管理 (`contexts/AnalysisContext.tsx`)

新增状态：
```typescript
interface AnalysisContextType {
  // ... 原有字段
  isSaved: boolean          // 是否已保存
  setIsSaved: (saved: boolean) => void  // 设置保存状态
}
```

状态逻辑：
- `setAnalysisResult()`: 新分析结果时设置 `isSaved = false`
- `clearAnalysisResult()`: 清除数据时重置 `isSaved = true`
- `setIsSaved(true)`: 导出报价时手动设置为已保存

### 2. Results 页面 (`app/results/page.tsx`)

新增功能：
- "返回首页"按钮（左上角）
- 退出确认对话框
- 保存状态检查逻辑

```typescript
const handleBackToHome = () => {
  if (!isSaved) {
    setShowExitDialog(true)  // 显示确认对话框
  } else {
    router.push("/")         // 直接返回
  }
}
```

### 3. Summary 页面 (`app/summary/page.tsx`)

新增功能：
- "返回首页"按钮处理逻辑
- 退出确认对话框
- "导出采购方案"按钮点击时设置保存状态

```typescript
const handleExport = () => {
  setIsSaved(true)  // 标记为已保存
  // 实际导出逻辑...
}
```

### 4. 上传页面 (`app/page.tsx`)

无需修改：
- Context 自动处理新分析结果的保存状态

## 对话框UI

### 设计
- 标题: "报价还未保存"
- 描述: "您的采购方案还未导出保存，退出后可能会丢失当前数据。是否确定要直接退出？"
- 按钮:
  - "取消" (次要按钮)
  - "确定退出" (危险按钮，红色)

### 组件
使用 shadcn/ui 的 `AlertDialog` 组件：
```tsx
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
      <AlertDialogAction onClick={confirmExit}>
        确定退出
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## 用户流程

### 流程 1: 未保存时返回
```
用户点击"返回首页"
    ↓
检查 isSaved 状态
    ↓
isSaved = false
    ↓
显示确认对话框
    ↓
用户选择:
  - 点击"取消" → 返回当前页面
  - 点击"确定退出" → 返回首页
```

### 流程 2: 已保存后返回
```
用户点击"导出采购方案"
    ↓
setIsSaved(true)
    ↓
用户点击"返回首页"
    ↓
检查 isSaved 状态
    ↓
isSaved = true
    ↓
直接返回首页（无对话框）
```

### 流程 3: 新分析
```
用户上传新文件分析
    ↓
setAnalysisResult(newResult)
    ↓
自动设置 isSaved = false
    ↓
用户进入 results/summary 页面
    ↓
点击"返回首页"会显示确认对话框
```

## 数据安全

### 数据不会丢失
- **sessionStorage 保存**: 分析结果保存在浏览器 sessionStorage 中
- **24小时有效**: 数据在浏览器会话期间持续有效
- **返回首页**: 即使用户确认退出，数据仍保留在 sessionStorage
- **重新访问**: 用户可以通过浏览器前进/后退按钮访问之前的结果

### 提示目的
确认对话框的目的是：
1. **提醒用户**: 报价方案还未正式导出保存到本地
2. **防止误操作**: 避免用户意外离开页面
3. **引导用户**: 鼓励用户完成导出操作

## 导出功能（待实现）

当前导出功能为占位符，未来可实现：
- PDF 导出
- Excel 导出
- JSON 数据导出
- 打印功能

导出实现后，需要在 `handleExport` 中添加实际逻辑。

## 测试建议

### 测试场景 1: 未保存退出
1. 上传文件并分析
2. 查看 results 页面
3. 点击"返回首页"
4. 验证显示确认对话框
5. 点击"取消"，验证留在当前页
6. 再次点击"返回首页"
7. 点击"确定退出"，验证返回首页

### 测试场景 2: 保存后退出
1. 上传文件并分析
2. 进入 summary 页面
3. 点击"导出采购方案"
4. 点击"返回首页"
5. 验证直接返回首页（无对话框）

### 测试场景 3: 多次分析
1. 完成第一次分析并导出（已保存）
2. 返回首页上传新文件
3. 完成第二次分析（未保存）
4. 点击"返回首页"
5. 验证显示确认对话框

## 注意事项

1. **sessionStorage 限制**: 
   - 数据在浏览器关闭后会丢失
   - 不同标签页不共享数据
   - 建议提醒用户及时导出

2. **浏览器兼容性**:
   - 所有现代浏览器都支持 sessionStorage
   - AlertDialog 组件响应式设计，移动端友好

3. **用户体验**:
   - 对话框文案清晰明确
   - 按钮颜色符合 UX 规范（危险操作用红色）
   - 可以按 ESC 键关闭对话框

## 相关文件

- `contexts/AnalysisContext.tsx` - 状态管理
- `app/results/page.tsx` - Results 页面
- `app/summary/page.tsx` - Summary 页面
- `app/page.tsx` - 上传页面
- `components/ui/alert-dialog.tsx` - 对话框组件

## 完成状态

✅ Context 状态管理
✅ Results 页面确认对话框
✅ Summary 页面确认对话框
✅ 导出按钮保存状态设置
✅ 自动状态追踪
✅ 无 Linter 错误
✅ 用户体验优化


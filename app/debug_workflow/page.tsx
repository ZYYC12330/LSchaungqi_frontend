"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { config } from '@/lib/config';

const DebugWorkflowPage: React.FC = () => {
  // 状态管理
  const [workflowId, setWorkflowId] = useState<string>(config.WORKFLOW_ID || '');
  const [requestBody, setRequestBody] = useState<string>(JSON.stringify({
    "input": {
      "file_url": ""
    },
    "runMode": "sync"
  }, null, 2));
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);


  // 发送请求到工作流API
  const sendWorkflowRequest = async () => {
    if (!workflowId.trim()) {
      toast.warning('请输入工作流ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResponse(null);

      // 解析请求体
      let bodyData;
      try {
        bodyData = JSON.parse(requestBody);
      } catch (parseError) {
        throw new Error('请求体不是有效的JSON格式');
      }

      // 使用config.js中的API配置
      const apiUrl = config.API_URL || '';
      const apiToken = config.API_TOKEN || '';
      
      // 发送POST请求到工作流API
      const response = await fetch(`${apiUrl}/api/workflow/run/${workflowId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      const responseData = await response.json();

      if (response.ok) {
        setResponse(responseData);
        toast.success('请求发送成功');
      } else {
        setError('API返回错误: ' + response.status + ' - ' + response.statusText);
        toast.error('请求失败: ' + response.status);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);
      toast.error(`请求失败: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">工作流调试工具</h1>
          <p className="text-lg text-muted-foreground">调试和测试工作流API请求</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>调试配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 工作流ID输入 */}
            <div className="space-y-2">
              <Label htmlFor="workflow-id">工作流ID</Label>
              <Input
                id="workflow-id"
                value={workflowId}
                onChange={(e) => setWorkflowId(e.target.value)}
                placeholder="请输入工作流ID"
              />
            </div>

            {/* 请求体输入 */}
            <div className="space-y-2">
              <Label htmlFor="request-body">请求体 (JSON格式)</Label>
              <Textarea
                id="request-body"
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                placeholder="请输入请求体内容"
                className="min-h-[200px] font-mono"
              />
            </div>

            {/* 按钮组 */}
            <div className="flex justify-center">
              <Button
                onClick={sendWorkflowRequest}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⚙️</span>
                    发送中...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    发送请求
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 响应结果显示 */}
        {(loading || response || error) && (
          <Card>
            <CardHeader>
              <CardTitle>响应结果</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">正在发送请求...</p>
                </div>
              ) : error ? (
                <div className="space-y-2">
                  <Label className="text-destructive font-semibold">错误:</Label>
                  <Textarea
                    value={error}
                    className="min-h-[120px] font-mono text-destructive"
                    readOnly
                  />
                </div>
              ) : response ? (
                <div className="space-y-2">
                  <Label className="font-semibold">响应数据:</Label>
                  <Textarea
                    value={JSON.stringify(response, null, 2)}
                    className="min-h-[300px] font-mono"
                    readOnly
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DebugWorkflowPage;
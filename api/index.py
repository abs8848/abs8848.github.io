"""
Star Office UI - Vercel Backend API
"""

import json
import os
from datetime import datetime, timedelta
from urllib.parse import parse_qs

# 状态存储（Vercel Serverless 需要用环境变量或外部存储）
# 这里用简单的内存存储，重启后会重置
STATE = {
    "state": "idle",
    "description": "待命中",
    "timestamp": datetime.now().isoformat()
}

def get_query_params(event):
    """解析查询参数"""
    if event.get("queryStringParameters"):
        return event["queryStringParameters"]
    return {}

def handler(event, context):
    """Vercel Serverless Handler"""
    path = event.get("path", "/")
    method = event.get("method", "GET")
    headers = event.get("headers", {})
    
    # CORS 头
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }
    
    # 处理 OPTIONS 预检请求
    if method == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}
    
    # 路由处理
    if path == "/health" or path.endswith("/health"):
        return {
            "statusCode": 200,
            "headers": {**cors_headers, "Content-Type": "application/json"},
            "body": json.dumps({"status": "ok", "timestamp": datetime.now().isoformat()})
        }
    
    if path == "/status" or path.endswith("/status"):
        return {
            "statusCode": 200,
            "headers": {**cors_headers, "Content-Type": "application/json"},
            "body": json.dumps(STATE, ensure_ascii=False)
        }
    
    if path == "/set_state" or path.endswith("/set_state"):
        try:
            body = event.get("body", "{}")
            if isinstance(body, str):
                data = json.loads(body)
            else:
                data = body or {}
            
            STATE["state"] = data.get("state", "idle")
            STATE["description"] = data.get("description", "")
            STATE["timestamp"] = datetime.now().isoformat()
            
            return {
                "statusCode": 200,
                "headers": {**cors_headers, "Content-Type": "application/json"},
                "body": json.dumps({"success": True, "state": STATE}, ensure_ascii=False)
            }
        except Exception as e:
            return {
                "statusCode": 500,
                "headers": {**cors_headers, "Content-Type": "application/json"},
                "body": json.dumps({"error": str(e)})
            }
    
    if path == "/yesterday-memo" or path.endswith("/yesterday-memo"):
        # Vercel 无法访问本地文件，返回默认内容
        return {
            "statusCode": 200,
            "headers": {**cors_headers, "Content-Type": "application/json"},
            "body": json.dumps({
                "date": (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d'),
                "content": "暂无昨日记录（Vercel 部署模式）"
            }, ensure_ascii=False)
        }
    
    # 未知路由返回 404
    return {
        "statusCode": 404,
        "headers": {**cors_headers, "Content-Type": "application/json"},
        "body": json.dumps({"error": "Not found"})
    }

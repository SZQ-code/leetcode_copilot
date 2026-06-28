# API 说明

## 当前接口

### `GET /health`

用于确认 FastAPI 服务可用。

响应示例：

```json
{
  "status": "ok",
  "service": "leetcode-copilot-api"
}
```

状态码：

- `200 OK`：服务正常。

## 计划中的 MVP 接口

以下接口只用于说明后续方向，本阶段未实现：

- `POST /api/problems/solve`：提交题目并生成解析。
- `GET /api/problems`：获取历史记录。
- `GET /api/problems/{problem_id}`：获取题目详情。
- `PATCH /api/problems/{problem_id}`：更新掌握状态和个人备注。
- `GET /api/categories`：获取按算法标签归纳的数据。

实际请求和响应结构将在实现相应功能时确定并写入本文档。


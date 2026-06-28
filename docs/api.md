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

### `POST /api/problems/solve`

提交题目文本并获取固定的“两数之和”Mock 解析。

请求示例：

```json
{
  "content": "给定一个整数数组 nums 和一个目标值 target，请找出和为目标值的两个整数。"
}
```

`content` 去除首尾空白后至少需要 10 个字符。

成功响应包含：

- `title`
- `difficulty`
- `tags`
- `problem_summary`
- `solution_approach`
- `algorithm_reason`
- `python_code`
- `code_explanation`
- `time_complexity`
- `space_complexity`
- `common_mistakes`
- `edge_cases`
- `teaching_analysis`

状态码：

- `200 OK`：返回完整 Mock 解析。
- `422 Unprocessable Entity`：请求体缺失或题目文本过短。

## 计划中的 MVP 接口

以下接口只用于说明后续方向，本阶段未实现：

- `GET /api/problems`：获取历史记录。
- `GET /api/problems/{problem_id}`：获取题目详情。
- `PATCH /api/problems/{problem_id}`：更新掌握状态和个人备注。
- `GET /api/categories`：获取按算法标签归纳的数据。

实际请求和响应结构将在实现相应功能时确定并写入本文档。

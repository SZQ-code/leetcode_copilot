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

提交题目文本，获取固定的“两数之和”Mock 解析并保存为学习记录。

请求示例：

```json
{
  "content": "给定一个整数数组 nums 和一个目标值 target，请找出和为目标值的两个整数。"
}
```

`content` 去除首尾空白后至少需要 10 个字符。

成功响应包含：

- `problem_id`
- `original_content`
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
- `mastery_status`
- `personal_notes`
- `created_at`
- `updated_at`

状态码：

- `200 OK`：返回完整 Mock 解析。
- `422 Unprocessable Entity`：请求体缺失或题目文本过短。

### `GET /api/problems`

按创建时间倒序返回历史记录。列表项包含 ID、标题、难度、标签、掌握状态和创建时间。

### `GET /api/problems/{problem_id}`

返回原题、完整解析、标签、掌握状态和个人备注。

- `200 OK`：返回题目详情。
- `404 Not Found`：记录不存在。

### `PATCH /api/problems/{problem_id}`

部分更新掌握状态或个人备注。请求至少包含一个字段：

```json
{
  "mastery_status": "学习中",
  "personal_notes": "复习时重点解释为什么先查补数。"
}
```

允许的掌握状态为 `未掌握`、`学习中` 和 `已掌握`。个人备注最长 5000 字符。

### `GET /api/categories`

返回总体学习统计和按标签聚合的掌握情况：

- 总题数
- 已掌握题数
- 待复习题数
- 总体掌握率
- 各标签的未掌握、学习中、已掌握数量和掌握率

标签按待复习数量降序、掌握率升序排列。

### 历史记录筛选

`GET /api/problems` 支持：

- `tag`：按标签名称精确筛选。
- `review_only=true`：只返回 `未掌握` 和 `学习中`。

参数可以组合，例如：

```text
GET /api/problems?tag=哈希表&review_only=true
```

实际请求和响应结构将在实现相应功能时确定并写入本文档。

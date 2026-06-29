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

提交题目文本，获取结构化 AI 解析并保存为学习记录。配置 `DEEPSEEK_API_KEY` 时使用 DeepSeek；未配置时使用固定 Mock Provider。

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

- `200 OK`：返回完整解析并已保存。
- `502 Bad Gateway`：AI 返回内容为空、不是合法 JSON 或未通过 Schema 校验。
- `503 Service Unavailable`：AI Key 无效、被限流或上游服务不可用。
- `504 Gateway Timeout`：AI 服务调用超时。
- `422 Unprocessable Entity`：请求体缺失或题目文本过短。

所有 AI 失败场景都不会创建题目、解析或标签记录。

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

### `GET /api/problems/{problem_id}/agent`

返回当前题目的 Agent 会话、用户/助手消息、工具轨迹、长期学习记忆和当前学习记录。没有会话时返回空集合，不创建数据。

### `POST /api/problems/{problem_id}/agent/messages`

发送一条 1–4000 字符的导师消息：

```json
{
  "content": "为什么找到目标后还要继续向左搜索？"
}
```

Agent 最多执行 4 次模型迭代和 4 个白名单工具。成功后返回完整会话；DeepSeek 或 Agent Loop 失败时整个回合回滚。

状态码：

- `200 OK`：消息、回复和工具轨迹已保存。
- `404 Not Found`：题目不存在。
- `422 Unprocessable Entity`：消息为空或过长。
- `502 Bad Gateway`：模型响应、工具循环或最终回复异常。
- `503 Service Unavailable`：Agent 配置或 DeepSeek 服务不可用。
- `504 Gateway Timeout`：DeepSeek 响应超时。

### `POST /api/problems/{problem_id}/agent/tool-calls/{tool_call_id}/confirm`

确认 Agent 提议的掌握状态或个人备注更新。接口幂等，只有属于当前题目且状态为 `pending_confirmation` 的 `update_learning_record` Tool Call 可以执行。

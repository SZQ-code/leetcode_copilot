import type {
  ProblemSolution,
  ProblemSolveRequest,
} from "../types/problem";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL
).replace(/\/$/, "");

export async function solveProblem(content: string): Promise<ProblemSolution> {
  const payload: ProblemSolveRequest = { content };
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/problems/solve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("无法连接后端服务，请确认 FastAPI 已在 8000 端口运行。");
  }

  if (!response.ok) {
    if (response.status === 422) {
      throw new Error("题目文本未通过校验，请至少输入 10 个有效字符。");
    }

    throw new Error(`解题请求失败（HTTP ${response.status}），请稍后重试。`);
  }

  return (await response.json()) as ProblemSolution;
}

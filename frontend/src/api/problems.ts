import type {
  ProblemDetail,
  ProblemListItem,
  ProblemSolution,
  ProblemSolveRequest,
  ProblemUpdateRequest,
} from "../types/problem";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL
).replace(/\/$/, "");

async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, init);
  } catch {
    throw new Error("无法连接后端服务，请确认 FastAPI 已在 8000 端口运行。");
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("题目记录不存在或已被删除。");
    }

    if (response.status === 422) {
      throw new Error("提交的数据未通过校验，请检查输入内容。");
    }

    throw new Error(`请求失败（HTTP ${response.status}），请稍后重试。`);
  }

  return (await response.json()) as T;
}

function jsonRequestInit(
  method: "POST" | "PATCH",
  payload: object,
): RequestInit {
  return {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };
}

export function solveProblem(content: string): Promise<ProblemDetail> {
  const payload: ProblemSolveRequest = { content };
  return apiRequest<ProblemDetail>(
    "/api/problems/solve",
    jsonRequestInit("POST", payload),
  );
}

export function getProblems(): Promise<ProblemListItem[]> {
  return apiRequest<ProblemListItem[]>("/api/problems");
}

export function getProblem(problemId: number): Promise<ProblemDetail> {
  return apiRequest<ProblemDetail>(`/api/problems/${problemId}`);
}

export function updateProblem(
  problemId: number,
  updates: ProblemUpdateRequest,
): Promise<ProblemDetail> {
  return apiRequest<ProblemDetail>(
    `/api/problems/${problemId}`,
    jsonRequestInit("PATCH", updates),
  );
}

export type ProblemDifficulty = "简单" | "中等" | "困难";

export interface ProblemSolveRequest {
  content: string;
}

export interface ProblemSolution {
  title: string;
  difficulty: ProblemDifficulty;
  tags: string[];
  problem_summary: string;
  solution_approach: string;
  algorithm_reason: string;
  python_code: string;
  code_explanation: string[];
  time_complexity: string;
  space_complexity: string;
  common_mistakes: string[];
  edge_cases: string[];
  teaching_analysis: string;
}

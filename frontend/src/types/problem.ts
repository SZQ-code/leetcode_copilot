export type ProblemDifficulty = "简单" | "中等" | "困难";
export type MasteryStatus = "未掌握" | "学习中" | "已掌握";

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

export interface ProblemListItem {
  problem_id: number;
  title: string;
  difficulty: ProblemDifficulty;
  tags: string[];
  mastery_status: MasteryStatus;
  created_at: string;
}

export interface ProblemDetail extends ProblemSolution {
  problem_id: number;
  original_content: string;
  mastery_status: MasteryStatus;
  personal_notes: string;
  created_at: string;
  updated_at: string;
}

export interface ProblemUpdateRequest {
  mastery_status?: MasteryStatus;
  personal_notes?: string;
}

export interface ProblemListFilters {
  tag?: string | null;
  reviewOnly?: boolean;
}

export interface CategoryStats {
  tag: string;
  total_count: number;
  unmastered_count: number;
  learning_count: number;
  mastered_count: number;
  review_count: number;
  mastery_rate: number;
}

export interface CategoryOverview {
  total_problems: number;
  mastered_problems: number;
  review_problems: number;
  mastery_rate: number;
  categories: CategoryStats[];
}

from app.schemas.problem import ProblemSolution


class MockProvider:
    def solve(self, problem_content: str) -> ProblemSolution:
        """Return a deterministic solution for offline development and tests."""

        _ = problem_content

        return ProblemSolution(
            title="两数之和",
            difficulty="简单",
            tags=["数组", "哈希表"],
            problem_summary=(
                "给定一个整数数组和目标值，需要找出数组中两个不同位置的元素，"
                "使它们的和等于目标值，并返回这两个位置的下标。"
            ),
            solution_approach=(
                "从左到右遍历数组。对当前元素 value，计算还需要的数 "
                "complement = target - value。如果 complement 已经出现在哈希表中，"
                "就返回它的下标和当前下标；否则把当前值及其下标存入哈希表。"
            ),
            algorithm_reason=(
                "暴力枚举每一对元素需要 O(n²) 时间。哈希表能够用接近 O(1) 的平均时间"
                "判断补数是否出现，从而把一次嵌套查找改成一次线性遍历。"
            ),
            python_code=(
                "def two_sum(nums: list[int], target: int) -> list[int]:\n"
                "    seen: dict[int, int] = {}\n"
                "\n"
                "    for index, value in enumerate(nums):\n"
                "        complement = target - value\n"
                "        if complement in seen:\n"
                "            return [seen[complement], index]\n"
                "        seen[value] = index\n"
                "\n"
                "    return []"
            ),
            code_explanation=[
                "`seen` 保存已经遍历过的数值及其下标。",
                "每次循环先计算当前元素对应的补数。",
                "先查找补数，再保存当前元素，避免同一个元素被使用两次。",
                "找到匹配后立即返回两个下标；没有匹配时返回空列表。",
            ],
            time_complexity="O(n)",
            space_complexity="O(n)",
            common_mistakes=[
                "先把当前元素放入哈希表再查找，可能把同一个位置使用两次。",
                "返回元素值而不是题目要求的下标。",
                "使用双重循环导致时间复杂度退化为 O(n²)。",
            ],
            edge_cases=[
                "数组中存在重复数字，例如 [3, 3]，目标值为 6。",
                "目标值或数组元素为负数。",
                "答案中的两个元素相距很远。",
            ],
            teaching_analysis=(
                "这道题的核心不是记住代码，而是识别“查找另一个配对元素”的模式。"
                "当暴力方案需要反复扫描数组寻找某个值时，可以考虑用哈希表把查找成本降下来。"
                "复盘时应重点解释为什么必须先查找补数、再保存当前元素。"
            ),
        )

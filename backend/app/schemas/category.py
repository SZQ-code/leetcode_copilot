from pydantic import BaseModel, Field


class CategoryStats(BaseModel):
    tag: str
    total_count: int = Field(ge=0)
    unmastered_count: int = Field(ge=0)
    learning_count: int = Field(ge=0)
    mastered_count: int = Field(ge=0)
    review_count: int = Field(ge=0)
    mastery_rate: float = Field(ge=0, le=100)


class CategoryOverview(BaseModel):
    total_problems: int = Field(ge=0)
    mastered_problems: int = Field(ge=0)
    review_problems: int = Field(ge=0)
    mastery_rate: float = Field(ge=0, le=100)
    categories: list[CategoryStats]

from sqlalchemy import Column, ForeignKey, Integer, Table

from app.db.base import Base

problem_tags = Table(
    "problem_tags",
    Base.metadata,
    Column(
        "problem_id",
        Integer,
        ForeignKey("problems.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "tag_id",
        Integer,
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)

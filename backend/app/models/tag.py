from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.associations import problem_tags

if TYPE_CHECKING:
    from app.models.problem import Problem


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)

    problems: Mapped[list["Problem"]] = relationship(
        secondary=problem_tags,
        back_populates="tags",
    )

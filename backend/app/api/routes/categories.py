from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.category import CategoryOverview
from app.services.category_service import get_category_overview

router = APIRouter(prefix="/api/categories", tags=["categories"])
DatabaseSession = Annotated[Session, Depends(get_db)]


@router.get("", response_model=CategoryOverview)
def overview(session: DatabaseSession) -> CategoryOverview:
    return get_category_overview(session)

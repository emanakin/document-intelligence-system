from sqlalchemy import (
    Column, Integer, String, DateTime, ForeignKey, JSON, func, text
)
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property

from core.aws import get_s3_client, S3_BUCKET_NAME
from db.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename       = Column(String, nullable=False)
    url            = Column(String, nullable=True)
    s3_key         = Column(String, nullable=False, unique=True, index=True)
    content_type   = Column(String, nullable=False)
    file_size      = Column(Integer, nullable=False)
    page_count     = Column(Integer, nullable=False, default=1)
    status         = Column(String, nullable=False, default="uploaded")
    analysis       = Column(JSON, nullable=False, server_default=text("'{}'"))
    created_at     = Column(DateTime(timezone=True), server_default=func.now())
    user_id        = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationship back to your User
    owner = relationship("User", back_populates="documents")

    @hybrid_property
    def presigned_url(self) -> str:
        """
        Generate a time‑limited URL to fetch this object.
        """
        s3 = get_s3_client()
        return s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": S3_BUCKET_NAME, "Key": self.s3_key},
            ExpiresIn=3600,
        )

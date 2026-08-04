from sqlmodel import SQLModel, Field

class Rol(SQLModel, table=True):
    __tablename__ = "roles"

    id: int | None = Field(default=None, primary_key=True)
    nombre: str
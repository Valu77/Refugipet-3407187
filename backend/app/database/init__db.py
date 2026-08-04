from sqlmodel import SQLModel
from app.config.database import engine

def create_db():
    SQLModel.metadata.create_all(engine)
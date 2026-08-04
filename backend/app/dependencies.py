from app.database.session import get_session

def get_db():
    return next(get_session())
from fastapi import FastAPI

from .application.service import NoteService
from .persistence.repository import NoteRepository, init_schema, make_pool
from .web.routes import make_router


def create_app() -> FastAPI:
    pool = make_pool()
    init_schema(pool)

    repo = NoteRepository(pool)
    service = NoteService(repo)

    app = FastAPI(title="notes-layered")
    app.include_router(make_router(service))
    return app


app = create_app()

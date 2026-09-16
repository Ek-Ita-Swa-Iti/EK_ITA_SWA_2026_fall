from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..application.service import NoteService
from ..domain.note import InvalidNoteError


class CreateNoteRequest(BaseModel):
    title: str
    body: str


class NoteResponse(BaseModel):
    id: int
    title: str
    body: str


class ServiceInfo(BaseModel):
    service: str
    endpoints: list[str]


def make_router(service: NoteService) -> APIRouter:
    router = APIRouter()

    @router.get("/")
    def root() -> ServiceInfo:
        return ServiceInfo(
            service="notes-layered",
            endpoints=["GET /notes", "GET /notes/{id}", "POST /notes"],
        )

    @router.get("/notes")
    def list_notes() -> list[NoteResponse]:
        return [NoteResponse(id=n.id, title=n.title, body=n.body) for n in service.list()]

    @router.get("/notes/{note_id}")
    def get_note(note_id: int) -> NoteResponse:
        note = service.get(note_id)
        if note is None:
            raise HTTPException(status_code=404, detail="not found")
        return NoteResponse(id=note.id, title=note.title, body=note.body)

    @router.post("/notes", status_code=201)
    def create_note(req: CreateNoteRequest) -> NoteResponse:
        try:
            note = service.create(req.title, req.body)
        except InvalidNoteError as e:
            raise HTTPException(status_code=400, detail=str(e)) from e
        return NoteResponse(id=note.id, title=note.title, body=note.body)

    return router

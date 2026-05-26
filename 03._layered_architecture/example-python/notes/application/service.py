from ..domain.note import Note, validate_title
from ..persistence.repository import NoteRepository


class NoteService:
    def __init__(self, repo: NoteRepository) -> None:
        self._repo = repo

    def list(self) -> list[Note]:
        return self._repo.find_all()

    def get(self, note_id: int) -> Note | None:
        return self._repo.find_by_id(note_id)

    def create(self, title: str, body: str) -> Note:
        valid_title = validate_title(title)
        return self._repo.insert(valid_title, body)

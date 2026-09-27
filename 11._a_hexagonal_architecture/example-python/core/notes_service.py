# The CORE: the application's own logic. It only knows the port —
# it never imports anything from adapters/.

from core.notes_repository import NotesRepository


class NotesService:
    def __init__(self, repository: NotesRepository):
        # Whichever adapter main.py plugs in. We only use the port's methods.
        self.repository = repository

    def list_notes(self):
        return self.repository.find_all()

    def get_note(self, note_id):
        return self.repository.find_by_id(note_id)

    def create_note(self, title, body):
        # The one rule the core owns: no empty notes, no stray whitespace.
        title = title.strip()
        body = body.strip()
        if not title or not body:
            raise ValueError("title and body are required")
        return self.repository.create(title, body)

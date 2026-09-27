# A DRIVEN adapter: the core drives it, through the port.
# It plugs into the port by extending NotesRepository.

from core.notes_repository import NotesRepository


class InMemoryNotesRepository(NotesRepository):
    def __init__(self):
        self.notes = [
            {"id": 1, "title": "Welcome", "body": "This note lives in memory."},
            {"id": 2, "title": "Second note", "body": "Restart the app and new notes are gone."},
        ]

    def find_all(self):
        return self.notes

    def find_by_id(self, note_id):
        for note in self.notes:
            if note["id"] == note_id:
                return note
        return None

    def create(self, title, body):
        note = {"id": len(self.notes) + 1, "title": title, "body": body}
        self.notes.append(note)
        return note

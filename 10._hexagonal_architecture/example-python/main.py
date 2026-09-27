# The COMPOSITION ROOT: the one place that knows which adapters are plugged in.
# To swap an adapter, change this file — nothing in core/ changes.

from adapters.http_server import serve
from adapters.in_memory_notes_repository import InMemoryNotesRepository
from core.notes_service import NotesService

repository = InMemoryNotesRepository()
service = NotesService(repository)
serve(service, port=3000)

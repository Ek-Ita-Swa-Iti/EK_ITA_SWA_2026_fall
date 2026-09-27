# The PORT: what the core needs from storage, written in the core's own words.
# It says nothing about HOW notes are stored — that is an adapter's job.

from abc import ABC, abstractmethod


class NotesRepository(ABC):
    @abstractmethod
    def find_all(self):
        """Return a list of all notes."""

    @abstractmethod
    def find_by_id(self, note_id):
        """Return one note, or None if no note has that id."""

    @abstractmethod
    def create(self, title, body):
        """Store a new note and return it, including its new id."""

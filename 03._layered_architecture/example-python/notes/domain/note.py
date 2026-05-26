from dataclasses import dataclass

MAX_TITLE_LENGTH = 100


class InvalidNoteError(Exception):
    pass


@dataclass(frozen=True)
class Note:
    id: int
    title: str
    body: str


def validate_title(raw: str) -> str:
    title = raw.strip()
    if not title:
        raise InvalidNoteError("title cannot be blank")
    if len(title) > MAX_TITLE_LENGTH:
        raise InvalidNoteError(f"title cannot exceed {MAX_TITLE_LENGTH} characters")
    return title

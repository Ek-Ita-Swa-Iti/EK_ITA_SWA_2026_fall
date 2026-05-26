import os

from psycopg_pool import ConnectionPool

from ..domain.note import Note


def make_pool() -> ConnectionPool:
    return ConnectionPool(
        conninfo=os.getenv(
            "DATABASE_URL",
            "postgresql://notes:notes@db:5432/notes",
        ),
        min_size=1,
        max_size=5,
    )


def init_schema(pool: ConnectionPool) -> None:
    with pool.connection() as conn, conn.cursor() as cur:
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS notes (
                id BIGSERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                body TEXT NOT NULL
            )
            """
        )


class NoteRepository:
    def __init__(self, pool: ConnectionPool) -> None:
        self._pool = pool

    def find_all(self) -> list[Note]:
        with self._pool.connection() as conn, conn.cursor() as cur:
            cur.execute("SELECT id, title, body FROM notes ORDER BY id")
            return [Note(*row) for row in cur.fetchall()]

    def find_by_id(self, note_id: int) -> Note | None:
        with self._pool.connection() as conn, conn.cursor() as cur:
            cur.execute(
                "SELECT id, title, body FROM notes WHERE id = %s",
                (note_id,),
            )
            row = cur.fetchone()
            return Note(*row) if row else None

    def insert(self, title: str, body: str) -> Note:
        with self._pool.connection() as conn, conn.cursor() as cur:
            cur.execute(
                "INSERT INTO notes (title, body) VALUES (%s, %s) RETURNING id",
                (title, body),
            )
            (new_id,) = cur.fetchone()
            return Note(id=new_id, title=title, body=body)

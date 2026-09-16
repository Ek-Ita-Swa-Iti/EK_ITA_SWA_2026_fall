package com.example.notes.persistence

import com.example.notes.domain.Note
import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import javax.sql.DataSource

fun dataSource(): DataSource {
    val config = HikariConfig().apply {
        jdbcUrl = System.getenv("DATABASE_URL") ?: "jdbc:postgresql://db:5432/notes"
        username = System.getenv("DATABASE_USER") ?: "notes"
        password = System.getenv("DATABASE_PASSWORD") ?: "notes"
        maximumPoolSize = 5
    }
    return HikariDataSource(config)
}

fun initSchema(ds: DataSource) {
    ds.connection.use { conn ->
        conn.createStatement().use { stmt ->
            stmt.executeUpdate(
                """
                CREATE TABLE IF NOT EXISTS notes (
                    id BIGSERIAL PRIMARY KEY,
                    title TEXT NOT NULL,
                    body TEXT NOT NULL
                )
                """.trimIndent()
            )
        }
    }
}

class NoteRepository(private val ds: DataSource) {

    fun findAll(): List<Note> {
        ds.connection.use { conn ->
            conn.prepareStatement(
                "SELECT id, title, body FROM notes ORDER BY id"
            ).use { ps ->
                ps.executeQuery().use { rs ->
                    val out = mutableListOf<Note>()
                    while (rs.next()) {
                        out += Note(rs.getLong("id"), rs.getString("title"), rs.getString("body"))
                    }
                    return out
                }
            }
        }
    }

    fun findById(id: Long): Note? {
        ds.connection.use { conn ->
            conn.prepareStatement(
                "SELECT id, title, body FROM notes WHERE id = ?"
            ).use { ps ->
                ps.setLong(1, id)
                ps.executeQuery().use { rs ->
                    return if (rs.next()) {
                        Note(rs.getLong("id"), rs.getString("title"), rs.getString("body"))
                    } else null
                }
            }
        }
    }

    fun insert(title: String, body: String): Note {
        ds.connection.use { conn ->
            conn.prepareStatement(
                "INSERT INTO notes (title, body) VALUES (?, ?) RETURNING id"
            ).use { ps ->
                ps.setString(1, title)
                ps.setString(2, body)
                ps.executeQuery().use { rs ->
                    rs.next()
                    return Note(rs.getLong("id"), title, body)
                }
            }
        }
    }
}

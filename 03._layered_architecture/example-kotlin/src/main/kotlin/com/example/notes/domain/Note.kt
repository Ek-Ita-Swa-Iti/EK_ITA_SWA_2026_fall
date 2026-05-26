package com.example.notes.domain

import kotlinx.serialization.Serializable

@Serializable
data class Note(val id: Long, val title: String, val body: String)

class InvalidNoteException(message: String) : RuntimeException(message)

object NoteRules {
    const val MAX_TITLE_LENGTH = 100

    fun validateTitle(raw: String): String {
        val title = raw.trim()
        if (title.isEmpty()) throw InvalidNoteException("title cannot be blank")
        if (title.length > MAX_TITLE_LENGTH) {
            throw InvalidNoteException("title cannot exceed $MAX_TITLE_LENGTH characters")
        }
        return title
    }
}

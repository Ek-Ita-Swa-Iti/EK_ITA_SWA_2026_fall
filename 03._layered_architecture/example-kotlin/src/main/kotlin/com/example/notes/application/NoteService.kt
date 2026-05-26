package com.example.notes.application

import com.example.notes.domain.Note
import com.example.notes.domain.NoteRules
import com.example.notes.persistence.NoteRepository

class NoteService(private val repo: NoteRepository) {

    fun list(): List<Note> = repo.findAll()

    fun get(id: Long): Note? = repo.findById(id)

    fun create(title: String, body: String): Note {
        val validTitle = NoteRules.validateTitle(title)
        return repo.insert(validTitle, body)
    }
}

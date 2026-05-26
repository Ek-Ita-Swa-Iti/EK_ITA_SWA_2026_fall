package com.example.notes

import com.example.notes.application.NoteService
import com.example.notes.persistence.NoteRepository
import com.example.notes.persistence.dataSource
import com.example.notes.persistence.initSchema
import com.example.notes.web.noteRoutes
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.install
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.routing.routing

fun main() {
    val ds = dataSource()
    initSchema(ds)

    val repo = NoteRepository(ds)
    val service = NoteService(repo)

    embeddedServer(Netty, port = 8080, host = "0.0.0.0") {
        install(ContentNegotiation) { json() }
        routing { noteRoutes(service) }
    }.start(wait = true)
}

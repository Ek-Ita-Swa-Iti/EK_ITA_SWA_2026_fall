package com.example.notes.web

import com.example.notes.application.NoteService
import com.example.notes.domain.InvalidNoteException
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import kotlinx.serialization.Serializable

@Serializable
data class CreateNoteRequest(val title: String, val body: String)

@Serializable
data class ServiceInfo(val service: String, val endpoints: List<String>)

fun Route.noteRoutes(service: NoteService) {
    get("/") {
        call.respond(
            ServiceInfo(
                service = "notes-layered",
                endpoints = listOf("GET /notes", "GET /notes/{id}", "POST /notes")
            )
        )
    }
    route("/notes") {
        get {
            call.respond(service.list())
        }
        get("/{id}") {
            val id = call.parameters["id"]?.toLongOrNull()
                ?: return@get call.respond(HttpStatusCode.BadRequest, "id must be a number")
            val note = service.get(id) ?: return@get call.respond(HttpStatusCode.NotFound)
            call.respond(note)
        }
        post {
            val req = call.receive<CreateNoteRequest>()
            try {
                val created = service.create(req.title, req.body)
                call.respond(HttpStatusCode.Created, created)
            } catch (e: InvalidNoteException) {
                call.respond(HttpStatusCode.BadRequest, e.message ?: "invalid note")
            }
        }
    }
}

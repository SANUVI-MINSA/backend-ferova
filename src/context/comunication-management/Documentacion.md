# Communication API — Teleconsulta Médica

**Base URL:** `/api/communication`

> ⚠️ **Autenticación:** Actualmente los endpoints no requieren autenticación. Próximamente se implementará Bearer Token (JWT) mediante el header `Authorization: Bearer <token>`. Los campos como `motherId`, `nurseId` y `senderId` pasarán a extraerse automáticamente del token.

---

## Endpoints

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| `POST` | `/consultations` | Iniciar una teleconsulta | Madre |
| `POST` | `/messages` | Enviar un mensaje | Madre / Enfermera |
| `DELETE` | `/consultations/close` | Cerrar una teleconsulta | Enfermera |
| `GET` | `/patients/:motherId` | Listar hijos con enfermera asignada | Madre |
| `GET` | `/nurse-info/:patientId` | Info de la enfermera de un paciente | Madre / Enfermera |
| `GET` | `/chat/:consultationId` | Historial de mensajes de una consulta | Madre / Enfermera |
| `GET` | `/mother/:motherId/consultations` | Consultas activas de una madre | Madre |
| `GET` | `/nurse/:nurseId/consultations` | Bandeja de consultas de una enfermera | Enfermera |
| `GET` | `/chat/:consultationId/messages/after` | Mensajes nuevos desde un timestamp (sync móvil) | Madre / Enfermera |

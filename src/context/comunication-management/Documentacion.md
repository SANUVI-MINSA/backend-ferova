# Communication Bounded Context - API Documentation

## Contexto: Teleconsulta Médica

### Descripción

El Bounded Context de **Communication** gestiona el sistema de **teleconsulta médica** entre **enfermeras** (Ferova Clinic) y **madres** (Ferova Family) para la atención de sus **pacientes menores de edad**.

**¿Qué pueden hacer las madres?**
- Iniciar consultas médicas para sus hijos
- Enviar mensajes describiendo síntomas o dudas
- Recibir respuestas de la enfermera asignada al paciente
- Ver el historial completo de la conversación

**¿Qué pueden hacer las enfermeras?**
- Visualizar todas sus consultas activas (bandeja de entrada)
- Responder mensajes con indicaciones médicas
- Cerrar consultas (solo después de haber respondido al menos una vez)
- Buscar consultas por nombre del paciente o nombre de la madre

**Reglas de negocio importantes:**
- Un paciente solo puede tener **una teleconsulta activa a la vez**
- Para iniciar una consulta, el paciente debe tener una **enfermera asignada previamente**
- Solo la **enfermera asignada** puede cerrar la consulta
- La enfermera debe responder **al menos una vez** antes de poder cerrar
- Las consultas cerradas se **eliminan físicamente** (no hay historial persistente)
- Solo la **madre y la enfermera involucradas** pueden acceder al chat

---

## ⚠️ Autenticación — Pendiente de implementar

> Actualmente los endpoints **NO requieren autenticación** durante el desarrollo. Sin embargo, en el futuro cercano se implementará autenticación mediante **Bearer Token (JWT)**.

**Preparación para el futuro:**
- Todos los endpoints deberán incluir el header `Authorization: Bearer <token>`
- El token será enviado por el backend de IAM (Identity Access Management)
- El `requesterId` que actualmente se envía en algunos endpoints será **extraído automáticamente del token**

**Headers que pasarán a ser obligatorios:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

> Mientras no esté implementado, los frontends pueden seguir trabajando normalmente con los IDs explícitos. Cuando se implemente, se actualizará esta documentación y se notificará con anticipación.

---

## Base URL

```
/api/communication
```

---

## Resumen de Endpoints

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| `POST` | `/consultations` | Iniciar teleconsulta | Madre |
| `POST` | `/messages` | Enviar mensaje | Madre / Enfermera |
| `DELETE` | `/consultations/close` | Cerrar teleconsulta | Enfermera |
| `GET` | `/patients/:motherId` | Listar hijos con enfermera asignada | Madre |
| `GET` | `/nurse-info/:patientId` | Información de enfermera del paciente | Madre / Enfermera |
| `GET` | `/chat/:consultationId` | Historial completo de mensajes | Madre / Enfermera |
| `GET` | `/mother/:motherId/consultations` | Teleconsultas activas de la madre | Madre |
| `GET` | `/nurse/:nurseId/consultations` | Bandeja de teleconsultas de la enfermera | Enfermera |
| `GET` | `/chat/:consultationId/messages/after` | Mensajes incrementales (sincronización móvil) | Madre / Enfermera |

---

## Endpoints

### 1. Iniciar una consulta (Madre)

**`POST /consultations`**

La madre inicia una nueva teleconsulta para uno de sus pacientes menores.

#### Request Body

```json
{
    "motherId": "string",
    "patientId": "string",
    "firstMessageContent": "string"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `motherId` | string | ✅ | ID de la madre |
| `patientId` | string | ✅ | ID del paciente (hijo/a) |
| `firstMessageContent` | string | ✅ | Primer mensaje con síntomas o consulta médica |

#### Response `201 Created`

```json
{
    "consultationId": "uuid-string",
    "message": "Consultation created successfully"
}
```

#### Errores `400`

| Error | Significado |
|-------|-------------|
| `Patient not found` | El paciente no existe |
| `Patient does not belong to this mother` | El paciente no es hijo de esta madre |
| `Patient has no assigned nurse` | El paciente no tiene enfermera asignada |
| `There is already an active consultation for this patient` | Ya hay una consulta activa para este paciente |

---

### 2. Enviar mensaje (Madre o Enfermera)

**`POST /messages`**

Envía un mensaje dentro de una teleconsulta activa.

#### Request Body

```json
{
    "consultationId": "string",
    "senderId": "string",
    "senderRole": "MOTHER | NURSE",
    "content": "string"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `consultationId` | string | ✅ | ID de la consulta |
| `senderId` | string | ✅ | ID del remitente |
| `senderRole` | string | ✅ | `MOTHER` (madre) o `NURSE` (enfermera) |
| `content` | string | ✅ | Contenido del mensaje |

#### Response `200 OK`

```json
{
    "message": "Message sent successfully"
}
```

#### Errores `400`

| Error | Significado |
|-------|-------------|
| `Consultation not found` | La consulta no existe |
| `Sender is not part of this consultation` | El remitente no pertenece a esta consulta |

---

### 3. Cerrar consulta (Enfermera)

**`DELETE /consultations/close`**

La enfermera cierra una teleconsulta. Requisito: debe haber enviado al menos un mensaje de respuesta.

#### Request Body

```json
{
    "consultationId": "string",
    "nurseId": "string"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `consultationId` | string | ✅ | ID de la consulta |
| `nurseId` | string | ✅ | ID de la enfermera |

#### Response `200 OK`

```json
{
    "message": "Consultation closed successfully"
}
```

#### Errores `400`

| Error | Significado |
|-------|-------------|
| `Consultation not found` | La consulta no existe |
| `Only assigned nurse can close consultation` | Solo la enfermera asignada puede cerrar |
| `Consultation must contain at least one nurse response before closing` | La enfermera debe responder al menos una vez |

---

### 4. Obtener pacientes con enfermera asignada (Madre)

**`GET /patients/:motherId`**

La madre obtiene la lista de sus hijos con la información de la enfermera asignada a cada uno.

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `motherId` | string | ID de la madre |

#### Response `200 OK`

```json
[
    {
        "patientId": "string",
        "patientName": "Juan Pérez",
        "hasNurseAssigned": true,
        "nurseId": "string",
        "nurseName": "María González"
    }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `patientId` | string | ID del paciente |
| `patientName` | string | Nombre completo del paciente |
| `hasNurseAssigned` | boolean | Si tiene enfermera asignada |
| `nurseId` | string | ID de la enfermera (si tiene) |
| `nurseName` | string | Nombre de la enfermera (si tiene) |

---

### 5. Obtener información de enfermera para consulta

**`GET /nurse-info/:patientId`**

Obtiene los datos de la enfermera asignada a un paciente específico.

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `patientId` | string | ID del paciente |

#### Response `200 OK`

```json
{
    "patientId": "string",
    "patientName": "Juan Pérez",
    "nurseId": "string",
    "nurseName": "María González"
}
```

#### Errores `400`

| Error | Significado |
|-------|-------------|
| `Patient not found` | El paciente no existe |
| `This patient no longer has an assigned nurse` | El paciente no tiene enfermera asignada |

---

### 6. Obtener chat de consulta (Madre o Enfermera)

**`GET /chat/:consultationId`**

Obtiene todo el historial de mensajes de una teleconsulta.

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `consultationId` | string | ID de la consulta |

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `requesterId` | string | ✅ | ID del usuario (madre o enfermera) que hace la petición |

#### Response `200 OK`

```json
{
    "consultationId": "string",
    "patientId": "string",
    "nurseId": "string",
    "messages": [
        {
            "id": "string",
            "senderId": "string",
            "senderRole": "MOTHER | NURSE",
            "content": "string",
            "sentAt": "2024-01-15T10:30:00.000Z"
        }
    ]
}
```

#### Errores `400`

| Error | Significado |
|-------|-------------|
| `Consultation not found` | La consulta no existe |
| `Not authorized` | No estás autorizado para ver este chat |

---

### 7. Obtener consultas activas de una madre

**`GET /mother/:motherId/consultations`**

Lista todas las teleconsultas activas que una madre tiene con sus hijos. Incluye nombre del paciente, nombre de la enfermera y último mensaje.

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `motherId` | string | ID de la madre |

#### Response `200 OK`

```json
[
    {
        "consultationId": "string",
        "patientId": "string",
        "patientName": "Mateo Pérez Gómez",
        "motherId": "string",
        "motherName": "Ana Pérez",
        "nurseId": "string",
        "nurseName": "María González",
        "lastMessage": "Gracias enfermera, aplicaré la indicación...",
        "lastMessageDate": "2024-01-15T10:30:00.000Z",
        "lastMessageSenderRole": "MOTHER",
        "createdAt": "2024-01-15T10:00:00.000Z",
        "messageCount": 5
    }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `consultationId` | string | ID único de la consulta |
| `patientId` | string | ID del paciente |
| `patientName` | string | Nombre completo del paciente |
| `motherId` | string | ID de la madre |
| `motherName` | string | Nombre de la madre |
| `nurseId` | string | ID de la enfermera asignada |
| `nurseName` | string | Nombre de la enfermera |
| `lastMessage` | string | Contenido del último mensaje |
| `lastMessageDate` | string (ISO date) | Fecha del último mensaje |
| `lastMessageSenderRole` | string | `MOTHER` o `NURSE` |
| `createdAt` | string (ISO date) | Fecha de creación de la consulta |
| `messageCount` | number | Cantidad total de mensajes |

---

### 8. Obtener consultas activas de una enfermera (Bandeja de Consultas)

**`GET /nurse/:nurseId/consultations?searchTerm={searchTerm}`**

Lista todas las teleconsultas activas asignadas a una enfermera. Permite buscar por nombre del paciente o nombre de la madre.

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `nurseId` | string | ID de la enfermera |

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `searchTerm` | string | ❌ | Buscar por nombre del paciente o nombre de la madre |

#### Responses

##### Escenario 1: Con consultas activas

#### Response `200 OK`

```json
[
    {
        "consultationId": "string",
        "patientId": "string",
        "patientName": "Mateo Pérez",
        "motherId": "string",
        "motherName": "Ana Pérez",
        "nurseId": "string",
        "nurseName": "María González",
        "lastMessage": "Gracias enfermera, aplicaré la indicación...",
        "lastMessageDate": "2024-01-15T10:30:00.000Z",
        "createdAt": "2024-01-15T10:00:00.000Z",
        "messageCount": 5
    },
    {
        "consultationId": "string",
        "patientId": "string",
        "patientName": "Valentina Gómez",
        "motherId": "string",
        "motherName": "María Gómez",
        "nurseId": "string",
        "nurseName": "María González",
        "lastMessage": "Mi hija tiene fiebre...",
        "lastMessageDate": "2024-01-15T11:00:00.000Z",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "messageCount": 3
    }
]

```
##### Escenario 2: Tiene pacientes asignados pero NO tiene consultas activas

**Response 200 OK**

```json
{
    "consultations": [],
    "message": "No tienes consultas activas aún",
    "detail": "Las madres pueden iniciar consultas para sus hijos. Cuando una madre inicie una consulta, aparecerá aquí.",
    "status": "NO_CONSULTAS"
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| consultations | array | Lista vacía de consultas |
| message | string | Mensaje principal para el usuarios |
| detail | string | Mensaje secundario con más contexto |
| status | string | Estado: NO_CONSULTAS |

**¿Cuándo ocurre este escenario?**

- La enfermera tiene pacientes asignados en su cartera

- Pero ninguna madre ha iniciado una teleconsulta para esos pacientes

##### Escenario 3: NO tiene pacientes asignados en su cartera

**Response 200 OK**

```json
{
    "consultations": [],
    "message": "No tienes pacientes asignados en tu cartera",
    "detail": "Puedes asignar pacientes a tu cartera desde el módulo de pacientes. Ve a 'Pacientes' y selecciona 'Asignar a mi cartera'.",
    "action": "Asignar pacientes",
    "status": "SIN_PACIENTES"
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| consultations | array | Lista vacía de consultas |
| message | string | Mensaje principal para el usuarios |
| detail | string | Mensaje secundario con más contexto |
| action | string | Acción sugerida (texto para botón) |
| status | string | Estado: SIN_PACIENTES |

**¿Cuándo ocurre este escenario?**

- La enfermera no ha asignado ningún paciente a su cartera

- Por lo tanto, no puede tener consultas

##### Escenario 4: Búsqueda sin resultados

**Response 200 OK**


```json
{
    "consultations": [],
    "message": "No se encontraron consultas que coincidan con tu búsqueda",
    "detail": "No hay consultas con \"Carlos\" en el nombre del paciente o de la madre. Intenta con otro término.",
    "searchTerm": "Carlos",
    "status": "BUSQUEDA_SIN_RESULTADOS"
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| consultations | array | Lista vacía de consultas |
| message | string | Mensaje principal para el usuarios |
| detail | string | Mensaje secundario con más contexto |
| searchTerm | string | El término de búsqueda que no encontró resultados |
| status | string | Estado: BUSQUEDA_SIN_RESULTADOS |

**¿Cuándo ocurre este escenario?**

- La enfermera tiene consultas activas

- Pero el searchTerm no coincide con ningún nombre de paciente ni de madre

| Estado | Significado | Acción sugerida en UI |
|-------|------|-------------|
| NO_CONSULTAS | Tiene pacientes pero sin consultas | Mostrar mensaje informativo |
| SIN_PACIENTES | No tiene pacientes asignados | Mostrar botón "Asignar pacientes" |
| BUSQUEDA_SIN_RESULTADOS | Búsqueda sin resultados | Mostrar botón "Limpiar búsqueda" |

Ejemplo de flujo en UI (Ferova Clinic)

| Paso | Escenario | UI |
|-------|------|-------------|
| 1 | Sin pacientes asignados | Pantalla vacía con botón "Asignar pacientes" → navega a módulo de pacientes |
| 2 | Con pacientes pero sin consultas | Pantalla vacía con mensaje "No tienes consultas activas aún" |
| 3 | Con consultas | Lista de tarjetas con las consultas activas |
| 4 | Buscando y hay resultados | Lista filtrada de consultas |
| 5 | Buscando y no hay resultados| Pantalla vacía con mensaje |




---

### 9. Sincronización incremental de mensajes (Offline-first para Mobile)

**`GET /chat/:consultationId/messages/after`**

Obtiene solo los mensajes posteriores a un timestamp. Diseñado para sincronización con Room (SQLite) en apps móviles, permitiendo experiencias offline-first.

#### ¿Cómo funciona?

```
1. App abre el chat
   ↓
2. Room (SQLite) muestra mensajes guardados localmente (INSTANTÁNEO)
   ↓
3. App obtiene el timestamp del último mensaje guardado en Room
   ↓
4. App llama al endpoint con ese timestamp
   ↓
5. Backend devuelve SOLO mensajes nuevos (si hay)
   ↓
6. App guarda mensajes nuevos en Room
   ↓
7. Room actualiza la pantalla con los nuevos mensajes
```

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `consultationId` | string | ID de la consulta |

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `requesterId` | string | ✅ | ID del usuario (madre o enfermera) |
| `afterTimestamp` | number | ✅ | Timestamp Unix en milisegundos. Usar `0` en primera sincronización |
| `limit` | number | ❌ | Máximo de mensajes (default: `100`) |

#### Response `200 OK`

```json
[
    {
        "id": "string",
        "senderId": "string",
        "senderRole": "MOTHER | NURSE",
        "content": "string",
        "sentAt": "2024-01-15T10:35:00.000Z"
    }
]
```

#### Ejemplo de uso

**Primera vez que abres el chat:**
```
GET /chat/cons-123/messages/after?requesterId=mother-456&afterTimestamp=0&limit=100
→ Devuelve los últimos 100 mensajes
```

**Segunda vez (5 minutos después):**
```
GET /chat/cons-123/messages/after?requesterId=mother-456&afterTimestamp=1705335000000&limit=100
→ Devuelve solo los mensajes nuevos después de ese timestamp
```

#### Errores `400`

| Error | Significado |
|-------|-------------|
| `Consultation not found` | La consulta no existe |
| `Not authorized` | No estás autorizado |

---

## Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| `200` | OK — Operación exitosa |
| `201` | Created — Teleconsulta creada exitosamente |
| `400` | Bad Request — Error de validación o regla de negocio |
| `401` | Unauthorized — Futuro: Token no proporcionado o inválido |
| `403` | Forbidden — No autorizado para acceder al recurso |
| `404` | Not Found — Recurso no encontrado |

---

## Cambios Futuros — Resumen para Frontend

| Endpoint | Cambio previsto |
|----------|-----------------|
| Todos | Agregar header `Authorization: Bearer <token>` |
| `GET /chat/:consultationId` | `requesterId` se extraerá del token (dejar de enviarlo) |
| `GET /chat/:consultationId/messages/after` | `requesterId` se extraerá del token (dejar de enviarlo) |
| `GET /patients/:motherId` | `motherId` de URL se ignorará, se usará la del token |
| `GET /mother/:motherId/consultations` | `motherId` de URL se ignorará, se usará la del token |
| `GET /nurse/:nurseId/consultations` | `nurseId` de URL se ignorará, se usará la del token |
| `POST /consultations` | `motherId` del body se validará contra el token |
| `POST /messages` | `senderId` se extraerá del token (dejar de enviarlo) |
| `DELETE /consultations/close` | `nurseId` se extraerá del token (dejar de enviarlo) |

---

## Ejemplo de código Kotlin (Room) para sincronización

```kotlin
// En tu ViewModel o Repository

suspend fun syncMessages(consultationId: String) {
    // 1. Obtener el último timestamp guardado en Room
    val lastTimestamp = messageDao.getLastTimestamp(consultationId) ?: 0
    
    // 2. Llamar al endpoint
    val newMessages = api.getMessagesAfter(
        consultationId = consultationId,
        requesterId = currentUserId,
        afterTimestamp = lastTimestamp,
        limit = 100
    )
    
    // 3. Guardar mensajes nuevos en Room
    if (newMessages.isNotEmpty()) {
        messageDao.insertAll(newMessages)
        
        // 4. Actualizar el timestamp del último mensaje
        val newTimestamp = newMessages.last().sentAt
        consultationDao.updateLastTimestamp(consultationId, newTimestamp)
    }
}

// Mostrar mensajes desde Room (offline-first)
val messages = messageDao.getAllByConsultation(consultationId).collectAsState(initial = emptyList())
```

---

## Contacto

Para dudas o sugerencias sobre esta API, contactar al equipo de backend.

# Patient Management — API Reference

> **Base URL:** `/api/patients`  
> **Auth:** Todos los endpoints requieren `Authorization: Bearer <token>` salvo que se indique lo contrario.

---

## Índice

- [Contexto](#contexto)
- [Actores](#actores)
- [Entidades y estados](#entidades-y-estados)
- [Claims del token por rol](#claims-del-token-por-rol)
- [Endpoints para Madre](#-endpoints-para-madre)
- [Endpoints para Enfermera](#️-endpoints-para-enfermera)
- [Endpoint público](#-endpoint-público)
- [Reglas de negocio](#reglas-de-negocio)
- [Códigos HTTP](#códigos-http)
- [Notas para Frontend](#notas-para-frontend)

---

## Contexto

El bounded context de **Patient Management** gestiona el ciclo de vida completo de los pacientes pediátricos dentro de Ferova. Permite a las madres registrar a sus hijos y a las enfermeras realizar seguimiento clínico (historias clínicas, controles de hemoglobina y generación de reportes).

---

## Actores

| Actor | Responsabilidades |
|---|---|
| **Madre** | Registrar hijos · Ver evolución de hemoglobina |
| **Enfermera** | Asignarse pacientes · Crear/actualizar historias clínicas · Registrar controles · Dar de alta · Generar PDFs · Buscar madres |
| **Administrador** | Sin acciones directas en este BC |

---

## Entidades y estados

### Entidades principales

| Entidad | Descripción |
|---|---|
| `Patient` | Paciente pediátrico. Contiene datos personales, estado, enfermera asignada y establecimiento. |
| `MedicalRecord` | Historia clínica. Contiene peso, talla, motivo de consulta, observaciones, antecedentes, síntomas y controles. |
| `Control` | Registro de hemoglobina. Contiene fecha, nivel y estado de anemia (calculado automáticamente). |

### Estados del paciente

| Estado | Significado |
|---|---|
| `ACTIVE` | En seguimiento activo por una enfermera |
| `DISCHARGED` | Dado de alta, fuera de seguimiento |
| `INACTIVE` | No utilizado actualmente |

### Estados de anemia (calculados automáticamente)

| Estado | Rango | Descripción |
|---|---|---|
| `SEVERE` | < 7.0 g/dL | Anemia severa |
| `MODERATE` | 7.0 – 8.9 g/dL | Anemia moderada |
| `MILD` | 9.0 – 10.9 g/dL | Anemia leve |
| `CONTROLLED` | ≥ 11.0 g/dL | Nivel controlado |

---

## Claims del token por rol

> ⚠️ **El `motherId` y `nurseId` se extraen automáticamente del token JWT. No enviarlos en el body ni en la URL salvo que se indique explícitamente.**

| Rol | Claim | Valor |
|---|---|---|
| Madre | `motherId` | ID de la madre autenticada |
| Enfermera | `nurseId` | ID de la enfermera autenticada |

---

## 👩‍👧 Endpoints para Madre

### `POST /register` — Registrar un paciente

La madre registra a su hijo/a en el sistema.

**Reglas de negocio:**
- `motherId` se extrae del token (no se acepta del body)
- El paciente se crea con `status = ACTIVE`, `nurseId = null`, `facilityId = null`
- La fecha de nacimiento no puede ser futura
- Peso y talla deben ser mayores a cero

**Request body:**
```json
{
  "name": "Mateo",
  "lastName": "Perez",
  "birthDate": "2023-05-10",
  "gender": "MALE",
  "weight": 12.5,
  "height": 85
}
```

| Campo | Tipo | Requerido | Validación |
|---|---|---|---|
| `name` | string | ✅ | No vacío |
| `lastName` | string | ✅ | No vacío |
| `birthDate` | string | ✅ | Formato `YYYY-MM-DD`, no futura |
| `gender` | string | ✅ | `MALE` o `FEMALE` |
| `weight` | number | ✅ | > 0 (kg) |
| `height` | number | ✅ | > 0 (cm) |

**Response `201 Created`:**
```json
{ "message": "Patient registered successfully" }
```

**Errores `400`:**

| Error | Causa |
|---|---|
| `Mother ID no encontrado en el token` | Token inválido o sin claim `motherId` |
| `Birth date cannot be in the future` | Fecha de nacimiento posterior a hoy |
| `Weight must be greater than zero` | Peso ≤ 0 |
| `Height must be greater than zero` | Talla ≤ 0 |
| `Gender must be MALE or FEMALE` | Género inválido |

---

### `GET /my-patients` — Listar mis pacientes

Retorna todos los pacientes registrados por la madre autenticada (solo ID y nombre).

**Response `200 OK`:**
```json
{
  "motherId": "550e8400-e29b-41d4-a716-446655440000",
  "patients": [
    { "id": "660e8400-...", "name": "Mateo" },
    { "id": "660e8400-...", "name": "Valentina" }
  ]
}
```

**Errores `400`:**

| Error | Causa |
|---|---|
| `Mother ID no encontrado en el token` | Token inválido |

---

### `GET /{patientId}/hemoglobin-evolution` — Evolución de hemoglobina

Datos para renderizar un gráfico de líneas con la evolución del paciente.

**Reglas de negocio:**
- Verifica que el paciente pertenezca a la madre autenticada
- Los controles se ordenan por fecha ascendente
- Si no hay controles, `chart = []` y `currentHemoglobin = null`

**Path params:** `patientId` — ID del paciente

**Response `200 OK` (con datos):**
```json
{
  "currentHemoglobin": 11.2,
  "chart": [
    { "date": "2026-05-20T10:00:00.000Z", "hemoglobinLevel": 10.5 },
    { "date": "2026-05-22T10:00:00.000Z", "hemoglobinLevel": 11.2 }
  ]
}
```

**Response `200 OK` (sin datos):**
```json
{ "currentHemoglobin": null, "chart": [] }
```

**Errores `400`:**

| Error | Causa |
|---|---|
| `Patient not found` | El paciente no existe |
| `Access denied: This patient does not belong to you` | El paciente no es de esta madre |
| `Mother ID no encontrado en el token` | Token inválido |

---

## 👩‍⚕️ Endpoints para Enfermera

### `POST /assign-nurse` — Asignarse un paciente

La enfermera se asigna a un paciente sin enfermera previa.

**Reglas de negocio:**
- `nurseId` se extrae del token
- El paciente no debe tener enfermera ya asignada
- La enfermera debe estar asignada a un establecimiento

**Request body:**
```json
{ "patientId": "660e8400-e29b-41d4-a716-446655440001" }
```

**Response `200 OK`:**
```json
{ "message": "Patient assigned successfully" }
```

**Errores `400`:**

| Error | Causa |
|---|---|
| `Nurse ID no encontrado en el token` | Token inválido |
| `Patient not found` | El paciente no existe |
| `Patient already has an assigned nurse` | Ya tiene enfermera asignada |
| `Nurse is not assigned to any facility` | Enfermera sin establecimiento |

---

### `POST /medical-record` — Crear historia clínica

Crea la historia clínica del paciente. Solo se puede crear una por paciente.

**Reglas de negocio:**
- El paciente debe estar asignado a esta enfermera
- No puede existir historia clínica previa
- `motivoConsulta` mínimo 5 caracteres
- `observaciones` es obligatorio

**Request body:**
```json
{
  "patientId": "660e8400-e29b-41d4-a716-446655440001",
  "weight": 12.5,
  "height": 85,
  "motivoConsulta": "Control de rutina y evaluación de crecimiento",
  "observaciones": "Paciente en buen estado general, activo, sin signos de alarma",
  "antecedentes": [
    { "type": "alergia", "description": "Penicilina" },
    { "type": "antecedente_familiar", "description": "Madre con anemia" }
  ],
  "sintomas": ["fiebre", "tos", "decaimiento"]
}
```

| Campo | Tipo | Requerido | Validación |
|---|---|---|---|
| `patientId` | string | ✅ | UUID válido |
| `weight` | number | ✅ | > 0 |
| `height` | number | ✅ | > 0 |
| `motivoConsulta` | string | ✅ | Mínimo 5 caracteres |
| `observaciones` | string | ✅ | No vacío |
| `antecedentes` | array | ❌ | — |
| `antecedentes[].type` | string | ✅ si hay | No vacío |
| `antecedentes[].description` | string | ✅ si hay | No vacío |
| `sintomas` | array | ❌ | — |

**Response `201 Created`:**
```json
{ "message": "Medical record created successfully" }
```

**Errores `400`:**

| Error | Causa |
|---|---|
| `Nurse ID no encontrado en el token` | Token inválido |
| `Patient not found` | El paciente no existe |
| `Medical record already exists` | Ya existe historia clínica |
| `Access denied: This patient is not assigned to you` | Paciente no asignado a esta enfermera |
| `Consultation reason must contain at least 5 characters` | `motivoConsulta` muy corto |
| `Observations cannot be empty` | `observaciones` vacío |
| `Antecedent type is required` | Tipo de antecedente vacío |
| `Antecedent description is required` | Descripción de antecedente vacía |

---
### `GET /{patientId}/medical-record/check` — Verificar si tiene historia clínica

Verifica si un paciente ya tiene una historia clínica registrada. Este endpoint es útil para validar si se puede registrar un control de hemoglobina.

**Reglas de negocio:**
- El paciente debe estar asignado a esta enfermera
- Retorna `hasMedicalRecord: true` si existe historia clínica
- Retorna `hasMedicalRecord: false` si no existe
- Si existe, también retorna el `medicalRecordId`

**Path params:**
| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| `patientId` | string | ✅ | ID del paciente |

**Response `200 OK` (con historia clínica):**
```json
{
  "patientId": "0c311ed8-ac1e-43d3-ba9c-d07518c23912",
  "hasMedicalRecord": true,
  "medicalRecordId": "880e8400-e29b-41d4-a716-446655440002"
}
```

**Response 200 OK (sin historia clínica):**
```json
{
  "patientId": "0c311ed8-ac1e-43d3-ba9c-d07518c23912",
  "hasMedicalRecord": false
}
```        
| Error | Causa |
|---|--|
| `Nurse ID no encontrado en el token` | Token inválido |
| `Patient not found` | El paciente no existe |
| `Access denied: This patient is not assigned to you` | Paciente no asignado a esta enfermera |

**Uso en Frontend:**

Este endpoint debe llamarse antes de mostrar el formulario de registro de hemoglobina. Si hasMedicalRecord es false, se debe mostrar un mensaje indicando que primero debe crearse la historia clínica.

Ejemplo de UI recomendado:

``` 
   ⚠️ ACCION REQUERIDA

Falta Historial Médico

Para registrar un control de hemoglobina, primero es necesario 
completar el historial médico del paciente.

[Registrar Historial Médico]
```            

**Uso práctico desde el Frontend**

```dart
// Ejemplo en Flutter (Ferova Clinic)
Future<void> checkAndRegisterHemoglobin(String patientId) async {
  try {
    // 1. Verificar si tiene historial médico
    final response = await http.get(
      Uri.parse('$baseUrl/patients/$patientId/medical-record/check'),
      headers: {'Authorization': 'Bearer $token'},
    );
    
    final data = jsonDecode(response.body);
    
    // 2. Si NO tiene historial, mostrar el frame
    if (!data['hasMedicalRecord']) {
      showDialog(
        context: context,
        builder: (_) => MedicalRecordRequiredDialog(
          patientId: patientId,
          onRegister: () => navigateToMedicalRecordForm(patientId),
        ),
      );
      return;
    }
    
    // 3. Si SÍ tiene, mostrar el formulario de hemoglobina
    navigateToHemoglobinForm(patientId, data['medicalRecordId']);
    
  } catch (e) {
    // Manejar error
    showError('Error al verificar el historial médico');
  }
}
```            

### `PUT /medical-record/update` — Actualizar historia clínica

Actualiza campos específicos de la historia clínica. Todos los campos son opcionales.

**Reglas de negocio:**
- El paciente debe estar asignado a esta enfermera
- Solo se actualizan los campos enviados
- `antecedentes: []` elimina todos los antecedentes
- `sintomas: []` elimina todos los síntomas

**Request body:**
```json
{
  "patientId": "660e8400-e29b-41d4-a716-446655440001",
  "weight": 13.2,
  "height": 88,
  "motivoConsulta": "Control de crecimiento y desarrollo",
  "observaciones": "Paciente con buen apetito, peso adecuado para la edad",
  "antecedentes": [{ "type": "alergia", "description": "Ninguna conocida" }],
  "sintomas": ["ninguno"]
}
```

| Campo | Tipo | Requerido |
|---|---|---|
| `patientId` | string | ✅ |
| `weight` | number | ❌ |
| `height` | number | ❌ |
| `motivoConsulta` | string | ❌ |
| `observaciones` | string | ❌ |
| `antecedentes` | array | ❌ |
| `sintomas` | array | ❌ |

**Response `200 OK`:**
```json
{ "message": "Medical record updated successfully" }
```

**Errores `400`:**

| Error | Causa |
|---|---|
| `Medical record not found` | No existe historia clínica |
| `Access denied: This patient is not assigned to you` | Paciente no asignado a esta enfermera |

---

### `POST /hemoglobin-control` — Registrar control de hemoglobina

Registra un nuevo control. El estado de anemia se calcula automáticamente.

**Reglas de negocio:**
- El paciente debe tener historia clínica creada
- El paciente debe estar asignado a esta enfermera
- `hemoglobinLevel` debe estar entre 0 y 30 g/dL

**Cálculo automático de anemia:**

| Resultado | Rango |
|---|---|
| `SEVERE` | < 7.0 |
| `MODERATE` | 7.0 – 8.9 |
| `MILD` | 9.0 – 10.9 |
| `CONTROLLED` | ≥ 11.0 |

**Request body:**
```json
{
  "patientId": "660e8400-e29b-41d4-a716-446655440001",
  "hemoglobinLevel": 11.2
}
```

**Response `200 OK`:**
```json
{ "message": "Hemoglobin control registered successfully" }
```

**Errores `400`:**

| Error | Causa |
|---|---|
| `Medical record not found` | Sin historia clínica |
| `Hemoglobin level must be between 0 and 30` | Nivel fuera de rango |
| `Access denied: This patient is not assigned to you` | Paciente no asignado |

---

### `PUT /discharge` — Dar de alta a un paciente

Cambia el `status` del paciente de `ACTIVE` a `DISCHARGED`.

**Reglas de negocio:**
- Solo la enfermera asignada al paciente puede dar el alta
- `nurseId` se extrae del token

**Request body:**
```json
{ "patientId": "660e8400-e29b-41d4-a716-446655440001" }
```

**Response `200 OK`:**
```json
{ "message": "Patient discharged successfully" }
```

**Errores `400`:**

| Error | Causa |
|---|---|
| `Patient not found` | El paciente no existe |
| `Only assigned nurse can discharge patient` | Enfermera no asignada a este paciente |

---

### `GET /nurse` — Listar pacientes asignados

Retorna solo los pacientes con `status = ACTIVE` asignados a la enfermera autenticada.

**Response `200 OK`:**
```json
[
  {
    "patientId": "660e8400-...",
    "fullName": "Mateo Perez",
    "gender": "MALE",
    "status": "ACTIVE",
    "facilityId": "770e8400-..."
  }
]
```

**Errores `400`:**

| Error | Causa |
|---|---|
| `Nurse ID no encontrado en el token` | Token inválido |

---

### `GET /discharge/nurse` — Pacientes elegibles para alta

Lista de pacientes activos asignados a la enfermera, disponibles para ser dados de alta (`status ≠ DISCHARGED`).

**Response `200 OK`:**
```json
[
  { "id": "660e8400-...", "name": "Mateo", "lastName": "Perez", "status": "ACTIVE" }
]
```

**Errores `400`:**

| Error | Causa |
|---|---|
| `Nurse ID no encontrado en el token` | Token inválido |

---

### `GET /{patientId}/medical-record` — Historia clínica completa

Retorna datos del paciente + historia clínica + controles.

**Reglas de negocio:**
- El paciente debe estar asignado a esta enfermera

**Path params:** `patientId`

**Response `200 OK`:**
```json
{
  "patient": {
    "id": "660e8400-...",
    "name": "Mateo",
    "lastName": "Perez",
    "birthDate": "2023-05-10T00:00:00.000Z",
    "gender": "MALE",
    "status": "ACTIVE"
  },
  "medicalRecord": {
    "id": "880e8400-...",
    "weight": 12.5,
    "height": 85,
    "hemoglobinLevel": 11.2,
    "motivoConsulta": "Control de rutina",
    "observaciones": "Paciente en buen estado general",
    "antecedentes": [{ "type": "alergia", "description": "Penicilina" }],
    "sintomas": ["fiebre", "tos"],
    "controls": [
      {
        "id": "990e8400-...",
        "date": "2026-05-22T10:00:00.000Z",
        "hemoglobinLevel": 11.2,
        "anemiaStatus": "CONTROLLED"
      }
    ],
    "createdAt": "2026-05-20T10:00:00.000Z",
    "updatedAt": "2026-05-22T10:00:00.000Z"
  }
}
```

**Errores `400`:**

| Error | Causa |
|---|---|
| `Medical record not found` | Sin historia clínica |
| `Access denied: This patient is not assigned to you` | Paciente no asignado |

---

### `GET /medical-record/{medicalRecordId}/controls` — Historial de controles

Controles de hemoglobina con estadísticas agregadas.

**Reglas de negocio:**
- La tendencia se calcula como: último nivel – primer nivel
    - `UP`: evolución > 0 (mejorando)
    - `DOWN`: evolución < 0 (empeorando)
    - `STABLE`: evolución = 0

**Path params:** `medicalRecordId`

**Response `200 OK` (con datos):**
```json
{
  "patientId": "660e8400-e29b-41d4-a716-446655440001",
  "patientName": "Mateo Perez",
  "controls": [
    { "id": "...", "date": "2026-05-20T10:00:00.000Z", "hemoglobinLevel": 10.5, "anemiaStatus": "MILD" },
    { "id": "...", "date": "2026-05-22T10:00:00.000Z", "hemoglobinLevel": 11.2, "anemiaStatus": "CONTROLLED" }
  ],
  "averageHemoglobin": 10.85,
  "totalControls": 2,
  "evolution": 0.7,
  "trend": "UP"
}
```

**Response `200 OK` (sin datos):**
```json
{
  "patientId": "660e8400-e29b-41d4-a716-446655440001",
  "patientName": "Mateo",
  "controls": [],
  "averageHemoglobin": 0,
  "totalControls": 0,
  "evolution": null,
  "trend": null
}
```

**Errores `400`:**

| Error | Causa |
|---|---|
| `Medical record not found` | No existe la historia clínica |
| `` | El paciente asociado no existe |
| `Access denied: This medical record does not belong to a patient assigned to you` | Sin acceso |

---

### `GET /medical-record/{medicalRecordId}/pdf` — Descargar historia clínica (PDF)

Genera y descarga la historia clínica completa en PDF.

**Path params:** `medicalRecordId`

**Response `200 OK`:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename=medical-record.pdf

[Archivo PDF binario]
```

**Errores `400`:**

| Error | Causa |
|---|---|
| `Medical record not found` | No existe la historia clínica |
| `Patient not found` | El paciente asociado no existe |

---

### `GET /medical-record/{medicalRecordId}/hemoglobin-report` — Reporte de hemoglobina (PDF)

Genera y descarga el reporte de evolución de hemoglobina en PDF.

**Path params:** `medicalRecordId`

**Response `200 OK`:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename=hemoglobin-report.pdf

[Archivo PDF binario]
```

**Errores `400`:**

| Error | Causa |
|---|---|
| `Medical record not found` | No existe la historia clínica |

---

### `GET /mother/search/{dni}` — Buscar madre por DNI

**Reglas de negocio:** El DNI debe tener exactamente 8 dígitos numéricos.

**Path params:** `dni` — 8 dígitos

**Response `200 OK`:**
```json
{
  "motherId": "550e8400-...",
  "fullName": "Diana Carrillo",
  "dni": "12345678"
}
```

**Errores `400`:**

| Error | Causa |
|---|---|
| `Mother not found` | No existe madre con ese DNI |

---

### `GET /mother/{motherId}` — Listar pacientes por madre

Lista todos los pacientes de una madre con su estado de asignación.

**Path params:** `motherId`

**Response `200 OK`:**
```json
[
  {
    "patientId": "660e8400-...",
    "patientName": "Mateo",
    "patientLastName": "Perez",
    "gender": "MALE",
    "status": "ACTIVE",
    "statusAssignment": "ASSIGNED"
  },
  {
    "patientId": "660e8400-...",
    "patientName": "Valentina",
    "patientLastName": "Gomez",
    "gender": "FEMALE",
    "status": "ACTIVE",
    "statusAssignment": "UNASSIGNED"
  }
]
```

| Campo | Valores posibles |
|---|---|
| `status` | `ACTIVE` · `DISCHARGED` |
| `statusAssignment` | `ASSIGNED` · `UNASSIGNED` |

---

### `GET /nurse/active-count` — Contar pacientes activos

Cuenta los pacientes con `status = ACTIVE` asignados a la enfermera.

**Response `200 OK`:**
```json
{
  "nurseId": "770e8400-...",
  "activePatientsCount": 5
}
```

**Errores `400`:**

| Error | Causa |
|---|---|
| `Nurse ID no encontrado en el token` | Token inválido |

---

## 🔓 Endpoint público

### `GET /{id}` — Información básica de un paciente

No requiere autenticación.

**Path params:** `id` — ID del paciente

**Response `200 OK`:**
```json
{ "id": "660e8400-...", "name": "Mateo", "lastName": "Perez" }
```

**Error `404`:**

| Error | Causa |
|---|---|
| `Patient not found` | No existe un paciente con ese ID |

---

## Reglas de negocio

| Regla | Detalle |
|---|---|
| Un paciente = una enfermera | Un paciente solo puede tener una enfermera asignada a la vez |
| Asignación múltiple por enfermera | Una enfermera puede tener múltiples pacientes asignados |
| Solo enfermera asignada puede dar alta | La enfermera asignada es la única que puede dar de alta al paciente |
| Historia clínica única | Un paciente solo puede tener una historia clínica |
| Asignación requerida para historia clínica | El paciente debe tener enfermera antes de crear historia clínica |
| Alta requiere asignación previa | Solo pacientes con enfermera asignada pueden ser dados de alta |
| Cálculo automático de anemia | El estado se calcula según el nivel de hemoglobina registrado |
| Fecha de nacimiento no futura | No se puede registrar paciente con fecha posterior a hoy |

---

## Códigos HTTP

| Código | Significado | Cuándo ocurre |
|---|---|---|
| `200` | OK | Operación exitosa (GET, PUT, POST exitosos) |
| `201` | Created | `POST /register`, `POST /medical-record` |
| `400` | Bad Request | Error de validación o regla de negocio violada |
| `401` | Unauthorized | Token no proporcionado o inválido |
| `403` | Forbidden | Rol incorrecto para el endpoint |
| `404` | Not Found | Recurso no encontrado |
| `500` | Internal Server Error | Error inesperado en el servidor |

---

## Notas para Frontend

### Endpoints por app

**Ferova Family (Kotlin)**

| Método | Endpoint |
|---|---|
| `POST` | `/register` |
| `GET` | `/my-patients` |
| `GET` | `/{patientId}/hemoglobin-evolution` |

**Ferova Clinic (Flutter)**

| Método | Endpoint |
|---|---|
| `POST` | `/assign-nurse` |
| `POST` | `/medical-record` |
| `PUT` | `/medical-record/update` |
| `POST` | `/hemoglobin-control` |
| `PUT` | `/discharge` |
| `GET` | `/nurse` |
| **`GET`** | **`/{patientId}/medical-record/check`** |
| `GET` | `/discharge/nurse` |
| `GET` | `/{patientId}/medical-record` |
| `GET` | `/medical-record/{medicalRecordId}/controls` |
| `GET` | `/medical-record/{medicalRecordId}/pdf` |
| `GET` | `/medical-record/{medicalRecordId}/hemoglobin-report` |
| `GET` | `/mother/search/{dni}` |
| `GET` | `/mother/{motherId}` |
| `GET` | `/nurse/active-count` |

### IDs que NO se envían (vienen del token)

| Endpoint | ID que NO enviar | Fuente |
|---|---|---|
| `POST /register` | `motherId` | Claim `motherId` del token |
| `POST /assign-nurse` | `nurseId` | Claim `nurseId` del token |
| `GET /nurse` | `nurseId` | Claim `nurseId` del token |
| `GET /discharge/nurse` | `nurseId` | Claim `nurseId` del token |
| `PUT /discharge` | `nurseId` | Claim `nurseId` del token |
| `GET /nurse/active-count` | `nurseId` | Claim `nurseId` del token |

### Recomendaciones de UI/UX

| Endpoint | Recomendación |
|---|---|
| `POST /register` | Usar date picker para `birthDate`. Validaciones en tiempo real. |
| `POST /hemoglobin-control` | Validar que el valor esté entre 0 y 30 antes de enviar. |
| `GET /{patientId}/hemoglobin-evolution` | Usar los datos para un gráfico de líneas (evolución temporal). |
| **`GET /{patientId}/medical-record/check`** | **Llamar antes de mostrar el formulario de hemoglobina. Si `hasMedicalRecord: false`, mostrar un frame con el mensaje "Falta Historial Médico" y un botón para redirigir al registro.** |
| `GET /medical-record/{id}/pdf` | Abrir en nueva pestaña o forzar descarga automática. |
| `GET /mother/search/{dni}` | Mostrar spinner mientras se busca. Validar 8 dígitos antes de disparar la request. |
| `PUT /discharge` | Mostrar diálogo de confirmación antes de enviar. |

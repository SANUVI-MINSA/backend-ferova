# Treatment Tracking — Bounded Context

> Gestión del seguimiento de tratamientos de suplementos nutricionales para pacientes pediátricos.

---

## ¿Qué hace este BC?

Permite a las **madres** confirmar dosis diarias de sus hijos y a las **enfermeras** monitorear adherencia y nivel de riesgo de cada paciente.

**Madres pueden:**
- Confirmar la dosis del día para su hijo/a
- Consultar la dosis programada para hoy
- Ver el historial de dosis (confirmadas y omitidas)

**Enfermeras pueden:**
- Iniciar, completar o abandonar tratamientos
- Ver pacientes sin tratamiento activo (pendientes)
- Visualizar pacientes por nivel de riesgo (ALTO, MEDIO, BAJO)
- Consultar detalles y métricas de adherencia por paciente

---

## Reglas de Negocio

| Regla | Detalle |
|-------|---------|
| Un tratamiento activo a la vez | Un paciente no puede tener dos tratamientos activos simultáneamente |
| Dosis generadas automáticamente | Al iniciar el tratamiento se crea una dosis por cada día de duración |
| Ventana de confirmación | La madre tiene **24 horas** para confirmar cada dosis (producción) |
| Omisión automática | Pasada la ventana, el sistema omite la dosis automáticamente |
| Impacto en riesgo por omisión | **+20 puntos** de riesgo |
| Impacto en riesgo por confirmación | **-10 puntos** de riesgo |
| Score mínimo / máximo | 0 — 100 |

### Niveles de Riesgo

| Nivel | Rango | Color |
|-------|-------|-------|
| 🔴 HIGH | > 70 | Rojo |
| 🟡 MEDIUM | 30 – 70 | Amarillo/Naranja |
| 🟢 LOW | < 30 | Verde |

### Cálculo de Adherencia

```
adherenceScore = (totalConfirmed / (totalConfirmed + totalOmitted)) * 100
```

---

## Autenticación

Todos los endpoints requieren **Bearer Token (JWT)**.

```
Authorization: Bearer <token>
Content-Type: application/json
```

| Rol | Claim en token | Endpoints accesibles |
|-----|----------------|----------------------|
| Enfermera | `nurseId` | Endpoints de enfermera |
| Madre | `motherId` | Endpoints de madre |

> El `nurseId` o `motherId` se extrae automáticamente del token. **No enviar en body ni en URL.**

---

## Base URL

```
/api/treatment-tracking
```

---

## Endpoints

### 👩‍⚕️ Enfermera

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/treatments` | Iniciar nuevo tratamiento |
| `PUT` | `/treatments/complete` | Marcar tratamiento como completado |
| `PUT` | `/treatments/abandon` | Marcar tratamiento como abandonado |
| `GET` | `/nurses/pending-patients` | Pacientes sin tratamiento activo |
| `GET` | `/risk-overview` | Resumen de pacientes por nivel de riesgo |
| `GET` | `/nurses/treatments` | Listar tratamientos de la enfermera |
| `GET` | `/treatments/:treatmentId` | Detalles de un tratamiento |
| `GET` | `/risk/:riskLevel/patients` | Pacientes filtrados por riesgo |
| `GET` | `/patients/:patientId/treatment-detail` | Detalle de tratamiento de un paciente |

### 👩‍👧 Madre

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/doses/confirm` | Confirmar dosis del día |
| `GET` | `/patients/:patientId/today-dose` | Obtener dosis de hoy |
| `GET` | `/patients/:patientId/dose-history` | Historial de dosis |

### 🔧 Sistema

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/doses/evaluate-missed` | Evaluar dosis pendiente (umbral 72h) |

### 🧪 Testing (solo desarrollo)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/test/doses/force-omit` | Forzar omisión de una dosis |

---

## Referencia de Endpoints

### `POST /treatments` — Iniciar tratamiento

**Body:**
```json
{
  "patientId": "uuid",
  "supplementName": "Vitamina C",
  "quantity": "500mg",
  "dosingHours": "8:00 AM",
  "durationDays": 5
}
```

**Response `201`:**
```json
{
  "message": "Treatment started successfully",
  "treatment": {
    "id": "uuid",
    "patientId": "uuid",
    "supplement": "Vitamina C",
    "quantity": "500mg",
    "dosingHours": "8:00 AM",
    "durationDays": 5,
    "status": "ACTIVE",
    "adherenceScore": 100,
    "riskScore": { "score": 10, "riskLevel": "LOW" }
  },
  "totalGeneratedDoses": 5
}
```

**Errores `400`:** `Patient not found` · `Patient already has an active treatment` · `Nurse ID no encontrado en el token`

---

### `POST /doses/confirm` — Confirmar dosis del día

**Body:**
```json
{ "patientId": "uuid" }
```

**Response `200`:**
```json
{
  "message": "Dose confirmed successfully",
  "dose": {
    "id": "uuid",
    "scheduledDate": "2026-05-22T02:14:58.079Z",
    "status": "CONFIRMED",
    "confirmedAt": "2026-05-22T15:30:00.000Z"
  },
  "treatment": {
    "id": "uuid",
    "adherenceScore": 100,
    "riskScore": { "score": 0, "riskLevel": "LOW" }
  }
}
```

**Errores `400`:** `Patient not found` · `Mother is not assigned to this patient` · `Patient does not have an active treatment` · `No pending dose found for today` · `Today's dose is already confirmed or omitted`

---

### `GET /patients/:patientId/today-dose` — Dosis de hoy

**Response `200`:**
```json
{
  "patientId": "uuid",
  "treatmentId": "uuid",
  "dailyDoseId": "uuid",
  "scheduledDate": "2026-05-22T02:14:58.079Z",
  "status": "PENDING",
  "canConfirm": true
}
```

> `canConfirm` es `true` solo cuando `status = PENDING`.

**Casos especiales:**
```json
{ "canConfirm": false, "message": "Register your patient first" }
{ "canConfirm": false, "message": "Treatment has not started yet" }
{ "canConfirm": false, "message": "No scheduled dose for today" }
```

---

### `GET /patients/:patientId/dose-history` — Historial de dosis

**Response `200`:**
```json
{
  "patientId": "uuid",
  "patientName": "Irini Baca",
  "supplementName": "Vitamina C",
  "quantity": "500mg",
  "dosingHours": "8:00 AM",
  "doses": [
    {
      "id": "uuid",
      "treatmentId": "uuid",
      "scheduledDate": "2026-05-21T02:14:58.079Z",
      "confirmedAt": null,
      "status": "OMITTED",
      "hoursWithoutConfirmation": 48
    }
  ]
}
```

> Las dosis `PENDING` (futuras) **no** aparecen en este historial.

---

### `GET /nurses/pending-patients` — Pacientes sin tratamiento activo

**Response `200`:**
```json
{
  "nurseId": "uuid",
  "hasPatientsAssigned": true,
  "hasPendingPatients": true,
  "pendingPatients": [
    { "patientId": "uuid", "patientName": "Irini Baca" }
  ]
}
```

---

### `GET /risk-overview` — Resumen de riesgo

**Response `200`:**
```json
{
  "summary": {
    "HIGH":   { "count": 2, "description": "score mayor de 70" },
    "MEDIUM": { "count": 5, "description": "score entre 30 y 70" },
    "LOW":    { "count": 8, "description": "score menor de 30" },
    "total": 15
  }
}
```

---

### `GET /risk/:riskLevel/patients` — Pacientes por nivel de riesgo

`:riskLevel` → `HIGH` | `MEDIUM` | `LOW`

**Response `200`:**
```json
{
  "riskLevel": "MEDIUM",
  "total": 2,
  "patients": [
    {
      "patientId": "uuid",
      "patientName": "Irini Baca",
      "patientAge": 3,
      "score": 50,
      "hoursWithoutConfirmation": 24
    }
  ]
}
```

**Interpretación de `hoursWithoutConfirmation`:**

| Valor | Significado | Qué mostrar |
|-------|-------------|-------------|
| `+24`, `+48` | Dosis pendiente con retraso | "Dosis atrasada por X horas" |
| `0` | Dosis justo a tiempo | "Dosis pendiente para hoy" |
| `-24` | Dosis en el futuro | "Próxima dosis en X horas" |
| `null` | Sin dosis pendientes | "Sin dosis pendientes" |

---

### `GET /patients/:patientId/treatment-detail` — Detalle de tratamiento

**Response `200`:**
```json
{
  "patientId": "uuid",
  "patientName": "Irini Baca",
  "riskLevel": "MEDIUM",
  "score": 50,
  "adherenceScore": 85.5,
  "totalConfirmed": 17,
  "totalOmitted": 3,
  "treatment": {
    "supplementName": "Vitamina C",
    "quantity": "500mg",
    "dosingHours": "8:00 AM",
    "durationDays": 30,
    "startDate": "2026-05-01T02:14:58.079Z",
    "endDate": "2026-05-31T02:14:58.079Z"
  }
}
```

**Errores `400`:** `Patient not found` · `Access denied: This patient is not assigned to you`

---

### `PUT /treatments/complete` — Completar tratamiento

**Body:**
```json
{ "treatmentId": "uuid", "observation": "Texto opcional" }
```

**Response `200`:**
```json
{
  "message": "Treatment completed successfully",
  "treatment": { "id": "uuid", "status": "COMPLETED", "completionObservation": "..." }
}
```

---

### `PUT /treatments/abandon` — Abandonar tratamiento

**Body:**
```json
{ "treatmentId": "uuid", "observation": "Texto opcional" }
```

**Response `200`:**
```json
{
  "message": "Treatment marked as abandoned successfully. All associated doses have been removed.",
  "treatment": { "id": "uuid", "status": "ABANDONED", "abandonmentObservation": "..." }
}
```

> ⚠️ Al abandonar un tratamiento, **todas las dosis asociadas se eliminan físicamente** de la base de datos.

---

### `POST /doses/evaluate-missed` — Evaluar dosis omitida (Sistema)

Solo omite la dosis si tiene **≥ 72 horas** de retraso.

**Body:**
```json
{ "dailyDoseId": "uuid" }
```

**Response `200` — Dosis omitida:**
```json
{ "message": "Missed dose evaluated successfully", "hoursWithoutConfirmation": 72, "dose": { "id": "uuid", "status": "OMITTED" } }
```

**Response `200` — Dentro del umbral:**
```json
{ "message": "Dose still within allowed confirmation window", "hoursWithoutConfirmation": 48 }
```

**Response `200` — Ya procesada:**
```json
{ "message": "Dose already processed" }
```

---

## Flujos Principales

### Flujo de la Madre (App Ferova Family)

```
1. Abre la app → elige a su hijo
2. GET /patients/{patientId}/today-dose
3. Si canConfirm = true → muestra botón "Confirmar dosis"
4. POST /doses/confirm
5. GET /patients/{patientId}/dose-history  →  actualiza historial
```

### Flujo de la Enfermera (App Ferova Clinic)

```
1. Abre la app → bandeja principal
2. GET /risk-overview                          →  resumen general
3. GET /risk/HIGH/patients                     →  pacientes críticos
4. GET /patients/{patientId}/treatment-detail  →  detalle del paciente
5. POST /treatments | PUT /treatments/complete | PUT /treatments/abandon
```

---

## Configuración por Entorno

| Entorno | Umbral de omisión | Endpoint force-omit |
|---------|-------------------|---------------------|
| Desarrollo | 1 minuto | ✅ Disponible |
| Producción | 24 horas | ❌ No disponible |

Variable de entorno opcional (desarrollo):
```
DEV_OMISSION_MINUTES=5
```

---

## Códigos HTTP

| Código | Significado |
|--------|-------------|
| `200` | OK — Operación exitosa |
| `201` | Created — Tratamiento creado |
| `400` | Bad Request — Error de validación o regla de negocio |
| `401` | Unauthorized — Token no proporcionado o inválido |
| `403` | Forbidden — Rol incorrecto para el endpoint |
| `404` | Not Found — Recurso no encontrado |
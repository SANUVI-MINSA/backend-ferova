# Achievements & Rewards — Bounded Context

> **Contexto:** Gamificación del tratamiento de anemia en Ferova Family.
> Motiva a la madre a mantener la constancia mediante recompensas digitales.

---

## ¿Quién puede usar este BC?

| Rol | Acceso |
|-----|--------|
| **Madre** (`MOTHER`) | ✅ Acceso completo |
| **Enfermera** | ❌ Sin acceso |

### La madre puede:
- Ver su progreso (puntos, racha actual, mejor racha)
- Visualizar las medallas disponibles y su avance
- Seguir el progreso hacia cada medalla con barras de avance
- Recibir notificaciones al desbloquear una medalla *(pendiente de implementar)*

---

## Autenticación

Todos los endpoints requieren un **Bearer Token (JWT)** con rol `MOTHER`.

```
Authorization: Bearer <token>
Content-Type: application/json
```

> ⚠️ El `motherId` se extrae automáticamente del token. **No enviarlo en la URL ni en el body.**

---

## Base URL

```
/api/achievements-rewards
```

---

## Resumen de Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/patients/:patientId/achievement` | Progreso del tratamiento (puntos, rachas) |
| `GET` | `/patients/:patientId/badges` | Todas las medallas con su progreso |

---

## Endpoints Detallados

### 1. `GET /patients/:patientId/achievement`

Obtiene el resumen del progreso de la madre: puntos acumulados, racha actual y mejor racha histórica.

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `patientId` | `string` | ID del paciente (hijo/a) |

#### Response `200 OK`

```json
{
  "patientId": "uuid",
  "patientName": "Mateo Pérez",
  "status": "ACTIVE",
  "totalPoints": 70,
  "currentStreak": 7,
  "longestStreak": 30
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `patientId` | `string` | ID del paciente |
| `patientName` | `string` | Nombre completo del paciente |
| `status` | `string` | `ACTIVE`, `COMPLETED` o `ABANDONED` |
| `totalPoints` | `number` | Puntos totales acumulados |
| `currentStreak` | `number` | Racha actual de días consecutivos |
| `longestStreak` | `number` | Mejor racha histórica |

#### Errores `400`

| Error | Significado |
|-------|-------------|
| `Patient not found` | El paciente no existe |
| `Access denied: This patient is not assigned to you` | La madre no tiene este paciente asignado |
| `Mother ID not found in token` | Token inválido o sin `motherId` |

---

### 2. `GET /patients/:patientId/badges`

Obtiene la lista completa de medallas, su estado (desbloqueada o bloqueada) y el progreso hacia cada una.

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `patientId` | `string` | ID del paciente (hijo/a) |

#### Response `200 OK`

```json
{
  "patientId": "uuid",
  "patientName": "Mateo Pérez",
  "badges": [
    {
      "id": "uuid",
      "type": "FIRST_WEEK",
      "name": "Primera semana",
      "description": "Completaste 7 días consecutivos sin fallar",
      "milestone": 7,
      "isUnlocked": true,
      "unlockedAt": "2026-05-22T02:14:58.079Z",
      "progress": 100,
      "daysNeeded": 0
    },
    {
      "id": "uuid",
      "type": "HALF_TREATMENT",
      "name": "Mitad del tratamiento",
      "description": "Alcanzaste la mitad del tratamiento (15 días consecutivos)",
      "milestone": 15,
      "isUnlocked": false,
      "unlockedAt": null,
      "progress": 53,
      "daysNeeded": 7
    },
    {
      "id": "uuid",
      "type": "TREATMENT_COMPLETED",
      "name": "Tratamiento completado",
      "description": "Completaste el tratamiento completo de 30 días",
      "milestone": 30,
      "isUnlocked": false,
      "unlockedAt": null,
      "progress": 0,
      "daysNeeded": 30
    }
  ]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` | ID único de la medalla |
| `type` | `string` | `FIRST_WEEK`, `HALF_TREATMENT`, `TREATMENT_COMPLETED` |
| `name` | `string` | Nombre legible de la medalla |
| `description` | `string` | Descripción del requisito para desbloquear |
| `milestone` | `number` | Días consecutivos necesarios para desbloquear |
| `isUnlocked` | `boolean` | `true` si ya está desbloqueada |
| `unlockedAt` | `string (ISO date)` | Fecha de desbloqueo (`null` si no desbloqueada) |
| `progress` | `number` | Porcentaje de avance (0–100) |
| `daysNeeded` | `number` | Días restantes para desbloquear (0 si ya desbloqueada) |

#### Medallas según duración del tratamiento

| Duración | Badges creadas | Milestones |
|----------|----------------|------------|
| 7 días | `FIRST_WEEK` + `TREATMENT_COMPLETED` | 7, 7 |
| 15 días | `FIRST_WEEK` + `TREATMENT_COMPLETED` | 7, 15 |
| 30 días | `FIRST_WEEK` + `HALF_TREATMENT` + `TREATMENT_COMPLETED` | 7, 15, 30 |
| 45 días | `FIRST_WEEK` + `HALF_TREATMENT` + `TREATMENT_COMPLETED` | 7, 23, 45 |
| 60 días | `FIRST_WEEK` + `HALF_TREATMENT` + `TREATMENT_COMPLETED` | 7, 30, 60 |

#### Cálculo de progreso

El progreso de cada medalla se calcula **de forma independiente** según la racha actual:

```
progress   = min(100, floor((currentStreak / milestone) * 100))
daysNeeded = max(0, milestone - currentStreak)
```

**Ejemplo** — tratamiento de 30 días, racha actual = 10 días:

| Medalla | Milestone | Progreso | Días restantes |
|---------|-----------|----------|----------------|
| `FIRST_WEEK` | 7 | 100% ✅ | 0 |
| `HALF_TREATMENT` | 15 | 66% | 5 |
| `TREATMENT_COMPLETED` | 30 | 33% | 20 |

#### Errores `400`

| Error | Significado |
|-------|-------------|
| `Patient not found` | El paciente no existe |
| `Access denied: This patient is not assigned to you` | La madre no tiene este paciente asignado |
| `Mother ID not found in token` | Token inválido o sin `motherId` |

---

## Reglas de Negocio

| Acción | Efecto en puntos | Efecto en racha |
|--------|-----------------|-----------------|
| Confirmar una dosis | **+10 puntos** | Racha +1 |
| Omitir una dosis | Sin cambio | **Racha se reinicia a 0** |
| Completar el tratamiento | **+50 puntos (bonus)** | — |

> - Las medallas se desbloquean **independientemente** según la racha alcanzada.
> - Las medallas ya desbloqueadas **nunca se pierden**, aunque la racha se reinicie.
> - No se pierden puntos al omitir una dosis.

---

## Arquitectura y Eventos

### Eventos que consume (desde Treatment Tracking BC)

| Evento | Qué hace Achievements |
|--------|-----------------------|
| `TreatmentStarted` | Crea un nuevo Achievement y genera las Badges según la duración |
| `DailyDoseConfirmed` | +10 puntos, racha +1, evalúa desbloqueo de medallas |
| `DailyDoseOmitted` | Reinicia racha a 0 (no pierde puntos) |
| `TreatmentCompleted` | Marca Achievement como `COMPLETED`, otorga +50 puntos bonus |
| `TreatmentAbandoned` | Marca Achievement como `ABANDONED` |

### Eventos que emite *(pendientes de implementar)*

| Evento | Cuándo se emite | Posible consumidor |
|--------|-----------------|--------------------|
| `BadgeUnlocked` | Al desbloquear una nueva medalla | Communication (push notifications) |
| `PointsEarned` | Al sumar puntos | Analytics |
| `StreakMilestoneReached` | Al alcanzar un hito de racha | Communication |

---

## Flujo Completo

```
1. Enfermera inicia tratamiento (ej: 30 días)
   ↓
2. Achievements BC recibe evento TreatmentStarted
   ↓
3. Se crea Achievement (puntos=0, racha=0, status=ACTIVE)
   ↓
4. Se generan las Badges según duración:
   - FIRST_WEEK        (milestone = 7)
   - HALF_TREATMENT    (milestone = 15)
   - TREATMENT_COMPLETED (milestone = 30)
   ↓
5. Madre confirma dosis → evento DailyDoseConfirmed
   ↓
6. Achievement actualiza: puntos +10, racha +1
   ↓
7. Se evalúa si la racha alcanza algún milestone
   ↓
8. Si alcanza → Badge se desbloquea → se guarda unlockedAt
   ↓
9. Madre ve en su app la nueva medalla desbloqueada 🎖️
```

---

## Progreso por días (Tratamiento 30 días)

| Días de racha | FIRST_WEEK | HALF_TREATMENT | TREATMENT_COMPLETED |
|---------------|------------|----------------|---------------------|
| 1 día | 14% | 0% | 0% |
| 7 días | **100% ✅** | 0% | 0% |
| 10 días | 100% | 66% | 33% |
| 15 días | 100% | **100% ✅** | 50% |
| 20 días | 100% | 100% | 66% |
| 30 días | 100% | 100% | **100% ✅** |

---

## UI Sugerida para Frontend

### Tarjeta de progreso principal

```
┌─────────────────────────────────┐
│  Estado de salud: ACTIVO        │
│  Puntos Totales: 70             │
│  Racha actual:   7 días         │
│  Más larga:      30 días        │
└─────────────────────────────────┘
```

### Tarjetas de medallas

```
┌──────────────────────────────────────┐
│  🏅 First Week                       │
│  Completa los 7 días sin fallar      │
│  ██████████ 100%                     │
│  ✅ Desbloqueada el 22/05/2026       │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  🏅 Half Treatment                   │
│  Completa la mitad del tratamiento   │
│  █████░░░░░ 66%                      │
│  Te faltan 5 días                    │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  🏅 Treatment Completed              │
│  Completa el tratamiento completo    │
│  ███░░░░░░░ 33%                      │
│  Te faltan 20 días                   │
└──────────────────────────────────────┘
```

---

## Endpoints de Prueba *(Solo Desarrollo)*

Disponibles únicamente al correr `npm run dev`.

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/test/force-evaluate-badges/:patientId` | Fuerza evaluación de badges según racha actual |
| `POST` | `/api/test/doses/force-confirm` | Fuerza confirmación de dosis (sin validar fechas) |
| `POST` | `/api/test/doses/force-omit` | Fuerza omisión de dosis (sin validar fechas) |

---

## Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| `200` | OK — Operación exitosa |
| `400` | Bad Request — Error de validación |
| `401` | Unauthorized — Token no proporcionado o inválido |
| `403` | Forbidden — Rol incorrecto (se requiere `MOTHER`) |
| `404` | Not Found — Recurso no encontrado |
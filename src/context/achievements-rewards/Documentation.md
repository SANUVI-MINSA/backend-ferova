# Achievements & Rewards — Bounded Context

## Contexto: Gamificación del Tratamiento

El Bounded Context de **Achievements & Rewards** gestiona la **gamificación del tratamiento de anemia** dentro de Ferova Family. Su propósito es motivar a la madre a mantener la constancia en el tratamiento mediante recompensas digitales.

### ¿Qué puede hacer la madre?
- Ver el progreso de su tratamiento (puntos acumulados, racha actual, mejor racha)
- Visualizar las medallas que puede desbloquear (_First Week_, _First Month_, _Half Treatment_, _Treatment Completed_)
- Seguir el progreso hacia cada medalla con barras de avance
- Recibir notificaciones al desbloquear una nueva medalla (aun no se toma en cuenta)

### ¿Qué puede hacer la enfermera?
> ❌ **NADA** — Este BC es exclusivo para Ferova Family (madres). Las enfermeras no tienen acceso a esta información.

### Reglas de negocio importantes
- Las medallas se desbloquean **en orden secuencial** (primero First Week, luego First Month, etc.)
- Cada medalla requiere una **racha consecutiva de días sin fallar**
- Al confirmar una dosis: **+10 puntos** y aumenta la racha
- Al omitir una dosis: **la racha se reinicia a 0**, pero NO se pierden puntos
- Al completar el tratamiento: **+50 puntos de bonus**
- Las medallas ya desbloqueadas **NUNCA se pierden**, aunque la racha se reinicie

---

## ⚠️ Autenticación

Todos los endpoints requieren autenticación mediante **Bearer Token (JWT)**.

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Rol requerido:** `MOTHER` (madre)

> El `motherId` se extrae automáticamente del token. **No enviar motherId en la URL ni en el body.**

---

## Base URL

```
/api/achievements-rewards
```

---

## Resumen de Endpoints

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| `GET` | `/patients/:patientId/achievement` | Obtener progreso del tratamiento (puntos, rachas) | Madre |
| `GET` | `/patients/:patientId/badges` | Obtener todas las medallas con su progreso | Madre |

---

## Endpoints Detallados

### 1. Obtener progreso del tratamiento

**`GET /patients/:patientId/achievement`**

La madre obtiene el resumen de su progreso en el tratamiento: puntos acumulados, racha actual y mejor racha histórica.

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `patientId` | `string` | ID del paciente (hijo/a) |

> El `motherId` se extrae automáticamente del token JWT.

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

### 2. Obtener medallas del paciente

**`GET /patients/:patientId/badges`**

La madre obtiene la lista completa de medallas, su estado (desbloqueada o bloqueada) y el progreso hacia cada una.

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `patientId` | `string` | ID del paciente (hijo/a) |

> El `motherId` se extrae automáticamente del token JWT.

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
      "type": "FIRST_MONTH",
      "name": "Primer mes",
      "description": "Completaste 30 días consecutivos sin fallar",
      "milestone": 30,
      "isUnlocked": false,
      "unlockedAt": null,
      "progress": 23,
      "daysNeeded": 23
    },
    {
      "id": "uuid",
      "type": "HALF_TREATMENT",
      "name": "Mitad del tratamiento",
      "description": "Alcanzaste la mitad del tratamiento (45 días consecutivos)",
      "milestone": 45,
      "isUnlocked": false,
      "unlockedAt": null,
      "progress": 0,
      "daysNeeded": 45
    },
    {
      "id": "uuid",
      "type": "TREATMENT_COMPLETED",
      "name": "Tratamiento completado",
      "description": "Completaste el tratamiento completo de 90 días",
      "milestone": 90,
      "isUnlocked": false,
      "unlockedAt": null,
      "progress": 0,
      "daysNeeded": 90
    }
  ]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` | ID único de la medalla |
| `type` | `string` | `FIRST_WEEK`, `FIRST_MONTH`, `HALF_TREATMENT`, `TREATMENT_COMPLETED` |
| `name` | `string` | Nombre legible de la medalla |
| `description` | `string` | Descripción de lo que se necesita para desbloquear |
| `milestone` | `number` | Días totales necesarios para desbloquear |
| `isUnlocked` | `boolean` | `true` si ya está desbloqueada |
| `unlockedAt` | `string (ISO date)` | Fecha de desbloqueo (`null` si no desbloqueada) |
| `progress` | `number` | Porcentaje de avance (0–100) |
| `daysNeeded` | `number` | Días restantes para desbloquear (`0` si ya desbloqueada) |

#### Orden de las medallas

Las medallas se muestran en este orden:

| Posición | Medalla | Milestone |
|----------|---------|-----------|
| 1 | `FIRST_WEEK` | 7 días |
| 2 | `FIRST_MONTH` | 30 días |
| 3 | `HALF_TREATMENT` | Mitad del tratamiento |
| 4 | `TREATMENT_COMPLETED` | Duración total del tratamiento |

#### Progreso Secuencial

Las medallas se desbloquean en orden. El progreso se calcula así:

- **Medallas anteriores** a la activa → `progress = 100`, `daysNeeded = 0`
- **Medalla activa** (primera sin desbloquear) → progreso calculado desde el milestone anterior
- **Medallas futuras** → `progress = 0`, `daysNeeded = milestone`

**Ejemplo con tratamiento de 90 días y racha actual = 15 días:**

| Medalla | Progreso | Cálculo |
|---------|----------|---------|
| `FIRST_WEEK` | 100% ✅ | Ya desbloqueada (7/7) |
| `FIRST_MONTH` | 34% | (15-7) / (30-7) = 8/23 |
| `HALF_TREATMENT` | 0% | Aún no activa |
| `TREATMENT_COMPLETED` | 0% | Aún no activa |

#### Errores `400`

| Error | Significado |
|-------|-------------|
| `Patient not found` | El paciente no existe |
| `Access denied: This patient is not assigned to you` | La madre no tiene este paciente asignado |
| `Mother ID not found in token` | Token inválido o sin `motherId` |

---

## 🧠 Arquitectura y Eventos

### Eventos que consume del BC Treatment Tracking

| Evento | Qué hace Achievements |
|--------|-----------------------|
| `TreatmentStarted` | Crea un nuevo `Achievement` y genera las `Badges` según la duración del tratamiento |
| `DailyDoseConfirmed` | Suma +10 puntos, aumenta la racha, evalúa si se desbloquean nuevas medallas |
| `DailyDoseOmitted` | Reinicia la racha actual a 0 (NO pierde puntos) |
| `TreatmentCompleted` | Marca el `Achievement` como `COMPLETED`, otorga +50 puntos de bonus |
| `TreatmentAbandoned` | Marca el `Achievement` como `ABANDONED` |

### Eventos que emite (para otros BCs)

Posibilidad aun esta en decision problamente no se haga

| Evento | Cuándo se emite | Consumidor potencial                                         |
|--------|-----------------|--------------------------------------------------------------|
| `BadgeUnlocked` | Cuando se desbloquea una nueva medalla | Communication (notificaciones push) -> aun no se complementa |
| `PointsEarned` | Cuando se suman puntos (confirmación o bonus) | Analytics                                                    |
| `StreakMilestoneReached` | Cuando se alcanza un hito de racha (7, 30, etc.) | Communication                                                |

---

## 🔄 Flujo Completo

```
1. Enfermera inicia tratamiento (70 días)
   ↓
2. Achievements BC recibe evento TreatmentStarted
   ↓
3. Se crea Achievement (puntos=0, racha=0, status=ACTIVE)
   ↓
4. Se generan las Badges según duración:
   - FIRST_WEEK         (milestone = 7)
   - FIRST_MONTH        (milestone = 30)
   - HALF_TREATMENT     (milestone = 35)
   - TREATMENT_COMPLETED (milestone = 70)
   ↓
5. Madre confirma dosis → evento DailyDoseConfirmed
   ↓
6. Achievement actualiza: puntos +10, racha +1
   ↓
7. Se evalúa si la racha alcanza algún milestone
   ↓
8. Si alcanza → Badge se desbloquea → evento BadgeUnlocked
   ↓
9. Madre ve en su app la nueva medalla desbloqueada
```

---

## 📊 Ejemplos de Progreso (Tratamiento de 90 días)

| Días de racha | FIRST_WEEK | FIRST_MONTH | HALF_TREATMENT | TREATMENT_COMPLETED |
|---------------|-----------|-------------|----------------|---------------------|
| 1 día | 14% | 0% | 0% | 0% |
| 7 días | 100% ✅ | 0% | 0% | 0% |
| 15 días | 100% | 34% | 0% | 0% |
| 30 días | 100% | 100% ✅ | 0% | 0% |
| 38 días | 100% | 100% | 53% | 0% |
| 45 días | 100% | 100% | 100% ✅ | 0% |
| 60 días | 100% | 100% | 100% | 33% |
| 90 días | 100% | 100% | 100% | 100% ✅ |

---

## 🎨 UI Sugerida para Frontend

### Tarjeta de Progreso Principal

```
┌─────────────────────────────────┐
│  Estado de salud: ACTIVO        │
│  Puntos Totales: 70             │
│  Racha actual: 7 días           │
│  Más larga: 30 días             │
└─────────────────────────────────┘
```

### Sección de Medallas

```
┌─────────────────────────────────┐
│  🏅 First Week                  │
│  Completa los 7 días sin fallar │
│  ▓▓▓▓▓▓▓▓▓▓ 100%               │
│  ✅ Desbloqueada el 22/05/2026  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  🏅 First Month                 │
│  Completa los 30 días sin fallar│
│  ▓▓▓▓▓░░░░░ 53%                 │
│  Te faltan 14 días              │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  🏅 Half Treatment              │
│  Completa la mitad del tratamiento│
│  ░░░░░░░░░░ 0%                  │
│  Necesitas 45 días consecutivos │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  🏅 Treatment Completed         │
│  Completa el tratamiento completo│
│  ░░░░░░░░░░ 0%                  │
│  Necesitas 90 días consecutivos │
└─────────────────────────────────┘
```

---

## Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| `200` | OK — Operación exitosa |
| `400` | Bad Request — Error de validación |
| `401` | Unauthorized — Token no proporcionado o inválido |
| `403` | Forbidden — Rol incorrecto (se requiere madre) |
| `404` | Not Found — Recurso no encontrado |

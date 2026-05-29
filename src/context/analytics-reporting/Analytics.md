# Analytics — Bounded Context

> Monitoreo y visualización de métricas de adherencia en postas médicas.

---

## ¿Quién puede usar este BC?

| Rol | Acceso |
|---|---|
| Administrador (ADMIN) | ✅ Acceso completo |
| Enfermera | ❌ Sin acceso |
| Madre | ❌ Sin acceso |

---

## Autenticación

Todos los endpoints requieren un **Bearer Token (JWT)** con rol `ADMIN`.

```
Authorization: Bearer <token>
Content-Type: application/json
```

> ⚠️ Solo usuarios con rol `ADMIN` pueden acceder. Cualquier otro rol recibirá `403 Forbidden`.

---

## Base URL

```
/api/analytics
```

---

## Reglas de Negocio

### Cálculo de Adherencia

```
adherenceRate = (totalConfirmed / (totalConfirmed + totalOmitted)) * 100
```
### Arquitectura y Eventos

| BC | Recurso utilizado | Propósito | 
|---|---|---|
| Treatment Tracking | `TreatmentRepository` | Obtener tratamientos activos y dosis | 
| Healthy Facility | `NurseAssignmentRepository` | Relacionar enfermeras con postas |
| Healthy Facility | `HealthFacilityRepository` | Obtener datos geográficos de postas |


### Niveles de Riesgo

| Etiqueta UI | Valor API | Criterio | Color |
|---|---|---|---|
| Bien | `LOW` | Adherencia ≥ 70% | 🟢 Verde |
| Moderado | `MEDIUM` | Adherencia entre 40% y 69% | 🟡 Naranja |
| Crítico | `HIGH` | Adherencia < 40% | 🔴 Rojo |

### Mapeo Filtros UI → API

| Chip UI | Query param |
|---|---|
| "Todas" | *(sin parámetro)* |
| "Crítico" | `riskLevel=HIGH` |
| "Moderado" | `riskLevel=MEDIUM` |
| "Bien" | `riskLevel=LOW` |

### Posta Activa

Una posta es activa si tiene **al menos un tratamiento con estado `ACTIVE`**.

---

## Endpoints — Resumen

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/dashboard/summary` | Resumen global del dashboard |
| GET | `/facilities` | Lista de postas con métricas (filtrable) |
| GET | `/facilities/top` | Top 4 postas con mayor adherencia |
| GET | `/heatmap` | Puntos geográficos para mapa interactivo (filtrable) |
| GET | `/report/pdf` | Descarga de reporte PDF completo |

---

## Endpoints — Detalle

### GET `/dashboard/summary`

Obtiene el resumen global del dashboard con métricas agregadas de todas las postas activas.

**Response 200 OK**

```json
{
  "totalActiveFacilities": 4,
  "totalCriticalFacilities": 2,
  "globalAdherenceRate": 54.25
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `totalActiveFacilities` | number | Postas con al menos un tratamiento activo |
| `totalCriticalFacilities` | number | Postas con `riskLevel = HIGH` |
| `globalAdherenceRate` | number | Promedio de adherencia global (0–100) |

---

### GET `/facilities`

Lista completa de postas activas con sus métricas. Soporta filtro por nivel de riesgo.

**Query Parameters**

| Parámetro | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `riskLevel` | string | No | `LOW` \| `MEDIUM` \| `HIGH` |

**Response 200 OK**

```json
{
  "facilities": [
    {
      "facilityId": "65f8a3b2c1d4e5f6a7b8c9d0",
      "facilityName": "Posta Canto Grande",
      "districtName": "San Juan de Lurigancho",
      "adherenceRate": 85.5,
      "riskLevel": "LOW",
      "totalPatients": 120,
      "totalConfirmed": 102,
      "totalOmitted": 18
    },
    {
      "facilityId": "65f8a3b2c1d4e5f6a7b8c9d1",
      "facilityName": "Centro de Salud Zárate",
      "districtName": "San Juan de Lurigancho",
      "adherenceRate": 45.2,
      "riskLevel": "HIGH",
      "totalPatients": 85,
      "totalConfirmed": 38,
      "totalOmitted": 47
    }
  ]
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `facilityId` | string | ID único de la posta |
| `facilityName` | string | Nombre de la posta médica |
| `districtName` | string | Distrito donde se ubica |
| `adherenceRate` | number | Porcentaje de adherencia (0-100) |
| `riskLevel` | string | Nivel de riesgo: LOW, MEDIUM, HIGH |
| `totalPatients` | number | Total de pacientes en tratamiento |
| `totalConfirmed` | number | Total de dosis confirmadas |
| `totalOmitted` | number | Total de dosis omitidas |

---

#### Filtro por riesgo

**Ejemplo:** GET /facilities?riskLevel=HIGH

Retorna solo las postas con nivel de riesgo HIGH.

**Errores 400**


| Error | Significado |
|---|---|
| `Invalid risk level` | El valor del filtro no es válido | 
| `Unauthorized` | Token no proporcionado o inválido | 
| `Forbidden` | Usuario no tiene rol ADMIN |



### GET `/facilities/top`

Retorna las **4 postas con mayor adherencia**, ya ordenadas de mayor a menor. No requiere parámetros. Usar en el widget de preview del dashboard.

**Response 200 OK** — misma estructura que `/facilities`.

```json

{
  "facilities": [
    {
      "facilityId": "65f8a3b2c1d4e5f6a7b8c9d0",
      "facilityName": "Posta Canto Grande",
      "districtName": "San Juan de Lurigancho",
      "adherenceRate": 95.8,
      "riskLevel": "LOW",
      "totalPatients": 120,
      "totalConfirmed": 115,
      "totalOmitted": 5
    },
    {
      "facilityId": "65f8a3b2c1d4e5f6a7b8c9d2",
      "facilityName": "Posta Santa Rosa",
      "districtName": "Comas",
      "adherenceRate": 88.3,
      "riskLevel": "LOW",
      "totalPatients": 95,
      "totalConfirmed": 84,
      "totalOmitted": 11
    }
    // ... 2 más
  ]
}

```
> Nota: Las postas vienen ordenadas de mayor a menor adherencia.

**Errores 400**


| Error | Significado |
|---|---|
| `Unauthorized` | Token no proporcionado o inválido | 
| `Forbidden` | Usuario no tiene rol ADMIN |



---

### GET `/heatmap`

Coordenadas geográficas de postas para el mapa interactivo (Google Maps). Soporta filtro por nivel de riesgo.

**Query Parameters**

| Parámetro | Tipo | Obligatorio | Descripción                                             |
|---|---|---|---------------------------------------------------------|
| `riskLevel` | string | No | Filtro por nivel de riesgo: `LOW` \| `MEDIUM` \| `HIGH` |

**Response 200 OK**

```json
{
  "points": [
    {
      "facilityId": "uuid",
      "facilityName": "Posta Canto Grande",
      "lat": -12.0433,
      "lng": -77.0282,
      "riskLevel": "LOW",
      "adherenceRate": 80
    }
  ]
}
```

> Los campos `lat` y `lng` van directo al constructor de `LatLng` de `google_maps_flutter`.

| Campo | Tipo | Descripción                       |
|---|---|-----------------------------------|
| `facilityId` | string | ID único de la posta              |
| `facilityName` | string | Nombre de la posta médica         |
| `lat` | number | Latitud (coordenada geográfica)   |
| `lng` | number |Longitud (coordenada geográfica) |
| `riskLevel` | string | Nivel de riesgo: LOW, MEDIUM, HIGH |
| `adherenceRate` | number | Porcentaje de adherencia (0-100) |

---

**Uso en frontend**

- Utilizar con librerías como google_maps_flutter o leaflet

- Colorear los marcadores según el riskLevel

- Mostrar tooltip con facilityName y adherenceRate

**Errores** 400


| Error | Significado |
|---|---|
| `Invalid risk level` | El valor del filtro no es válido | 
| `Unauthorized` | Token no proporcionado o inválido |
| `Forbidden` | Usuario no tiene rol ADMIN |




### GET `/report/pdf`

Genera y descarga un reporte PDF con todas las métricas.

**Response**

- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="reporte_postas_YYYY-MM-DD.pdf"`

> ⚠️ **Importante:** Descargar como `response.bodyBytes`, **no** base64. Usar `path_provider` + `open_file` para guardar y abrir.

**El PDF incluye:**

- Resumen global: Total de postas activas, postas críticas, adherencia global
- Lista detallada: Tabla con todas las postas y sus métricas
- Formato visual: Colores por nivel de riesgo, diseño profesional

**Errores** 400


| Error | Significado |
|---|---|
| `No data available` | No hay postas activas para reportar | 
| `Unauthorized` | Token no proporcionado o inválido |
| `Forbidden` | Usuario no tiene rol ADMIN |

### Flujo

```
   Enfermero inicio un tratamiento 
   ↓
   Madre registra dosis (confirmada/omitida)
   ↓
   Treatment Tracking BC actualiza tratamiento
   ↓
   Analytics BC consulta datos agregados:
   - Treatments activos
   - Dosis confirmadas/omitidas por posta
   - Ubicación de postas
   ↓
  Calcula métricas:
   - Adherencia por posta
   - Nivel de riesgo
   - Resumen global
   ↓
  Admin visualiza en dashboard
```

###  UI Sugerida para Frontend (Flutter)

#### Dashboard Principal

#### Pantalla 1: Dashboard Principal (Inicio)

```
┌─────────────────────────────────────────┐
│  📊 Dashboard de Postas                 │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ │
│  │    4    │ │    2    │ │ 54.25%   │ │
│  │ Postas  │ │ Postas  │ │Adherencia│ │
│  │ Activas │ │ Criticas│ │ Global   │ │
│  └─────────┘ └─────────┘ └──────────┘ │
│                                         │
│  Estado de Postas          ┌──────────┐│
│  ┌────────────────────────┐│  Ver más ││
│  │● Posta Huascar         │└──────────┘│
│  │  San Juan Lurigancho   │            │
│  │  ████████░░ 30%        │            │
│  ├────────────────────────┤            │
│  │● Posta San Hilarion    │            │
│  │  San Juan Lurigancho   │            │
│  │  ██████████░░ 42%      │            │
│  ├────────────────────────┤            │
│  │● Posta Zarate          │            │
│  │  San Juan Lurigancho   │            │
│  │  ████████████░░ 65%    │            │
│  ├────────────────────────┤            │
│  │● Posta Canto Grande    │            │
│  │  San Juan Lurigancho   │            │
│  │  ██████████████░░ 80%  │            │
│  └────────────────────────┘            │
│                                         │
│  [Inicio]  [Mapa]  [Postas]  (Bottom Nav)│
└─────────────────────────────────────────┘
```

#### Pantalla 2: Lista Completa de Postas

```
┌─────────────────────────────────────────┐
│  Estado de Postas                       │
│                                         │
│  ADHERENCIA GLOBAL                      │
│  ┌─────────────────────────────────┐   │
│  │          54.25%                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Detalle por Establecimiento    [Exportar]│
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Posta Huascar                    │   │
│  │ San Juan Lurigancho              │   │
│  │ ████████░░░░░░░░░░░░░░ 30%      │   │
│  ├─────────────────────────────────┤   │
│  │ Posta San Hilarion               │   │
│  │ San Juan Lurigancho              │   │
│  │ ██████████░░░░░░░░░░░░ 42%      │   │
│  ├─────────────────────────────────┤   │
│  │ Posta Zarate                     │   │
│  │ San Juan Lurigancho              │   │
│  │ ████████████░░░░░░░░░░ 65%      │   │
│  ├─────────────────────────────────┤   │
│  │ Posta Canto Grande               │   │
│  │ San Juan Lurigancho              │   │
│  │ ████████████████░░░░░░ 80%      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Inicio]  [Mapa]  [Postas]            │
└─────────────────────────────────────────┘
```

#### Pantalla 3: Mapa de Calor

```
┌─────────────────────────────────────────┐
│  Mapa de Postas                         │
├─────────────────────────────────────────┤
│                                         │
│  [Todas] [Crítico] [Moderado] [Bien]   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │         🗺️ Mapa interactivo     │   │
│  │                                 │   │
│  │   🟢 P. Canto Grande            │   │
│  │   🟢 San Miguel                  │   │
│  │   🟡 Pueblo Libre                │   │
│  │   🔴 P. San Hilarión            │   │
│  │   🟢 Barranco                    │   │
│  │   🔴 P. Huascar                  │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Inicio]  [Mapa]  [Postas]            │
└─────────────────────────────────────────┘
```

### Componentes UI Detallados

#### 1. Tarjetas de Resumen (Summary Cards)

```dart
import 'package:flutter/material.dart';

class SummaryCards extends StatelessWidget {
  final int totalActive;
  final int totalCritical;
  final double globalAdherence;

  const SummaryCards({
    Key? key,
    required this.totalActive,
    required this.totalCritical,
    required this.globalAdherence,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _SummaryCard(
          title: 'Postas Activas',
          value: totalActive.toString(),
          icon: Icons.local_hospital,
          color: Colors.blue,
        ),
        const SizedBox(width: 12),
        _SummaryCard(
          title: 'Postas Críticas',
          value: totalCritical.toString(),
          icon: Icons.warning,
          color: Colors.red,
        ),
        const SizedBox(width: 12),
        _SummaryCard(
          title: 'Adherencia Global',
          value: '${globalAdherence.toStringAsFixed(1)}%',
          icon: Icons.trending_up,
          color: Colors.green,
        ),
      ],
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _SummaryCard({
    Key? key,
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: TextStyle(
                fontSize: 11,
                color: Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
```

#### 2. Preview de Postas (Dashboard)

```dart
import 'package:flutter/material.dart';

class FacilitiesPreviewList extends StatelessWidget {
  final List<FacilityAnalytics> facilities;
  final VoidCallback onSeeMore;

  const FacilitiesPreviewList({
    Key? key,
    required this.facilities,
    required this.onSeeMore,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Estado de Postas',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            TextButton(
              onPressed: onSeeMore,
              child: const Text('Ver más'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ...facilities.take(4).map((facility) => _PreviewItem(facility: facility)),
      ],
    );
  }
}

class _PreviewItem extends StatelessWidget {
  final FacilityAnalytics facility;

  const _PreviewItem({Key? key, required this.facility}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _getRiskColor(facility.riskLevel),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  facility.facilityName,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 16,
                  ),
                ),
              ),
              Text(
                '${facility.adherenceRate.toStringAsFixed(0)}%',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: _getRiskColor(facility.riskLevel),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            facility.districtName,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          LinearProgressIndicator(
            value: facility.adherenceRate / 100,
            backgroundColor: Colors.grey[200],
            color: _getRiskColor(facility.riskLevel),
            minHeight: 6,
            borderRadius: BorderRadius.circular(3),
          ),
        ],
      ),
    );
  }

  Color _getRiskColor(RiskLevel riskLevel) {
    switch (riskLevel) {
      case RiskLevel.low: return Colors.green;
      case RiskLevel.medium: return Colors.orange;
      case RiskLevel.high: return Colors.red;
    }
  }
}
```

#### 3 Filtro de Riesgo (Todas, Crítico, Moderado, Bien)

```dart
import 'package:flutter/material.dart';

class RiskLevelFilter extends StatelessWidget {
  final String? selectedFilter;
  final Function(String?) onChanged;

  const RiskLevelFilter({
    Key? key,
    required this.selectedFilter,
    required this.onChanged,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          _FilterChip(
            label: 'Todas',
            isSelected: selectedFilter == null,
            onTap: () => onChanged(null),
            color: Colors.grey,
          ),
          const SizedBox(width: 8),
          _FilterChip(
            label: 'Crítico',
            isSelected: selectedFilter == 'HIGH',
            onTap: () => onChanged('HIGH'),
            color: Colors.red,
          ),
          const SizedBox(width: 8),
          _FilterChip(
            label: 'Moderado',
            isSelected: selectedFilter == 'MEDIUM',
            onTap: () => onChanged('MEDIUM'),
            color: Colors.orange,
          ),
          const SizedBox(width: 8),
          _FilterChip(
            label: 'Bien',
            isSelected: selectedFilter == 'LOW',
            onTap: () => onChanged('LOW'),
            color: Colors.green,
          ),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;
  final Color color;

  const _FilterChip({
    Key? key,
    required this.label,
    required this.isSelected,
    required this.onTap,
    required this.color,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? color : Colors.transparent,
          border: Border.all(
            color: isSelected ? color : Colors.grey.shade300,
            width: 1,
          ),
          borderRadius: BorderRadius.circular(24),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : color,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            fontSize: 14,
          ),
        ),
      ),
    );
  }
}
```

#### 4. Tarjeta de Adherencia Global (Fondo Verde)

```dart

import 'package:flutter/material.dart';

class GlobalAdherenceCard extends StatelessWidget {
  final double adherenceRate;

  const GlobalAdherenceCard({
    Key? key,
    required this.adherenceRate,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.symmetric(vertical: 24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF4CAF50), Color(0xFF2E7D32)],
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.green.withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          const Text(
            'ADHERENCIA GLOBAL',
            style: TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.w500,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            '${adherenceRate.toStringAsFixed(1)}%',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 52,
              fontWeight: FontWeight.bold,
              letterSpacing: 1,
            ),
          ),
        ],
      ),
    );
  }
}

```
#### 5. Tarjeta de Detalle de Posta (Lista Completa)

```dart
import 'package:flutter/material.dart';

class FacilityDetailCard extends StatelessWidget {
  final FacilityAnalytics facility;

  const FacilityDetailCard({Key? key, required this.facility}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  facility.facilityName,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: _getRiskColor(facility.riskLevel).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text(
                  '${facility.adherenceRate.toStringAsFixed(0)}%',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: _getRiskColor(facility.riskLevel),
                    fontSize: 16,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            facility.districtName,
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 13,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _MetricChip(
                icon: Icons.people,
                label: 'Pacientes',
                value: facility.totalPatients,
              ),
              const SizedBox(width: 16),
              _MetricChip(
                icon: Icons.check_circle,
                label: 'Confirmadas',
                value: facility.totalConfirmed,
                color: Colors.green,
              ),
              const SizedBox(width: 16),
              _MetricChip(
                icon: Icons.cancel,
                label: 'Omitidas',
                value: facility.totalOmitted,
                color: Colors.red,
              ),
            ],
          ),
          const SizedBox(height: 12),
          LinearProgressIndicator(
            value: facility.adherenceRate / 100,
            backgroundColor: Colors.grey[200],
            color: _getRiskColor(facility.riskLevel),
            minHeight: 8,
            borderRadius: BorderRadius.circular(4),
          ),
        ],
      ),
    );
  }

  Color _getRiskColor(RiskLevel riskLevel) {
    switch (riskLevel) {
      case RiskLevel.low: return Colors.green;
      case RiskLevel.medium: return Colors.orange;
      case RiskLevel.high: return Colors.red;
    }
  }
}

class _MetricChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final int value;
  final Color? color;

  const _MetricChip({
    Key? key,
    required this.icon,
    required this.label,
    required this.value,
    this.color,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Row(
        children: [
          Icon(icon, size: 16, color: color ?? Colors.grey[600]),
          const SizedBox(width: 4),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value.toString(),
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                    color: color,
                  ),
                ),
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 10,
                    color: Colors.grey[500],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
```

#### 6. Barra de Navegación Inferior

```dart
import 'package:flutter/material.dart';

class CustomBottomNavigation extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const CustomBottomNavigation({
    Key? key,
    required this.currentIndex,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: BottomNavigationBar(
        currentIndex: currentIndex,
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Colors.blue,
        unselectedItemColor: Colors.grey,
        onTap: onTap,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Inicio',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.map),
            label: 'Mapa',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.list),
            label: 'Postas',
          ),
        ],
      ),
    );
  }
}
```

```
lib/
├── models/
│   └── analytics/
│       ├── dashboard_summary.dart
│       ├── facility_analytics.dart
│       ├── heatmap_point.dart
│       └── risk_level.dart
├── services/
│   └── analytics_service.dart
├── controllers/
│   └── analytics_controller.dart
├── widgets/
│   ├── summary_cards.dart
│   ├── facilities_preview_list.dart
│   ├── risk_level_filter.dart
│   ├── global_adherence_card.dart
│   ├── facility_detail_card.dart
│   ├── custom_bottom_navigation.dart
│   └── pdf_download_button.dart
├── screens/
│   └── analytics/
│       ├── home_screen.dart
│       ├── facilities_list_screen.dart
│       └── heatmap_screen.dart
└── app/
    └── routes/
        └── app_routes.dart
```

### Dependencias

```yaml
    dependencies:
    flutter:
      sdk: flutter

    # Networking
    http: ^1.1.0

    # State Management
    get: ^4.6.6

    # File handling
    path_provider: ^2.1.0
    open_file: ^3.3.2

    # Maps
    google_maps_flutter: ^2.5.0

    # UI
    flutter_staggered_grid_view: ^0.7.0

    # Permissions
    permission_handler: ^11.0.1
```

#### Códigos de Estado HTTP


| Código | Significado |
|--------|---|
| `200`  | OK — Operación exitosa | 
| `400`  | Token no proporcionado o inválido |
| `401`  | Bad Request — Error de validación o sin datos|
| `403`  | Unauthorized — Token no proporcionado o inválido |
| `404`  | Not Found — Recurso no encontrado |

#### Notas para el Equipo Frontend

##### Consideraciones importantes

- Autenticación: Todos los endpoints requieren token con rol ADMIN

- Filtros: Los filtros de UI ("Todas", "Crítico", "Moderado", "Bien") se mapean a:

    - "Crítico" → riskLevel=HIGH

    - "Moderado" → riskLevel=MEDIUM

    - "Bien" → riskLevel=LOW

    - "Todas" → sin parámetro

- PDF: Se descarga como archivo directo (no base64), usar response.bodyBytes

- Mapa: Las coordenadas lat y lng son para Google Maps

- Top 4: El endpoint /facilities/top ya devuelve solo 4 postas ordenadas por adherencia descendente
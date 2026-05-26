# Health Facilities — Bounded Context

> **Contexto:** Gestión de establecimientos de salud (postas), asignación de enfermeros y reserva de citas para pacientes pediátricos.

---

## ¿Quién puede usar este BC?

| Rol | Acceso | App |
|-----|--------|-----|
| **Admin** (`ADMIN`) | ✅ Acceso completo (registrar postas, asignar enfermeros, ver distritos) | Ferova Clinic (Flutter) |
| **Madre** (`MOTHER`) | ✅ Acceso parcial (buscar postas, reservar citas, ver historial) | Ferova Family (Kotlin) |
| **Enfermera** (`NURSE`) | ✅ Acceso parcial (ver su horario de citas) | Ferova Clinic (Flutter) |

---

## Autenticación

Los endpoints que requieren autenticación necesitan un **Bearer Token (JWT)** con el rol correspondiente.

```
Authorization: Bearer <token>
Content-Type: application/json
```

> ⚠️ El `motherId` y `nurseId` se extraen automáticamente del token según el rol. **No enviarlos en el body ni en la URL.**

---

## Base URL

```
/api/health-facilities
```

---

## Resumen de Endpoints

| Método | Endpoint | Descripción | Rol | App |
|--------|----------|-------------|-----|-----|
| `POST` | `/` | Registrar nueva posta de salud | Admin | Ferova Clinic |
| `POST` | `/assign-nurse` | Asignar enfermero a una posta | Admin | Ferova Clinic |
| `GET` | `/nurses/unassigned` | Listar enfermeros disponibles | Admin | Ferova Clinic |
| `GET` | `/districts` | Listar distritos para dropdown | Admin | Ferova Clinic |
| `POST` | `/appointments` | Reservar una cita | Madre | Ferova Family |
| `PUT` | `/appointments/cancel` | Cancelar una cita | Madre | Ferova Family |
| `GET` | `/nearby` | Buscar postas cercanas | Madre | Ferova Family |
| `GET` | `/:id` | Ver detalle de una posta | Público | Ferova Family |
| `GET` | `/patient/:patientId/appointments` | Historial de citas del paciente | Madre | Ferova Family |
| `GET` | `/appointments/nurse` | Horario de citas de la enfermera | Enfermera | Ferova Clinic |
| `GET` | `/:facilityId/available-slots` | Horarios disponibles en una posta | Público | Ferova Family |
| `GET` | `/appointments/mother/next` | Próxima cita de la madre | Madre | Ferova Family |

---

## Endpoints Detallados

### 👑 Administrador (Ferova Clinic — Flutter)

---

### 1. `POST /` — Registrar nueva posta de salud

Registra un nuevo establecimiento de salud en el sistema.

#### 📍 Implementación con Google Maps (Flutter — Dart)

| Requisito | Detalle |
|-----------|---------|
| Librería | `google_maps_flutter` |
| Permisos | `ACCESS_FINE_LOCATION` (opcional para admin, puede buscar dirección) |
| Flujo | Admin busca dirección o arrastra el marcador → Obtiene latitud/longitud → Se envía al backend |

```dart
late GoogleMapController mapController;
LatLng? selectedLocation;

void _onMapCreated(GoogleMapController controller) {
  mapController = controller;
}

void _onTap(LatLng location) {
  setState(() {
    selectedLocation = location;
  });
  _getAddressFromLatLng(location.latitude, location.longitude);
}

// Enviar al backend
final request = {
  'name': nameController.text,
  'address': addressController.text,
  'districtId': selectedDistrictId,
  'latitude': selectedLocation!.latitude,
  'longitude': selectedLocation!.longitude,
  'phoneNumber': phoneController.text,
  'services': selectedServices,
  'availableDays': selectedDays,
  'availableSlots': selectedSlots,
};
```

#### Request Body

```json
{
  "name": "Posta Ate",
  "address": "Av Los Olivos 123, Ate",
  "districtId": "DIST001",
  "latitude": -12.0464,
  "longitude": -77.0428,
  "phoneNumber": "987654321",
  "services": ["Vaccination", "Pediatrics", "General Medicine"],
  "availableDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "availableSlots": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `name` | `string` | ✅ | Nombre del establecimiento |
| `address` | `string` | ✅ | Dirección completa |
| `districtId` | `string` | ✅ | ID del distrito (obtenido de `GET /districts`) |
| `latitude` | `number` | ✅ | Latitud — obtenida de Google Maps |
| `longitude` | `number` | ✅ | Longitud — obtenida de Google Maps |
| `phoneNumber` | `string` | ✅ | Teléfono de contacto |
| `services` | `string[]` | ✅ | Lista de servicios ofrecidos |
| `availableDays` | `string[]` | ✅ | Días de atención (`Monday` – `Sunday`) |
| `availableSlots` | `string[]` | ✅ | Horarios disponibles (formato `HH:MM`) |

#### Response `201`

```json
{
  "message": "Health facility registered successfully"
}
```

#### Errores `400`

| Error | Significado |
|-------|-------------|
| `District not found` | El distrito no existe en el catálogo |
| `Health facility name is required` | Nombre obligatorio |
| `Address is required` | Dirección obligatoria |

---

### 2. `POST /assign-nurse` — Asignar enfermero a una posta

Asigna un enfermero a un establecimiento de salud.

> **Reglas de negocio:**
> - Una posta solo puede tener **un enfermero activo** a la vez.
> - Un enfermero solo puede estar asignado a **una única posta**.

#### 📱 Implementación Flutter (Ferova Clinic)

**Flujo de asignación:**

```
1. Lista de Postas (Administrador)
   ↓
2. Seleccionar una posta
   ↓
3. Botón "Asignar Enfermero"
   ↓
4. Modal/Dialog con dropdown de enfermeros disponibles
   ↓
5. Confirmar asignación
   ↓
6. Refrescar lista
```

**Modelos:**

```dart
// models/facility.dart
class Facility {
  final String id;
  final String name;
  final String status;
  final double? distanceKm;

  Facility({required this.id, required this.name, required this.status, this.distanceKm});

  factory Facility.fromJson(Map<String, dynamic> json) => Facility(
    id: json['id'],
    name: json['name'],
    status: json['status'],
    distanceKm: json['distanceKm']?.toDouble(),
  );
}

// models/nurse.dart
class Nurse {
  final String id;
  final String fullName;

  Nurse({required this.id, required this.fullName});

  factory Nurse.fromJson(Map<String, dynamic> json) => Nurse(
    id: json['id'],
    fullName: json['fullName'],
  );
}
```

**Servicio de API:**

```dart
// services/health_facility_service.dart
class HealthFacilityService {
  final String baseUrl;
  final String token;

  HealthFacilityService({required this.baseUrl, required this.token});

  Future<List<Nurse>> getUnassignedNurses() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/health-facilities/nurses/unassigned'),
      headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
    );
    if (response.statusCode == 200) {
      final Map<String, dynamic> data = json.decode(response.body);
      return (data['data'] as List).map((j) => Nurse.fromJson(j)).toList();
    }
    throw Exception('Failed to load unassigned nurses');
  }

  Future<void> assignNurseToFacility({
    required String facilityId,
    required String nurseId,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/health-facilities/assign-nurse'),
      headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
      body: json.encode({'facilityId': facilityId, 'nurseId': nurseId}),
    );
    if (response.statusCode != 200) {
      final error = json.decode(response.body);
      throw Exception(error['error'] ?? 'Failed to assign nurse');
    }
  }
}
```

**Widget Dialog de asignación:**

```dart
// widgets/assign_nurse_dialog.dart
class AssignNurseDialog extends StatefulWidget {
  final String facilityId;
  final String facilityName;
  final Future<List<Nurse>> Function() loadNurses;
  final Future<void> Function(String facilityId, String nurseId) onAssign;

  const AssignNurseDialog({
    Key? key,
    required this.facilityId,
    required this.facilityName,
    required this.loadNurses,
    required this.onAssign,
  }) : super(key: key);

  @override
  State<AssignNurseDialog> createState() => _AssignNurseDialogState();
}

class _AssignNurseDialogState extends State<AssignNurseDialog> {
  late Future<List<Nurse>> _nursesFuture;
  String? _selectedNurseId;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _nursesFuture = widget.loadNurses();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Asignar Enfermero'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Posta: ${widget.facilityName}'),
          const SizedBox(height: 16),
          const Text('Seleccionar Enfermero:'),
          const SizedBox(height: 8),
          FutureBuilder<List<Nurse>>(
            future: _nursesFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }
              if (snapshot.hasError) {
                return Text('Error: ${snapshot.error}', style: const TextStyle(color: Colors.red));
              }
              final nurses = snapshot.data ?? [];
              if (nurses.isEmpty) {
                return const Text('No hay enfermeros disponibles', style: TextStyle(color: Colors.orange));
              }
              return DropdownButtonFormField<String>(
                value: _selectedNurseId,
                isExpanded: true,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  hintText: 'Seleccione un enfermero',
                ),
                items: nurses.map((nurse) => DropdownMenuItem(
                  value: nurse.id,
                  child: Text(nurse.fullName),
                )).toList(),
                onChanged: (value) => setState(() => _selectedNurseId = value),
              );
            },
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: _isLoading ? null : () => Navigator.pop(context),
          child: const Text('Cancelar'),
        ),
        ElevatedButton(
          onPressed: (_selectedNurseId == null || _isLoading) ? null : _assignNurse,
          child: _isLoading
              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
              : const Text('Asignar'),
        ),
      ],
    );
  }

  Future<void> _assignNurse() async {
    if (_selectedNurseId == null) return;
    setState(() => _isLoading = true);
    try {
      await widget.onAssign(widget.facilityId, _selectedNurseId!);
      if (mounted) {
        Navigator.pop(context, true);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Enfermero asignado exitosamente'), backgroundColor: Colors.green),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
}
```

**Pantalla de lista de postas:**

```dart
// screens/facilities_screen.dart
class FacilitiesScreen extends StatefulWidget {
  const FacilitiesScreen({Key? key}) : super(key: key);

  @override
  State<FacilitiesScreen> createState() => _FacilitiesScreenState();
}

class _FacilitiesScreenState extends State<FacilitiesScreen> {
  late final HealthFacilityService _service;
  late Future<List<Facility>> _facilitiesFuture;

  @override
  void initState() {
    super.initState();
    _service = HealthFacilityService(baseUrl: 'https://tu-api.com', token: 'token_del_admin');
    _loadFacilities();
  }

  void _loadFacilities() {
    _facilitiesFuture = _getAllFacilities();
  }

  Future<List<Facility>> _getAllFacilities() async => [];

  void _showAssignNurseDialog(Facility facility) {
    showDialog(
      context: context,
      builder: (context) => AssignNurseDialog(
        facilityId: facility.id,
        facilityName: facility.name,
        loadNurses: _service.getUnassignedNurses,
        onAssign: (facilityId, nurseId) => _service.assignNurseToFacility(
          facilityId: facilityId,
          nurseId: nurseId,
        ),
      ),
    ).then((success) {
      if (success == true) setState(() => _loadFacilities());
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Postas de Salud')),
      body: FutureBuilder<List<Facility>>(
        future: _facilitiesFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) return Center(child: Text('Error: ${snapshot.error}'));
          final facilities = snapshot.data ?? [];
          if (facilities.isEmpty) return const Center(child: Text('No hay postas registradas'));

          return ListView.builder(
            itemCount: facilities.length,
            itemBuilder: (context, index) {
              final facility = facilities[index];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: ListTile(
                  leading: const Icon(Icons.local_hospital),
                  title: Text(facility.name),
                  subtitle: Text('Estado: ${facility.status}'),
                  trailing: ElevatedButton.icon(
                    onPressed: () => _showAssignNurseDialog(facility),
                    icon: const Icon(Icons.person_add, size: 18),
                    label: const Text('Asignar'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
```

#### Consideraciones UX

- Deshabilitar botón "Asignar" si la posta ya tiene enfermero (mostrar badge "Asignado").
- Mostrar el enfermero actual si ya tiene uno asignado.
- Pedir confirmación antes de reasignar (si se permite).
- Refrescar la lista después de asignar.

#### Request Body

```json
{
  "facilityId": "uuid",
  "nurseId": "uuid"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `facilityId` | `string` | ✅ | ID de la posta |
| `nurseId` | `string` | ✅ | ID del enfermero |

#### Response `200`

```json
{
  "message": "Nurse assigned successfully"
}
```

#### Errores `400`

| Error | Significado |
|-------|-------------|
| `Facility not found` | La posta no existe |
| `Nurse not found` | El enfermero no existe |
| `Facility already has an assigned nurse` | La posta ya tiene enfermero |
| `Nurse is already assigned to another facility` | El enfermero ya está en otra posta |

---

### 3. `GET /nurses/unassigned` — Listar enfermeros disponibles

Obtiene la lista de enfermeros no asignados a ninguna posta.

#### Response `200`

```json
{
  "success": true,
  "data": [
    { "id": "uuid", "fullName": "Carlos López" },
    { "id": "uuid", "fullName": "Ana Rodríguez" }
  ]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` | ID del enfermero (usar en asignación) |
| `fullName` | `string` | Nombre completo |

---

### 4. `GET /districts` — Listar distritos para dropdown

Obtiene la lista de todos los distritos disponibles para seleccionar al registrar una posta.

#### 📱 Implementación Flutter (Ferova Clinic)

```dart
// Modelo
class District {
  final String id;
  final String name;

  District({required this.id, required this.name});

  factory District.fromJson(Map<String, dynamic> json) =>
      District(id: json['id'], name: json['name']);
}

// Servicio
Future<List<District>> fetchDistricts(String token) async {
  final response = await http.get(
    Uri.parse('$baseUrl/api/health-facilities/districts'),
    headers: {'Authorization': 'Bearer $token'},
  );
  if (response.statusCode == 200) {
    final List data = json.decode(response.body);
    return data.map((j) => District.fromJson(j)).toList();
  }
  throw Exception('Failed to load districts');
}

// Widget Dropdown en el formulario de registro
DropdownButtonFormField<String>(
  decoration: const InputDecoration(labelText: 'Distrito *'),
  value: selectedDistrictId,
  items: districts.map((district) => DropdownMenuItem(
    value: district.id,
    child: Text(district.name),
  )).toList(),
  onChanged: (value) => setState(() => selectedDistrictId = value),
  validator: (value) =>
      (value == null || value.isEmpty) ? 'Seleccione un distrito' : null,
)
```

#### Response `200`

```json
[
  { "id": "DIST001", "name": "San Juan de Lurigancho" },
  { "id": "DIST002", "name": "Ate" },
  { "id": "DIST003", "name": "Villa El Salvador" }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` | ID del distrito (enviar como `districtId` al registrar posta) |
| `name` | `string` | Nombre del distrito (mostrar en dropdown) |

#### Errores

| Error | Significado |
|-------|-------------|
| `Unauthorized` | Token no proporcionado o inválido |
| `Forbidden` | Se requiere rol de administrador |

---

### 👩‍👧 Madre (Ferova Family — Kotlin)

---

### 5. `POST /appointments` — Reservar una cita

La madre reserva una cita para uno de sus hijos en una posta.

> **Reglas de negocio:**
> - El paciente debe pertenecer a la madre.
> - La posta debe tener un enfermero asignado.
> - El horario no puede estar ya ocupado.

#### Request Body

```json
{
  "facilityId": "uuid",
  "patientId": "uuid",
  "appointmentDate": "2026-06-10",
  "appointmentTime": "09:00"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `facilityId` | `string` | ✅ | ID de la posta |
| `patientId` | `string` | ✅ | ID del paciente (hijo/a) |
| `appointmentDate` | `string` | ✅ | Fecha (`YYYY-MM-DD`) |
| `appointmentTime` | `string` | ✅ | Hora (`HH:MM`) |

> ⚠️ El `motherId` se extrae automáticamente del token. No enviarlo.

#### Response `201`

```json
{
  "message": "Appointment booked successfully"
}
```

#### Errores `400`

| Error | Significado |
|-------|-------------|
| `Mother ID no encontrado en el token` | Token inválido |
| `Faltan campos requeridos` | Faltan datos obligatorios |
| `Este paciente no pertenece a esta madre` | El paciente no es hijo de la madre |
| `This schedule is already reserved` | El horario ya está ocupado |
| `This facility has no assigned nurse` | La posta no tiene enfermero |

---

### 6. `PUT /appointments/cancel` — Cancelar una cita

Cancela una cita previamente reservada.

#### Request Body

```json
{
  "appointmentId": "uuid"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `appointmentId` | `string` | ✅ | ID de la cita |

#### Response `200`

```json
{
  "message": "Appointment cancelled successfully"
}
```

#### Errores `400`

| Error | Significado |
|-------|-------------|
| `Appointment not found` | La cita no existe |
| `Esta cita no pertenece a esta madre` | La cita no es de la madre |

---

### 7. `GET /nearby` — Buscar postas cercanas

Lista todas las postas activas ordenadas por distancia desde la ubicación de la madre.

#### 📍 Implementación con Google Maps (Kotlin)

| Requisito | Detalle |
|-----------|---------|
| Librería | `com.google.android.gms:play-services-maps` |
| Permisos | `ACCESS_FINE_LOCATION` (requerido) |
| Flujo | Solicitar permiso → Obtener ubicación actual → Enviar lat/lng al endpoint → Mostrar postas |

**Permisos en `AndroidManifest.xml`:**

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

**Obtener ubicación y llamar al endpoint:**

```kotlin
private lateinit var fusedLocationClient: FusedLocationProviderClient

override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
    getCurrentLocation()
}

private fun getCurrentLocation() {
    if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
        != PackageManager.PERMISSION_GRANTED) {
        ActivityCompat.requestPermissions(
            this,
            arrayOf(Manifest.permission.ACCESS_FINE_LOCATION),
            LOCATION_PERMISSION_REQUEST_CODE
        )
        return
    }
    fusedLocationClient.lastLocation.addOnSuccessListener { location ->
        if (location != null) fetchNearbyFacilities(location.latitude, location.longitude)
    }
}

private fun fetchNearbyFacilities(lat: Double, lng: Double) {
    viewModelScope.launch {
        val facilities = repository.getNearbyFacilities(lat, lng)
        updateMapWithMarkers(facilities)
    }
}
```

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `lat` | `number` | ✅ | Latitud actual del usuario (GPS) |
| `lng` | `number` | ✅ | Longitud actual del usuario (GPS) |

#### Response `200`

```json
[
  { "id": "uuid", "name": "Posta Ate", "status": "ACTIVE", "distanceKm": 1.25 },
  { "id": "uuid", "name": "Posta Santa Anita", "status": "ACTIVE", "distanceKm": 3.50 }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` | ID de la posta |
| `name` | `string` | Nombre de la posta |
| `status` | `string` | `ACTIVE` o `INACTIVE` |
| `distanceKm` | `number` | Distancia en kilómetros |

#### Errores `400`

| Error | Significado |
|-------|-------------|
| `Mother ID no encontrado en el token` | Token inválido |
| `Debes registrar al menos un paciente antes de usar esta función` | La madre no tiene pacientes |
| `Both 'lat' and 'lng' query parameters are required` | Faltan coordenadas |

---

### 8. `GET /patient/:patientId/appointments` — Historial de citas

Obtiene el historial de citas de un paciente.

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `patientId` | `string` | ID del paciente |

> **Reglas de negocio:**
> - ✅ Muestra citas **CANCELADAS** (sin importar la fecha)
> - ✅ Muestra citas **CONFIRMADAS** que ya **pasaron**
> - ❌ **No** muestra citas confirmadas futuras
> - Ordenadas de más reciente a más antigua

#### Response `200`

```json
[
  {
    "appointmentId": "uuid",
    "facilityName": "Posta Ate",
    "patientId": "uuid",
    "appointmentDate": "2026-05-20",
    "appointmentTime": "10:00",
    "status": "CONFIRMED"
  },
  {
    "appointmentId": "uuid",
    "facilityName": "Posta Santa Anita",
    "patientId": "uuid",
    "appointmentDate": "2026-05-15",
    "appointmentTime": "09:00",
    "status": "CANCELLED"
  }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `appointmentId` | `string` | ID de la cita |
| `facilityName` | `string` | Nombre de la posta |
| `patientId` | `string` | ID del paciente |
| `appointmentDate` | `string` | Fecha (`YYYY-MM-DD`) |
| `appointmentTime` | `string` | Hora (`HH:MM`) |
| `status` | `string` | `CONFIRMED` o `CANCELLED` |

---

### 9. `GET /appointments/mother/next` — Próxima cita de la madre

Obtiene la próxima cita confirmada y futura de la madre (para cualquiera de sus hijos).

#### Response `200` — cuando existe cita

```json
{
  "appointmentDate": "2026-06-10",
  "appointmentTime": "09:00",
  "patientId": "uuid",
  "facilityName": "Posta Ate",
  "status": "CONFIRMED"
}
```

#### Response `200` — cuando no hay cita

```json
{
  "message": "No upcoming appointments found"
}
```

---

### 👩‍⚕️ Enfermera (Ferova Clinic — Flutter)

---

### 10. `GET /appointments/nurse` — Horario de citas de la enfermera

Obtiene todas las citas confirmadas y futuras asignadas a la enfermera.

> ⚠️ Solo devuelve citas **futuras**. Las citas pasadas no aparecen.

#### Response `200`

```json
[
  {
    "appointmentId": "uuid",
    "patientId": "uuid",
    "appointmentDate": "2026-06-10",
    "appointmentTime": "09:00",
    "status": "CONFIRMED"
  },
  {
    "appointmentId": "uuid",
    "patientId": "uuid",
    "appointmentDate": "2026-06-10",
    "appointmentTime": "11:00",
    "status": "CONFIRMED"
  }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `appointmentId` | `string` | ID de la cita |
| `patientId` | `string` | ID del paciente |
| `appointmentDate` | `string` | Fecha (`YYYY-MM-DD`) |
| `appointmentTime` | `string` | Hora (`HH:MM`) |
| `status` | `string` | `CONFIRMED` |

---

### 🔓 Público (sin autenticación)

> 💡 Estos endpoints se consumen desde Ferova Family pero **no requieren token**. La madre puede ver el detalle de una posta y sus horarios sin estar autenticada.

---

### 11. `GET /:id` — Ver detalle de una posta

Obtiene toda la información de un establecimiento de salud.

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `string` | ID de la posta |

#### Response `200`

```json
{
  "name": "Posta Ate",
  "address": "Av Los Olivos 123, Ate",
  "districtName": "Ate",
  "phoneNumber": "987654321",
  "services": ["Vaccination", "Pediatrics"],
  "availableDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "availableSlots": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
  "scheduleOfOperation": "Monday to Friday from 09:00 to 16:00",
  "status": "ACTIVE"
}
```

#### Errores `404`

| Error | Significado |
|-------|-------------|
| `Health facility not found` | La posta no existe |

---

### 12. `GET /:facilityId/available-slots` — Horarios disponibles

Obtiene los horarios de una posta indicando cuáles están libres u ocupados.

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `facilityId` | `string` | ID de la posta |

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `date` | `string` | ✅ | Fecha (`YYYY-MM-DD`) |

#### Response `200`

```json
[
  { "time": "09:00", "status": "AVAILABLE" },
  { "time": "10:00", "status": "OCCUPIED" },
  { "time": "11:00", "status": "AVAILABLE" }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `time` | `string` | Horario (`HH:MM`) |
| `status` | `string` | `AVAILABLE` (libre) o `OCCUPIED` (ocupado) |

---

## Reglas de Negocio

| Regla | Detalle |
|-------|---------|
| Una posta = un enfermero | Una posta solo puede tener un enfermero activo a la vez |
| Un enfermero = una posta | Un enfermero solo puede estar asignado a una única posta |
| Cita requiere enfermero | No se puede agendar cita si la posta no tiene enfermero asignado |
| Sin horarios duplicados | No se pueden reservar dos citas en el mismo horario para la misma posta |
| Cancelación inmediata | Las citas se cancelan al instante, sin validación de tiempo |

---

## Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| `200` | OK — Operación exitosa |
| `201` | Created — Recurso creado exitosamente |
| `400` | Bad Request — Error de validación o regla de negocio |
| `401` | Unauthorized — Token no proporcionado o inválido |
| `403` | Forbidden — Rol incorrecto para el endpoint |
| `404` | Not Found — Recurso no encontrado |

---

## Notas para Frontend

### Endpoints que requieren autenticación

| Endpoint | Rol requerido | App |
|----------|---------------|-----|
| `POST /` | `ADMIN` | Ferova Clinic (Flutter) |
| `POST /assign-nurse` | `ADMIN` | Ferova Clinic (Flutter) |
| `GET /nurses/unassigned` | `ADMIN` | Ferova Clinic (Flutter) |
| `GET /districts` | `ADMIN` | Ferova Clinic (Flutter) |
| `POST /appointments` | `MOTHER` | Ferova Family (Kotlin) |
| `PUT /appointments/cancel` | `MOTHER` | Ferova Family (Kotlin) |
| `GET /nearby` | `MOTHER` | Ferova Family (Kotlin) |
| `GET /patient/:patientId/appointments` | `MOTHER` | Ferova Family (Kotlin) |
| `GET /appointments/mother/next` | `MOTHER` | Ferova Family (Kotlin) |
| `GET /appointments/nurse` | `NURSE` | Ferova Clinic (Flutter) |

### Endpoints públicos (sin token)

| Endpoint | App que lo consume |
|----------|--------------------|
| `GET /:id` | Ferova Family (Kotlin) |
| `GET /:facilityId/available-slots` | Ferova Family (Kotlin) |

### IDs extraídos del token automáticamente

Los siguientes IDs **no deben enviarse** en los requests:

- `motherId` — endpoints de madre en Ferova Family
- `nurseId` — endpoints de enfermera en Ferova Clinic

---

## 📍 Implementación con Google Maps — Resumen

### Ferova Clinic (Flutter) — Admin registrar posta

| Elemento | Detalle |
|----------|---------|
| Propósito | Admin selecciona ubicación de la posta en el mapa |
| Librería | `google_maps_flutter` |
| Salida | `latitude` y `longitude` se envían al endpoint `POST /` |
| Extra | Geocoding reverso para obtener dirección desde coordenadas |

### Ferova Clinic (Flutter) — Admin asignar enfermero

| Elemento | Detalle |
|----------|---------|
| Propósito | Admin asigna un enfermero a una posta |
| Flujo | Lista de postas → Botón "Asignar" → Dropdown de enfermeros → Confirmar |
| Endpoints | `GET /nurses/unassigned` y `POST /assign-nurse` |
| Validaciones | Una posta = un enfermero, un enfermero = una posta |

### Ferova Clinic (Flutter) — Admin seleccionar distrito

| Elemento | Detalle |
|----------|---------|
| Propósito | Admin selecciona distrito desde un dropdown |
| Endpoint | `GET /districts` (requiere token de admin) |
| Flujo | Obtener lista de distritos → Mostrar en dropdown → Enviar `districtId` al registrar |

### Ferova Family (Kotlin) — Madre ver postas cercanas

| Elemento | Detalle |
|----------|---------|
| Propósito | Mostrar postas cercanas en mapa y lista |
| Permisos | `ACCESS_FINE_LOCATION` (requerido) |
| Librería | `play-services-maps` + `FusedLocationProviderClient` |
| Flujo | Obtener ubicación actual → `GET /nearby?lat=X&lng=Y` → Mostrar marcadores |
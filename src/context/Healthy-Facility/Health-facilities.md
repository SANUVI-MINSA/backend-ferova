# Health Facilities — Bounded Context

Contexto: Gestión de establecimientos de salud (postas), asignación de enfermeros y reserva de citas para pacientes pediátricos.

---

## ¿Quién puede usar este BC?

| Rol | Acceso | App |
|-----|--------|-----|
| Admin (ADMIN) | ✅ Acceso completo (registrar postas, asignar enfermeros, ver distritos, verificar disponibilidad) | Ferova Clinic (Flutter) |
| Madre (MOTHER) | ✅ Acceso parcial (buscar postas, reservar citas, ver historial) | Ferova Family (Kotlin) |
| Enfermera (NURSE) | ✅ Acceso parcial (ver su horario de citas) | Ferova Clinic (Flutter) |

---

## Autenticación

Los endpoints que requieren autenticación necesitan un Bearer Token (JWT) con el rol correspondiente.

```
Authorization: Bearer <token>
Content-Type: application/json
```

> ⚠️ El `motherId` y `nurseId` se extraen automáticamente del token según el rol. No enviarlos en el body ni en la URL.

---

## Base URL

```
/api/health-facilities
```

---

## Resumen de Endpoints

| Método | Endpoint | Descripción | Rol | App |
|--------|----------|-------------|-----|-----|
| POST | `/` | Registrar nueva posta de salud | Admin | Ferova Clinic |
| GET | `/` | ✨ Listar todas las postas (admin) | Admin | Ferova Clinic |
| GET | `/can-register` | ✨ Verificar disponibilidad de enfermeros | Admin | Ferova Clinic |
| POST | `/assign-nurse` | Asignar enfermero a una posta | Admin | Ferova Clinic |
| GET | `/nurses/unassigned` | Listar enfermeros disponibles | Admin | Ferova Clinic |
| GET | `/districts` | Listar distritos para dropdown | Admin | Ferova Clinic |
| POST | `/appointments` | Reservar una cita | Madre | Ferova Family |
| PUT | `/appointments/cancel` | Cancelar una cita | Madre | Ferova Family |
| GET | `/nearby` | Buscar postas cercanas | Madre | Ferova Family |
| GET | `/:id` | Ver detalle de una posta | Público | Ferova Family |
| GET | `/patient/:patientId/appointments` | Historial de citas del paciente | Madre | Ferova Family |
| GET | `/appointments/nurse` | Horario de citas de la enfermera | Enfermera | Ferova Clinic |
| GET | `/:facilityId/available-slots` | Horarios disponibles en una posta | Público | Ferova Family |
| GET | `/appointments/mother/next` | Próxima cita de la madre | Madre | Ferova Family |

---

## Endpoints Detallados

---

## 👑 Administrador (Ferova Clinic — Flutter)

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
| name | string | ✅ | Nombre del establecimiento |
| address | string | ✅ | Dirección completa |
| districtId | string | ✅ | ID del distrito (obtenido de `GET /districts`) |
| latitude | number | ✅ | Latitud — obtenida de Google Maps |
| longitude | number | ✅ | Longitud — obtenida de Google Maps |
| phoneNumber | string | ✅ | Teléfono de contacto |
| services | string[] | ✅ | Lista de servicios ofrecidos |
| availableDays | string[] | ✅ | Días de atención (Monday – Sunday) |
| availableSlots | string[] | ✅ | Horarios disponibles (formato HH:MM) |

#### Response `201`

```json
{
  "message": "Health facility registered successfully"
}
```

#### Errores `400`

| Error | Significado |
|-------|-------------|
| District not found | El distrito no existe en el catálogo |
| Health facility name is required | Nombre obligatorio |
| Address is required | Dirección obligatoria |

---

### 2. `GET /` — Listar todas las postas (para administrador)

Propósito: Obtener el listado completo de todas las postas registradas (activas e inactivas) con información de asignación de enfermeros.

> ⚠️ **Importante:** Este endpoint es diferente al `GET /nearby` que usan las madres. Es exclusivo para admin y devuelve todas las postas con información de asignación.

#### 📱 Implementación Flutter (Ferova Clinic)

```dart
// models/admin_facility.dart
class AdminFacility {
  final String id;
  final String name;
  final String address;
  final String? assignedNurseName;
  final bool hasNurseAssigned;
  final String? displayMessage;

  AdminFacility({
    required this.id,
    required this.name,
    required this.address,
    this.assignedNurseName,
    required this.hasNurseAssigned,
    this.displayMessage,
  });

  factory AdminFacility.fromJson(Map<String, dynamic> json) => AdminFacility(
    id: json['id'],
    name: json['name'],
    address: json['address'],
    assignedNurseName: json['assignedNurseName'],
    hasNurseAssigned: json['hasNurseAssigned'],
    displayMessage: json['displayMessage'],
  );
}

class AdminFacilityListResponse {
  final int total;
  final List<AdminFacility> healthFacilities;

  AdminFacilityListResponse({
    required this.total,
    required this.healthFacilities,
  });

  factory AdminFacilityListResponse.fromJson(Map<String, dynamic> json) => AdminFacilityListResponse(
    total: json['total'],
    healthFacilities: (json['healthFacilities'] as List)
        .map((j) => AdminFacility.fromJson(j))
        .toList(),
  );
}

// services/health_facility_service.dart
Future<AdminFacilityListResponse> getAllFacilities() async {
  final response = await http.get(
    Uri.parse('$baseUrl/api/health-facilities'),
    headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
  );
  if (response.statusCode == 200) {
    return AdminFacilityListResponse.fromJson(json.decode(response.body));
  }
  throw Exception('Failed to load facilities');
}
```

#### Response `200`

```json
{
  "total": 3,
  "healthFacilities": [
    {
      "id": "pf_001",
      "name": "Posta Médica Los Algarrobos",
      "address": "Av. Principal 123, Piura",
      "assignedNurseName": "María González Pérez",
      "hasNurseAssigned": true
    },
    {
      "id": "pf_002",
      "name": "Centro de Salud San Martín",
      "address": "Calle Lima 456, Tambogrande",
      "assignedNurseName": null,
      "hasNurseAssigned": false,
      "displayMessage": "No nurse assigned yet"
    },
    {
      "id": "pf_003",
      "name": "Puesto de Salud El Arenal",
      "address": "Mz B Lt 12, El Arenal",
      "assignedNurseName": "Lucía Fernández Rojas",
      "hasNurseAssigned": true
    }
  ]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| total | number | Cantidad total de postas registradas |
| healthFacilities | array | Listado de postas |
| id | string | Identificador único de la posta |
| name | string | Nombre de la posta |
| address | string | Dirección de la posta |
| assignedNurseName | string \| null | Nombre completo de la enfermera asignada |
| hasNurseAssigned | boolean | `true` si tiene enfermera asignada |
| displayMessage | string | Solo cuando `hasNurseAssigned: false` |

#### Códigos HTTP

| Código | Descripción |
|--------|-------------|
| 200 OK | Listado obtenido exitosamente |
| 401 Unauthorized | Token no proporcionado o inválido |
| 403 Forbidden | Se requiere rol de administrador |

---

### 3. `GET /can-register` — Verificar disponibilidad de enfermeros

Propósito: Validar si hay al menos un enfermero no asignado a ninguna posta médica, para habilitar o deshabilitar el botón de "Registrar Posta" en el frontend.

#### 📱 Implementación Flutter (Ferova Clinic)

```dart
// models/can_register_response.dart
class CanRegisterResponse {
  final bool available;
  final String message;
  final String? details;

  CanRegisterResponse({
    required this.available,
    required this.message,
    this.details,
  });

  factory CanRegisterResponse.fromJson(Map<String, dynamic> json) => CanRegisterResponse(
    available: json['available'],
    message: json['message'],
    details: json['details'],
  );
}

// services/health_facility_service.dart
Future<CanRegisterResponse> canRegisterFacility() async {
  final response = await http.get(
    Uri.parse('$baseUrl/api/health-facilities/can-register'),
    headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
  );
  if (response.statusCode == 200) {
    return CanRegisterResponse.fromJson(json.decode(response.body));
  }
  throw Exception('Failed to check availability');
}
```

Uso en el formulario de registro:

```dart
// screens/register_facility_screen.dart
class RegisterFacilityScreen extends StatefulWidget {
  @override
  State<RegisterFacilityScreen> createState() => _RegisterFacilityScreenState();
}

class _RegisterFacilityScreenState extends State<RegisterFacilityScreen> {
  bool _canRegister = false;
  bool _isLoading = true;
  String? _disabledReason;

  @override
  void initState() {
    super.initState();
    _checkAvailability();
  }

  Future<void> _checkAvailability() async {
    try {
      final response = await _service.canRegisterFacility();
      setState(() {
        _canRegister = response.available;
        _disabledReason = !response.available ? response.details : null;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _canRegister = false;
        _disabledReason = 'Error al verificar disponibilidad';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Registrar Posta')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            if (_isLoading)
              const Center(child: CircularProgressIndicator()),
            if (!_isLoading && !_canRegister)
              Card(
                color: Colors.orange.shade50,
                child: Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Column(
                    children: [
                      const Icon(Icons.warning_amber, color: Colors.orange, size: 32),
                      const SizedBox(height: 8),
                      Text(
                        _disabledReason ?? 'No hay enfermeros disponibles',
                        style: const TextStyle(color: Colors.orange),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _canRegister ? _registerFacility : null,
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 48),
              ),
              child: const Text('Registrar Posta'),
            ),
          ],
        ),
      ),
    );
  }
}
```

#### Response `200` — Hay enfermeros disponibles

```json
{
  "available": true,
  "message": "Hay 3 enfermeros disponibles para asignar a una nueva posta"
}
```

#### Response `200` — No hay enfermeros disponibles

```json
{
  "available": false,
  "message": "Sin enfermeros disponibles",
  "details": "Actualmente, todo el personal de enfermería registrado ha sido asignado a una posta médica. Por favor, espere al registro de nuevo personal."
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| available | boolean | `true` si hay al menos un enfermero sin asignar |
| message | string | Mensaje amigable para el usuario |
| details | string? | Detalle adicional (solo cuando `available: false`) |

#### Uso en frontend

| Condición | Acción |
|-----------|--------|
| `available: true` | ✅ Habilitar botón "Registrar Posta" |
| `available: false` | ❌ Deshabilitar botón y mostrar `details` o `message` |

#### Códigos HTTP

| Código | Descripción |
|--------|-------------|
| 200 OK | Respuesta estándar en ambos casos |
| 401 Unauthorized | Token no proporcionado o inválido |
| 403 Forbidden | Se requiere rol de administrador |

---

### 4. `POST /assign-nurse` — Asignar enfermero a una posta

Asigna un enfermero a un establecimiento de salud.

**Reglas de negocio:**
- Una posta solo puede tener un enfermero activo a la vez.
- Un enfermero solo puede estar asignado a una única posta.

#### 📱 Implementación Flutter (Ferova Clinic)

Flujo de asignación:

```
1. Lista de Postas (Administrador)
   ↓
2. Seleccionar una posta
   ↓
3. Botón "Asignar Enfermero"
   ↓
4. Lista de enfermeros disponibles

5. Selecion un enfermero
   ↓
6. Confirmar asignación
   ↓
7. Refrescar lista
```

Widget Dialog de asignación:

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
  bool _isAssigning = false;

  @override
  void initState() {
    super.initState();
    _nursesFuture = widget.loadNurses();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Asignar Enfermero'),
      content: Container(
        width: double.maxFinite,
        constraints: const BoxConstraints(maxWidth: 400, maxHeight: 500),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Información de la posta
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(Icons.local_hospital, color: Colors.blue),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Posta seleccionada',
                          style: TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                        Text(
                          widget.facilityName,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Seleccionar Enfermero:',
              style: TextStyle(fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 8),
            // Lista de enfermeros 
            Expanded(
              child: FutureBuilder<List<Nurse>>(
                future: _nursesFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  }
                  
                  if (snapshot.hasError) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.error_outline, color: Colors.red, size: 48),
                          const SizedBox(height: 8),
                          Text(
                            'Error: ${snapshot.error}',
                            style: const TextStyle(color: Colors.red),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    );
                  }
                  
                  final nurses = snapshot.data ?? [];
                  
                  if (nurses.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.person_off, color: Colors.orange, size: 48),
                          const SizedBox(height: 8),
                          const Text(
                            'No hay enfermeros disponibles',
                            style: TextStyle(color: Colors.orange),
                          ),
                          const SizedBox(height: 8),
                          TextButton.icon(
                            onPressed: () {
                              setState(() {
                                _nursesFuture = widget.loadNurses();
                              });
                            },
                            icon: const Icon(Icons.refresh),
                            label: const Text('Reintentar'),
                          ),
                        ],
                      ),
                    );
                  }
                  
                  return ListView.builder(
                    shrinkWrap: true,
                    itemCount: nurses.length,
                    itemBuilder: (context, index) {
                      final nurse = nurses[index];
                      final isSelected = _selectedNurseId == nurse.id;
                      
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        elevation: isSelected ? 2 : 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                          side: BorderSide(
                            color: isSelected ? Colors.blue : Colors.grey.shade200,
                            width: isSelected ? 2 : 1,
                          ),
                        ),
                        child: InkWell(
                          onTap: _isAssigning ? null : () {
                            setState(() {
                              _selectedNurseId = nurse.id;
                            });
                          },
                          borderRadius: BorderRadius.circular(8),
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Row(
                              children: [
                                Radio<String>(
                                  value: nurse.id,
                                  groupValue: _selectedNurseId,
                                  onChanged: _isAssigning ? null : (value) {
                                    setState(() {
                                      _selectedNurseId = value;
                                    });
                                  },
                                ),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: Colors.blue.shade100,
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.person, color: Colors.blue, size: 20),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        nurse.fullName,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w500,
                                          fontSize: 16,
                                        ),
                                      ),
                                      const Text(
                                        'Enfermero(a)',
                                        style: TextStyle(fontSize: 12, color: Colors.grey),
                                      ),
                                    ],
                                  ),
                                ),
                                if (isSelected)
                                  const Icon(Icons.check_circle, color: Colors.green),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: _isAssigning ? null : () => Navigator.pop(context),
          child: const Text('Cancelar'),
        ),
        ElevatedButton.icon(
          onPressed: (_selectedNurseId == null || _isAssigning) ? null : _assignNurse,
          icon: _isAssigning
              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
              : const Icon(Icons.person_add),
          label: _isAssigning ? const Text('Asignando...') : const Text('Asignar'),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.blue,
            foregroundColor: Colors.white,
          ),
        ),
      ],
    );
  }

  Future<void> _assignNurse() async {
    if (_selectedNurseId == null) return;
    
    setState(() => _isAssigning = true);
    
    try {
      await widget.onAssign(widget.facilityId, _selectedNurseId!);
      
      if (mounted) {
        // Mostrar snackbar de éxito
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Enfermero asignado exitosamente'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 2),
          ),
        );
        // Cerrar el diálogo y retornar true para indicar éxito
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        // Mostrar error detallado
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('❌ Error: $e'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isAssigning = false);
      }
    }
  }
}
```

Pantalla de lista de postas:

```dart
// screens/facilities_screen.dart (fragmento actualizado)
void _showAssignNurseDialog(AdminFacility facility) {
  showDialog<bool>(
    context: context,
    builder: (context) => AssignNurseDialog(
      facilityId: facility.id,
      facilityName: facility.name,
      loadNurses: _service.getUnassignedNurses,
      onAssign: (facilityId, nurseId) async {
        await _service.assignNurseToFacility(
          facilityId: facilityId,
          nurseId: nurseId,
        );
      },
    ),
  ).then((success) {
    if (success == true) {
      // Refrescar la lista después de asignar
      setState(() {
        _loadFacilities();
      });
    }
  });
}
```
### Flujo Visual

```
┌─────────────────────────────────────────┐
│         Asignar Enfermero               │
├─────────────────────────────────────────┤
│                                         │
│ Seleccionar Enfermero:                  │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ○ 👤 María González Pérez    ✓      │ │
│ │     Enfermero(a)                    │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ ○ 👤 Carlos López                   │ │
│ │     Enfermero(a)                    │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ ○ 👤 Ana Rodríguez                  │ │
│ │     Enfermero(a)                    │ │
│ └─────────────────────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│          [Cancelar]  [👤 Asignar]       │
└─────────────────────────────────────────┘
```

#### Request Body

```json
{
  "facilityId": "uuid",
  "nurseId": "uuid"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| facilityId | string | ✅ | ID de la posta |
| nurseId | string | ✅ | ID del enfermero |

#### Response `200`

```json
{
  "message": "Nurse assigned successfully"
}
```

#### Errores `400`

| Error | Significado |
|-------|-------------|
| Facility not found | La posta no existe |
| Nurse not found | El enfermero no existe |
| Facility already has an assigned nurse | La posta ya tiene enfermero |
| Nurse is already assigned to another facility | El enfermero ya está en otra posta |

---

### 5. `GET /nurses/unassigned` — Listar enfermeros disponibles

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
| id | string | ID del enfermero (usar en asignación) |
| fullName | string | Nombre completo |

---

### 6. `GET /districts` — Listar distritos para dropdown

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
| id | string | ID del distrito (enviar como `districtId` al registrar posta) |
| name | string | Nombre del distrito (mostrar en dropdown) |

#### Errores

| Error | Significado |
|-------|-------------|
| Unauthorized | Token no proporcionado o inválido |
| Forbidden | Se requiere rol de administrador |

---

## 👩‍👧 Madre (Ferova Family — Kotlin)

---

### 7. `POST /appointments` — Reservar una cita

La madre reserva una cita para uno de sus hijos en una posta.

**Reglas de negocio:**
- El paciente debe pertenecer a la madre.
- La posta debe tener un enfermero asignado.
- El horario no puede estar ya ocupado.

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
| facilityId | string | ✅ | ID de la posta |
| patientId | string | ✅ | ID del paciente (hijo/a) |
| appointmentDate | string | ✅ | Fecha (YYYY-MM-DD) |
| appointmentTime | string | ✅ | Hora (HH:MM) |

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
| Mother ID no encontrado en el token | Token inválido |
| Faltan campos requeridos | Faltan datos obligatorios |
| Este paciente no pertenece a esta madre | El paciente no es hijo de la madre |
| This schedule is already reserved | El horario ya está ocupado |
| This facility has no assigned nurse | La posta no tiene enfermero |

---

### 8. `PUT /appointments/cancel` — Cancelar una cita

Cancela una cita previamente reservada.

#### Request Body

```json
{
  "appointmentId": "uuid"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| appointmentId | string | ✅ | ID de la cita |

#### Response `200`

```json
{
  "message": "Appointment cancelled successfully"
}
```

#### Errores `400`

| Error | Significado |
|-------|-------------|
| Appointment not found | La cita no existe |
| Esta cita no pertenece a esta madre | La cita no es de la madre |

---

### 9. `GET /nearby` — Buscar postas cercanas

Lista todas las postas activas ordenadas por distancia desde la ubicación de la madre.

#### 📍 Implementación con Google Maps (Kotlin)

| Requisito | Detalle |
|-----------|---------|
| Librería | `com.google.android.gms:play-services-maps` |
| Permisos | `ACCESS_FINE_LOCATION` (requerido) |
| Flujo | Solicitar permiso → Obtener ubicación actual → Enviar lat/lng al endpoint → Mostrar postas |

Permisos en `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

Obtener ubicación y llamar al endpoint:

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
| lat | number | ✅ | Latitud actual del usuario (GPS) |
| lng | number | ✅ | Longitud actual del usuario (GPS) |

#### Response `200`

```json
[
  { "id": "uuid", "name": "Posta Ate", "status": "ACTIVE", "distanceKm": 1.25 },
  { "id": "uuid", "name": "Posta Santa Anita", "status": "ACTIVE", "distanceKm": 3.50 }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | string | ID de la posta |
| name | string | Nombre de la posta |
| status | string | `ACTIVE` o `INACTIVE` |
| distanceKm | number | Distancia en kilómetros |

#### Errores `400`

| Error | Significado |
|-------|-------------|
| Mother ID no encontrado en el token | Token inválido |
| Debes registrar al menos un paciente antes de usar esta función | La madre no tiene pacientes |
| Both 'lat' and 'lng' query parameters are required | Faltan coordenadas |

---

### 10. `GET /patient/:patientId/appointments` — Historial de citas

Obtiene el historial de citas de un paciente.

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| patientId | string | ID del paciente |

**Reglas de negocio:**
- ✅ Muestra citas CANCELADAS (sin importar la fecha)
- ✅ Muestra citas CONFIRMADAS que ya pasaron
- ❌ No muestra citas confirmadas futuras
- Ordenadas de más reciente a más antigua

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
| appointmentId | string | ID de la cita |
| facilityName | string | Nombre de la posta |
| patientId | string | ID del paciente |
| appointmentDate | string | Fecha (YYYY-MM-DD) |
| appointmentTime | string | Hora (HH:MM) |
| status | string | `CONFIRMED` o `CANCELLED` |

---

### 11. `GET /appointments/mother/next` — Próxima cita de la madre

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

## 👩‍⚕️ Enfermera (Ferova Clinic — Flutter)

---

### 12. `GET /appointments/nurse` — Horario de citas de la enfermera

Obtiene todas las citas confirmadas y futuras asignadas a la enfermera.

> ⚠️ Solo devuelve citas futuras. Las citas pasadas no aparecen.

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
| appointmentId | string | ID de la cita |
| patientId | string | ID del paciente |
| appointmentDate | string | Fecha (YYYY-MM-DD) |
| appointmentTime | string | Hora (HH:MM) |
| status | string | `CONFIRMED` |

---

## 🔓 Público (sin autenticación)

> 💡 Estos endpoints se consumen desde Ferova Family pero no requieren token. La madre puede ver el detalle de una posta y sus horarios sin estar autenticada.

---

### 13. `GET /:id` — Ver detalle de una posta

Obtiene toda la información de un establecimiento de salud.

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | string | ID de la posta |

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
| Health facility not found | La posta no existe |

---

### 14. `GET /:facilityId/available-slots` — Horarios disponibles

Obtiene los horarios de una posta indicando cuáles están libres u ocupados.

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| facilityId | string | ID de la posta |

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| date | string | ✅ | Fecha (YYYY-MM-DD) |

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
| time | string | Horario (HH:MM) |
| status | string | `AVAILABLE` (libre) o `OCCUPIED` (ocupado) |

---

### 15. `GET /appointments/nurse/top` — Top citas más próximas

Obtiene las primeras N citas confirmadas y futuras asignadas a la enfermera, ordenadas por fecha y hora (más cercana primero). Útil para mostrar en el dashboard principal del enfermero.

```dart
class TopAppointment {
  final String appointmentId;
  final String patientId;
  final String patientName;
  final String facilityId;
  final String facilityName;
  final String appointmentDate;
  final String appointmentTime;
  final String status;

  TopAppointment({
    required this.appointmentId,
    required this.patientId,
    required this.patientName,
    required this.facilityId,
    required this.facilityName,
    required this.appointmentDate,
    required this.appointmentTime,
    required this.status,
  });

  factory TopAppointment.fromJson(Map<String, dynamic> json) => TopAppointment(
    appointmentId: json['appointmentId'],
    patientId: json['patientId'],
    patientName: json['patientName'],
    facilityId: json['facilityId'],
    facilityName: json['facilityName'],
    appointmentDate: json['appointmentDate'],
    appointmentTime: json['appointmentTime'],
    status: json['status'],
  );
}

// services/health_facility_service.dart
Future<List<TopAppointment>> getMyTopAppointments({int limit = 4}) async {
  final response = await http.get(
    Uri.parse('$baseUrl/api/health-facilities/appointments/nurse/top?limit=$limit'),
    headers: {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    },
  );

  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    final List<dynamic> appointments = data['data'];
    return appointments.map((j) => TopAppointment.fromJson(j)).toList();
  }
  throw Exception('Failed to load appointments');
}
```

**Query Parameters (Opcionales)**


| Parámetro | Tipo | Default | Descripción |
|-------|---------|-------|---------|
| limit | number | 4 | Número máximo de citas a retornar|

**Response 200**

```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "appointmentId": "apt_001",
      "patientId": "pat_001",
      "patientName": "Juan Pérez Gómez",
      "facilityId": "fac_001",
      "facilityName": "Posta Médica Los Algarrobos",
      "appointmentDate": "2026-06-25",
      "appointmentTime": "09:00",
      "status": "CONFIRMED"
    },
    {
      "appointmentId": "apt_002",
      "patientId": "pat_002",
      "patientName": "María Rodríguez López",
      "facilityId": "fac_001",
      "facilityName": "Posta Médica Los Algarrobos",
      "appointmentDate": "2026-06-25",
      "appointmentTime": "11:00",
      "status": "CONFIRMED"
    },
    {
      "appointmentId": "apt_003",
      "patientId": "pat_003",
      "patientName": "Carlos García Mendez",
      "facilityId": "fac_001",
      "facilityName": "Posta Médica Los Algarrobos",
      "appointmentDate": "2026-06-26",
      "appointmentTime": "10:00",
      "status": "CONFIRMED"
    }
  ]
}
```

### 16. GET /nurse/my-facility — Mi posta asignada

Obtiene el nombre de la posta médica donde el enfermero está actualmente asignado. Útil para mostrar en el dashboard del enfermero.

> ⚠️ Solo retorna el nombre de la posta. Si el enfermero no tiene asignación, retorna 404 con mensaje.

**Implementación Flutter (Ferova Clinic)**

```dart
// services/health_facility_service.dart
/// Obtiene el nombre de la posta asignada al enfermero
/// Retorna el nombre de la posta o null si no tiene asignación
Future<String?> getMyFacilityName() async {
  try {
    final response = await http.get(
      Uri.parse('$baseUrl/api/health-facilities/nurse/my-facility'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    final data = json.decode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data['data']['facilityName'] as String?;
    }
    
    // Si es 404, el enfermero no tiene posta asignada
    if (response.statusCode == 404) {
      return null;
    }

    throw Exception(data['error'] ?? 'Error al obtener la posta');
    
  } catch (e) {
    throw Exception('Error al obtener la posta asignada: $e');
  }
}
```

**Response 200 — Tiene posta asignada**

```json
{
  "success": true,
  "data": {
    "facilityName": "Posta Médica Los Algarrobos"
  }
}
```

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
| 200 | OK — Operación exitosa |
| 201 | Created — Recurso creado exitosamente |
| 400 | Bad Request — Error de validación o regla de negocio |
| 401 | Unauthorized — Token no proporcionado o inválido |
| 403 | Forbidden — Rol incorrecto para el endpoint |
| 404 | Not Found — Recurso no encontrado |

---

## Notas para Frontend

### Endpoints que requieren autenticación

| Endpoint | Rol requerido | App |
|----------|---------------|-----|
| POST `/` | ADMIN | Ferova Clinic (Flutter) |
| GET `/` | ADMIN | Ferova Clinic (Flutter) |
| GET `/can-register` | ADMIN | Ferova Clinic (Flutter) |
| POST `/assign-nurse` | ADMIN | Ferova Clinic (Flutter) |
| GET `/nurses/unassigned` | ADMIN | Ferova Clinic (Flutter) |
| GET `/districts` | ADMIN | Ferova Clinic (Flutter) |
| POST `/appointments` | MOTHER | Ferova Family (Kotlin) |
| PUT `/appointments/cancel` | MOTHER | Ferova Family (Kotlin) |
| GET `/nearby` | MOTHER | Ferova Family (Kotlin) |
| GET `/patient/:patientId/appointments` | MOTHER | Ferova Family (Kotlin) |
| GET `/appointments/mother/next` | MOTHER | Ferova Family (Kotlin) |
| GET `/appointments/nurse` | NURSE | Ferova Clinic (Flutter) |

### Endpoints públicos (sin token)

| Endpoint | App que lo consume |
|----------|--------------------|
| GET `/:id` | Ferova Family (Kotlin) |
| GET `/:facilityId/available-slots` | Ferova Family (Kotlin) |

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

### Ferova Clinic (Flutter) — Admin listar postas

| Elemento | Detalle |
|----------|---------|
| Propósito | Admin visualiza todas las postas con su estado de asignación |
| Endpoint | `GET /` (requiere token de admin) |
| Flujo | Obtener lista → Mostrar en cards → Botón "Asignar" si no tiene enfermero |

### Ferova Clinic (Flutter) — Admin verificar disponibilidad

| Elemento | Detalle |
|----------|---------|
| Propósito | Verificar si hay enfermeros libres antes de mostrar formulario |
| Endpoint | `GET /can-register` (requiere token de admin) |
| Flujo | Verificar disponibilidad → Habilitar/deshabilitar botón "Registrar Posta" |

### Ferova Clinic (Flutter) — Admin asignar enfermero

| Elemento | Detalle                                                                                                         |
|----------|-----------------------------------------------------------------------------------------------------------------|
| Propósito | Admin asigna un enfermero a una posta                                                                           |
| Flujo | Lista de postas → Botón "Asignar" → Ver lista de enfermeros sin postas -> selecionar a un enfermero → Confirmar |
| Endpoints | `GET /nurses/unassigned` y `POST /assign-nurse`                                                                 |
| Validaciones | Una posta = un enfermero, un enfermero = una posta                                                              |

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

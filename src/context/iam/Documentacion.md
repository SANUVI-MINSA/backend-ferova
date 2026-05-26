# API Documentation — Ferova User Module

> Módulo que gestiona todo lo relacionado con usuarios en **Ferova Family** (madres) y **Ferova Clinic** (enfermeras y administradores).

---

## Flujo básico de uso

```
1. Registro      → El usuario crea una cuenta (madre o staff)
2. Login         → Obtiene un token JWT
3. Uso del token → Se envía en requests autenticadas
4. Recuperación  → Solicita código → Verifica → Restablece contraseña
```

---

## Base URL

```
https://tu-api-domain.com/api/users
```

---

## Autenticación con Token JWT

Después de hacer login, guarda el token y envíalo en todas las requests que lo requieran.

### Formato del Header

```
Authorization: Bearer <tu-token-aqui>
```

### Estructura del Token (payload decodificado)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` | UUID del usuario |
| `email` | `string` | Email del usuario |
| `role` | `string` | `Mother`, `Nurse` o `Admin` |
| `motherId` | `string \| null` | Si es madre, contiene su ID; si no, `null` |
| `nurseId` | `string \| null` | Si es enfermera, contiene su ID; si no, `null` |

### Ejemplos de token por rol

**Madre (`Mother`):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "diana@gmail.com",
  "role": "Mother",
  "motherId": "550e8400-e29b-41d4-a716-446655440000",
  "nurseId": null
}
```

**Enfermera (`Nurse`):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "email": "laura@gmail.com",
  "role": "Nurse",
  "motherId": null,
  "nurseId": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Administrador (`Admin`):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "email": "admin@gmail.com",
  "role": "Admin",
  "motherId": null,
  "nurseId": null
}
```

---

## Resumen de Endpoints

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/register/mother` | Crear cuenta de madre | No |
| `POST` | `/register/staff` | Crear cuenta de enfermera o administrador | No |
| `POST` | `/login` | Autenticar y obtener token JWT | No |
| `GET` | `/{id}` | Obtener información de un usuario por su ID | No |
| `POST` | `/password/request-code` | Enviar código de recuperación al email | No |
| `POST` | `/password/verify-code` | Validar que el código de recuperación sea correcto | No |
| `POST` | `/password/reset` | Cambiar la contraseña usando el código validado | No |

---

## Endpoints Detallados

### 1. `POST /register/mother` — Registrar Madre

Crea una nueva cuenta para una madre en Ferova Family.

#### Request Body

```json
{
  "name": "Diana",
  "lastname": "Carrillo",
  "dni": "12345678",
  "email": "diana@gmail.com",
  "phone": "+51 987654321",
  "password": "Password123@"
}
```

#### Response `201`

```json
{
  "message": "Mother registered successfully"
}
```

#### Errores `400`

```json
{ "error": "User already exists" }
{ "error": "DNI must contain exactly 8 numeric digits" }
{ "error": "Invalid email format" }
{ "error": "Phone must follow format: +51 987654321" }
{ "error": "Password must contain uppercase, lowercase, number and symbol" }
```

---

### 2. `POST /register/staff` — Registrar Staff (Enfermera/Administrador)

Crea cuentas para personal de Ferova Clinic.

#### Request Body

```json
{
  "name": "Laura",
  "lastname": "Perez",
  "dni": "87654321",
  "email": "laura@gmail.com",
  "phone": "+51 912345678",
  "password": "Staff123@",
  "role": "Nurse"
}
```

| Campo | Valores permitidos |
|-------|--------------------|
| `role` | `"Nurse"` o `"Admin"` |

#### Response `201`

```json
{
  "message": "Staff user registered successfully"
}
```

#### Errores `400`

```json
{ "error": "Invalid staff role" }
```

---

### 3. `POST /login` — Iniciar Sesión

Autentica a cualquier usuario y devuelve un token JWT.

#### Request Body

```json
{
  "dni": "12345678",
  "password": "Password123@"
}
```

#### Response `200`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Errores `400`

```json
{ "error": "User not found" }
{ "error": "Invalid credentials" }
```

---

### 4. `GET /{id}` — Obtener Usuario por ID

Obtiene la información pública de un usuario por su UUID.

#### Path Parameters

| Parámetro | Ubicación | Descripción |
|-----------|-----------|-------------|
| `id` | Path | UUID del usuario a buscar |

#### Response `200`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Diana",
  "lastname": "Carrillo",
  "role": "Mother",
  "dni": "12345678",
  "email": "diana@gmail.com",
  "phone": "+51987654321"
}
```

#### Errores

| Código | Respuesta |
|--------|-----------|
| `404` | `{ "error": "User not found" }` |
| `400` | `{ "error": "User id is required" }` |

---

### 5. `POST /password/request-code` — Solicitar Código de Recuperación

Envía un código de 4 dígitos al correo del usuario.

#### Request Body

```json
{
  "email": "diana@gmail.com"
}
```

#### Response `200`

```json
{
  "message": "Reset code sent successfully"
}
```

#### Errores `400`

```json
{ "error": "User not found" }
```

---

### 6. `POST /password/verify-code` — Verificar Código de Recuperación

Valida que el código ingresado sea correcto y no esté expirado.

> ⏱️ El código es válido por **10 minutos**.

#### Request Body

```json
{
  "email": "diana@gmail.com",
  "code": "4832"
}
```

#### Response `200`

```json
{
  "message": "Code verified successfully"
}
```

#### Errores `400`

```json
{ "error": "Invalid or expired code" }
```

---

### 7. `POST /password/reset` — Restablecer Contraseña

Cambia la contraseña del usuario después de verificar el código.

#### Request Body

```json
{
  "email": "diana@gmail.com",
  "code": "4832",
  "newPassword": "Nueva123@"
}
```

#### Response `200`

```json
{
  "message": "Password reset successfully"
}
```

#### Errores `400`

```json
{ "error": "Invalid or expired code" }
```

---

## Reglas de Validación de Campos

| Campo | Regla |
|-------|-------|
| `name` | Requerido, no puede estar vacío |
| `lastname` | Requerido, no puede estar vacío |
| `dni` | 8 dígitos numéricos exactos |
| `email` | Formato válido, se guarda en minúsculas |
| `phone` | Formato `+51 987654321` (9 dígitos después del espacio) |
| `password` | Mínimo 8 caracteres, mayúscula, minúscula, número y símbolo (`@$!%*?&`) |

---

## Códigos de Respuesta HTTP

| Código | Significado | Cuándo ocurre |
|--------|-------------|---------------|
| `200` | OK | Operación exitosa |
| `201` | Created | Recurso creado exitosamente |
| `400` | Bad Request | Error en los datos enviados |
| `401` | Unauthorized | Token no proporcionado o inválido |
| `404` | Not Found | Recurso no encontrado |
| `500` | Internal Server Error | Error en el servidor |

---

## Ejemplos de Implementación

### Kotlin — Ferova Family (Android)

#### 1. Guardar el token después del login

```kotlin
class TokenManager(context: Context) {
    private val prefs = context.getSharedPreferences("auth", Context.MODE_PRIVATE)

    fun saveToken(token: String) {
        prefs.edit().putString("jwt_token", token).apply()
    }

    fun getToken(): String? = prefs.getString("jwt_token", null)

    fun clearToken() {
        prefs.edit().remove("jwt_token").apply()
    }
}
```

#### 2. Cliente HTTP con token automático

```kotlin
class ApiClient(private val tokenManager: TokenManager) {
    private val client = OkHttpClient.Builder()
        .addInterceptor { chain ->
            val original = chain.request()
            val requestBuilder = original.newBuilder()

            tokenManager.getToken()?.let { token ->
                requestBuilder.header("Authorization", "Bearer $token")
            }

            requestBuilder.method(original.method, original.body)
            chain.proceed(requestBuilder.build())
        }
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        })
        .build()

    fun getClient(): OkHttpClient = client
}
```

#### 3. Login y guardado del token

```kotlin
suspend fun login(dni: String, password: String): Boolean {
    val client = HttpClient(Android)

    val response: HttpResponse = client.post("$BASE_URL/login") {
        contentType(ContentType.Application.Json)
        setBody(buildJsonObject {
            put("dni", dni)
            put("password", password)
        })
    }

    return if (response.status == HttpStatusCode.OK) {
        val responseBody = response.body<JsonObject>()
        val token = responseBody["token"]?.jsonPrimitive?.content
        tokenManager.saveToken(token ?: return false)
        true
    } else {
        false
    }
}
```

#### 4. Obtener usuario por ID

```kotlin
suspend fun getUserById(userId: String): User? {
    val request = Request.Builder()
        .url("$BASE_URL/$userId")
        .get()
        .build()

    val response = apiClient.getClient().newCall(request).execute()

    return if (response.isSuccessful) {
        val json = JSONObject(response.body?.string() ?: return null)
        User(
            id = json.getString("id"),
            name = json.getString("name"),
            lastname = json.getString("lastname"),
            role = json.getString("role"),
            dni = json.getString("dni"),
            email = json.getString("email"),
            phone = json.getString("phone")
        )
    } else null
}
```

---

### Flutter — Ferova Clinic (Dart)

#### 1. Guardar el token después del login

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenService {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Future<void> saveToken(String token) async =>
      await _storage.write(key: 'jwt_token', value: token);

  Future<String?> getToken() async =>
      await _storage.read(key: 'jwt_token');

  Future<void> clearToken() async =>
      await _storage.delete(key: 'jwt_token');
}
```

#### 2. Interceptor de Dio para el token

```dart
class AuthInterceptor extends Interceptor {
  final TokenService tokenService;

  AuthInterceptor(this.tokenService);

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await tokenService.getToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    return handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.response?.statusCode == 401) {
      tokenService.clearToken();
      // Emitir evento para redirigir al login
    }
    return handler.next(err);
  }
}
```

#### 3. Configurar el cliente HTTP

```dart
class ApiClient {
  late final Dio _dio;
  final TokenService tokenService;

  ApiClient(this.tokenService) {
    _dio = Dio(BaseOptions(
      baseUrl: 'https://tu-api-domain.com/api/users',
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {'Content-Type': 'application/json'},
    ));

    _dio.interceptors.add(AuthInterceptor(tokenService));
    _dio.interceptors.add(LogInterceptor(requestBody: true, responseBody: true));
  }

  Dio get dio => _dio;
}
```

#### 4. Login y guardado del token

```dart
class AuthRepository {
  final ApiClient apiClient;
  final TokenService tokenService;

  AuthRepository(this.apiClient, this.tokenService);

  Future<bool> login(String dni, String password) async {
    try {
      final response = await apiClient.dio.post('/login', data: {
        'dni': dni,
        'password': password,
      });

      if (response.statusCode == 200) {
        await tokenService.saveToken(response.data['token'] as String);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<Map<String, dynamic>?> getUserById(String userId) async {
    try {
      final response = await apiClient.dio.get('/$userId');
      return response.statusCode == 200 ? response.data : null;
    } catch (e) {
      return null;
    }
  }
}
```

#### 5. Uso con Riverpod

```dart
final authRepositoryProvider = Provider((ref) {
  final tokenService = TokenService();
  final apiClient = ApiClient(tokenService);
  return AuthRepository(apiClient, tokenService);
});

class LoginScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: ElevatedButton(
          onPressed: () async {
            final authRepo = ref.read(authRepositoryProvider);
            final success = await authRepo.login('12345678', 'Password123@');

            if (success) {
              Navigator.pushReplacementNamed(context, '/home');
            } else {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Login failed')),
              );
            }
          },
          child: const Text('Login'),
        ),
      ),
    );
  }
}
```

---

## Preguntas Frecuentes

**¿Cuándo expira el token?**
El token tiene una validez de **1 día**. Después el usuario debe volver a hacer login.

**¿Qué hago si el token expira?**
Maneja el error `401` en tu app y redirige al usuario a la pantalla de login.

**¿Puedo obtener mi propio perfil sin pasar el ID?**
Actualmente no hay un endpoint `/profile/me`. Usa `GET /{id}` con tu propio ID obtenido del token.

**¿Cuánto dura el código de recuperación?**
El código es válido por **10 minutos**. Después debes solicitar uno nuevo.
# Nutritional Diary API — Ferova Family (Kotlin/Android)

> Bounded Context de Nutrición para la aplicación **Ferova Family**.
> Permite registrar el consumo de alimentos de los pacientes y hacer seguimiento del hierro absorbido.

---

## Funcionalidades

- Registrar consumo de alimentos de los pacientes (hijos)
- Ver diario nutricional del día actual
- Ver historial de consumo (últimos 30 días)
- Explorar catálogo de alimentos por categoría
- Buscar alimentos
- Ver detalles de cada alimento

---

## Base URL

```
https://tu-api-domain.com/api/nutritional-diary
```

---

## Autenticación

Los endpoints de datos personales requieren token JWT de madre. El token se obtiene del BC de IAM (módulo de usuarios).

```
Authorization: Bearer <tu-token-de-madre>
```

| Endpoint | ¿Requiere Token? |
|----------|-----------------|
| `POST /food-entry` | ✅ Sí |
| `GET /today/{patientId}` | ✅ Sí |
| `GET /history/{patientId}` | ✅ Sí |
| `GET /foods/category/{category}` | ❌ No |
| `GET /foods/search` | ❌ No |
| `GET /foods/{foodItemId}` | ❌ No |

---

## Resumen de Endpoints

| # | Método | Endpoint | Auth |
|---|--------|----------|------|
| 1 | `POST` | `/food-entry` | ✅ Token |
| 2 | `GET` | `/today/{patientId}` | ✅ Token |
| 3 | `GET` | `/history/{patientId}` | ✅ Token |
| 4 | `GET` | `/foods/category/{category}` | ❌ Público |
| 5 | `GET` | `/foods/search` | ❌ Público |
| 6 | `GET` | `/foods/{foodItemId}` | ❌ Público |

---

## Endpoints Detallados

### 1. `POST /food-entry` — Registrar Consumo de Alimento

Registra que un paciente ha consumido un alimento y calcula el hierro absorbido.

> ⚠️ No enviar `motherId` — se obtiene automáticamente del token JWT.

#### Request Body

```json
{
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "foodItemId": "FOOD_005",
  "quantity": 150
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `patientId` | `string` | UUID del paciente (hijo de la madre) |
| `foodItemId` | `string` | ID del alimento (ej: `FOOD_001`, `FOOD_013`) |
| `quantity` | `number` | Cantidad consumida (gramos o mililitros) |

#### Response `201` — Alimento normal

```json
{
  "success": true,
  "message": "Alimento registrado exitosamente",
  "foodEntry": {
    "id": "770e8400-e29b-41d4-a716-446655440222",
    "foodName": "Carne de res",
    "quantity": 150,
    "unit": "gramos",
    "ironAbsorbed": 1.01,
    "isInhibitor": false
  },
  "newTotalIronAbsorbed": 12.45,
  "warningMessage": null
}
```

#### Response `201` — Alimento inhibidor (con advertencia)

```json
{
  "success": true,
  "message": "Alimento registrado exitosamente",
  "foodEntry": {
    "id": "770e8400-e29b-41d4-a716-446655440222",
    "foodName": "Café",
    "quantity": 200,
    "unit": "mililitros",
    "ironAbsorbed": 0,
    "isInhibitor": true
  },
  "newTotalIronAbsorbed": 12.45,
  "warningMessage": "¡Advertencia! Café puede reducir la absorción del suplemento de hierro."
}
```

#### Errores

| Código | Respuesta |
|--------|-----------|
| `400` | `{ "error": "Mother ID no encontrado en el token" }` |
| `400` | `{ "error": "Faltan campos requeridos: patientId, foodItemId, quantity" }` |
| `400` | `{ "error": "Patient not found" }` |
| `400` | `{ "error": "Food item not found" }` |
| `403` | `{ "error": "This mother is not assigned to this patient" }` |

---

### 2. `GET /today/{patientId}` — Obtener Diario de Hoy

Obtiene el resumen nutricional del día actual para un paciente.

#### Path Parameters

| Parámetro | Ubicación | Descripción |
|-----------|-----------|-------------|
| `patientId` | Path | UUID del paciente |

#### Response `200` — Con alimentos registrados

```json
{
  "diaryId": "880e8400-e29b-41d4-a716-446655440333",
  "date": "2026-05-25T00:00:00.000Z",
  "totalIronAbsorbed": 12.45,
  "foodEntries": [
    {
      "entryId": "770e8400-e29b-41d4-a716-446655440222",
      "foodName": "Carne de res",
      "quantity": 150,
      "unit": "gramos",
      "ironAbsorbed": 1.01,
      "isInhibitor": false
    },
    {
      "entryId": "770e8400-e29b-41d4-a716-446655440223",
      "foodName": "Lentejas cocidas",
      "quantity": 100,
      "unit": "gramos",
      "ironAbsorbed": 0.17,
      "isInhibitor": false
    }
  ]
}
```

#### Response `200` — Sin alimentos registrados

```json
{
  "diaryId": null,
  "date": "2026-05-25T00:00:00.000Z",
  "totalIronAbsorbed": 0,
  "foodEntries": []
}
```

#### Errores

| Código | Respuesta |
|--------|-----------|
| `400` | `{ "error": "Patient ID es requerido" }` |
| `403` | `{ "error": "Este paciente no pertenece a esta madre" }` |

---

### 3. `GET /history/{patientId}` — Obtener Historial Nutricional

Obtiene el historial de los últimos 30 días (o rango personalizado).

#### Path Parameters

| Parámetro | Ubicación | Descripción |
|-----------|-----------|-------------|
| `patientId` | Path | UUID del paciente |

#### Query Parameters

| Parámetro | Ubicación | Descripción |
|-----------|-----------|-------------|
| `startDate` | Query | (Opcional) Fecha inicio (ISO string) |
| `endDate` | Query | (Opcional) Fecha fin (ISO string) |

> Si no se envía `startDate` ni `endDate`, se devuelven los últimos **30 días**.

#### Response `200`

```json
{
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "period": {
    "startDate": "2026-04-25T00:00:00.000Z",
    "endDate": "2026-05-25T23:59:59.999Z"
  },
  "days": [
    {
      "date": "2026-05-25T00:00:00.000Z",
      "displayDate": "25 de mayo",
      "totalIronAbsorbed": 12.5,
      "hasInhibitor": true,
      "inhibitorCount": 1,
      "totalFoodEntries": 3
    },
    {
      "date": "2026-05-24T00:00:00.000Z",
      "displayDate": "24 de mayo",
      "totalIronAbsorbed": 8.3,
      "hasInhibitor": false,
      "inhibitorCount": 0,
      "totalFoodEntries": 2
    }
  ]
}
```

---

### 4. `GET /foods/category/{category}` — Alimentos por Categoría

Obtiene el catálogo de alimentos filtrado por categoría.

#### Categorías disponibles

| Nombre | Valor | Descripción |
|--------|-------|-------------|
| Carnes | `MEAT` | Res, pollo, cerdo, vísceras |
| Pescados | `FISH` | Pescados y mariscos |
| Verduras | `VEGETABLE` | Espinaca, brócoli, etc. |
| Legumbres | `LEGUME` | Lentejas, garbanzos, frijoles |
| Lácteos | `DAIRY` | Leche, yogur, queso (inhibidores) |
| Cereales | `GRAIN` | Quinua, avena, arroz |
| Frutas | `FRUIT` | Plátano, naranja, mango |
| Bebidas | `BEVERAGE` | Agua, jugos, té, café |

#### Response `200`

```json
{
  "category": "MEAT",
  "items": [
    {
      "foodItemId": "FOOD_001",
      "name": "Sangrecita de pollo",
      "ironType": "hemo",
      "ironMgPer100g": 29.5,
      "isInhibitor": false
    },
    {
      "foodItemId": "FOOD_005",
      "name": "Carne de res",
      "ironType": "hemo",
      "ironMgPer100g": 2.7,
      "isInhibitor": false
    }
  ]
}
```

---

### 5. `GET /foods/search` — Buscar Alimentos

Búsqueda de alimentos por nombre (mínimo 2 caracteres).

#### Query Parameters

| Parámetro | Ubicación | Descripción |
|-----------|-----------|-------------|
| `text` | Query | Texto a buscar (mínimo 2 caracteres) |

#### Response `200` — Con resultados

```json
{
  "searchText": "lenteja",
  "resultCount": 1,
  "items": [
    {
      "foodItemId": "FOOD_013",
      "name": "Lentejas cocidas",
      "ironType": "no-hemo",
      "ironMgPer100g": 3.3,
      "isInhibitor": false
    }
  ]
}
```

#### Response `200` — Búsqueda con menos de 2 caracteres

```json
{
  "searchText": "a",
  "resultCount": 0,
  "items": []
}
```

---

### 6. `GET /foods/{foodItemId}` — Detalle de Alimento

Obtiene información detallada de un alimento específico.

#### Path Parameters

| Parámetro | Ubicación | Descripción |
|-----------|-----------|-------------|
| `foodItemId` | Path | ID del alimento (ej: `FOOD_001`, `FOOD_013`) |

#### Response `200` — Alimento normal

```json
{
  "foodItemId": "FOOD_005",
  "name": "Carne de res",
  "ironType": "hemo",
  "ironMgPer100g": 2.7,
  "isInhibitor": false,
  "warningMessage": null,
  "defaultUnit": "gramos"
}
```

#### Response `200` — Alimento inhibidor

```json
{
  "foodItemId": "FOOD_040",
  "name": "Café",
  "ironType": "no-hemo",
  "ironMgPer100g": 0.0,
  "isInhibitor": true,
  "warningMessage": "¡Advertencia! Café puede reducir la absorción del suplemento de hierro.",
  "defaultUnit": "mililitros"
}
```

#### Errores

| Código | Respuesta |
|--------|-----------|
| `404` | `{ "error": "Food item not found" }` |

---

## Catálogo Completo de Alimentos

### 🥩 MEAT — Carnes (8 alimentos)

| ID | Nombre | Hierro (mg/100g) | Tipo |
|----|--------|-----------------|------|
| `FOOD_001` | Sangrecita de pollo | 29.5 | Hemo |
| `FOOD_002` | Bazo de res | 14.0 | Hemo |
| `FOOD_003` | Hígado de pollo | 8.5 | Hemo |
| `FOOD_004` | Hígado de res | 6.5 | Hemo |
| `FOOD_005` | Carne de res | 2.7 | Hemo |
| `FOOD_006` | Pavo | 1.8 | Hemo |
| `FOOD_007` | Huevo entero cocido | 1.8 | No-Hemo |
| `FOOD_008` | Pollo | 1.3 | Hemo |

### 🐟 FISH — Pescados (4 alimentos)

| ID | Nombre | Hierro (mg/100g) | Tipo |
|----|--------|-----------------|------|
| `FOOD_009` | Anchoveta | 3.2 | Hemo |
| `FOOD_010` | Sardina en conserva | 2.9 | Hemo |
| `FOOD_011` | Atún en conserva | 1.9 | Hemo |
| `FOOD_012` | Bonito | 1.5 | Hemo |

### 🫘 LEGUME — Legumbres (5 alimentos)

| ID | Nombre | Hierro (mg/100g) | Tipo |
|----|--------|-----------------|------|
| `FOOD_013` | Lentejas cocidas | 3.3 | No-Hemo |
| `FOOD_014` | Garbanzos cocidos | 2.9 | No-Hemo |
| `FOOD_015` | Pallares cocidos | 2.5 | No-Hemo |
| `FOOD_016` | Frijoles cocidos | 2.1 | No-Hemo |
| `FOOD_017` | Arvejas cocidas | 1.8 | No-Hemo |

### 🥦 VEGETABLE — Verduras (7 alimentos)

| ID | Nombre | Hierro (mg/100g) | Tipo |
|----|--------|-----------------|------|
| `FOOD_018` | Espinaca cocida | 2.8 | No-Hemo |
| `FOOD_019` | Acelga cocida | 1.8 | No-Hemo |
| `FOOD_020` | Brócoli cocido | 0.7 | No-Hemo |
| `FOOD_021` | Camote cocido | 0.7 | No-Hemo |
| `FOOD_022` | Papa cocida | 0.5 | No-Hemo |
| `FOOD_023` | Zanahoria cocida | 0.4 | No-Hemo |
| `FOOD_024` | Zapallo cocido | 0.4 | No-Hemo |

### 🌾 GRAIN — Cereales/Granos (5 alimentos)

| ID | Nombre | Hierro (mg/100g) | Tipo |
|----|--------|-----------------|------|
| `FOOD_025` | Kiwicha cocida | 3.1 | No-Hemo |
| `FOOD_026` | Pan de trigo | 2.5 | No-Hemo |
| `FOOD_027` | Avena cocida | 1.7 | No-Hemo |
| `FOOD_028` | Quinua cocida | 1.5 | No-Hemo |
| `FOOD_029` | Arroz cocido | 0.2 | No-Hemo |

### 🍎 FRUIT — Frutas (6 alimentos)

| ID | Nombre | Hierro (mg/100g) | Tipo |
|----|--------|-----------------|------|
| `FOOD_030` | Lúcuma | 0.4 | No-Hemo |
| `FOOD_031` | Plátano | 0.3 | No-Hemo |
| `FOOD_032` | Naranja | 0.1 | No-Hemo |
| `FOOD_033` | Mandarina | 0.1 | No-Hemo |
| `FOOD_034` | Mango | 0.1 | No-Hemo |
| `FOOD_035` | Papaya | 0.1 | No-Hemo |

### 🥛 DAIRY — Lácteos ⚠️ INHIBIDORES

> Los lácteos contienen calcio, que **reduce la absorción del hierro**.

| ID | Nombre | Hierro (mg/100g) | Inhibidor |
|----|--------|-----------------|-----------|
| `FOOD_036` | Queso fresco | 0.2 | ✅ Sí |
| `FOOD_037` | Leche de vaca | 0.1 | ✅ Sí |
| `FOOD_038` | Yogur | 0.1 | ✅ Sí |

### ☕ BEVERAGE — Bebidas

> El té y el café contienen taninos, que **inhiben la absorción del hierro**.

| ID | Nombre | Hierro (mg/100g) | Inhibidor |
|----|--------|-----------------|-----------|
| `FOOD_039` | Té | 0.0 | ✅ Sí |
| `FOOD_040` | Café | 0.0 | ✅ Sí |
| `FOOD_041` | Jugo de naranja | 0.1 | ❌ No |
| `FOOD_042` | Agua | 0.0 | ❌ No |

### Resumen del catálogo

| Categoría | Cantidad | Inhibidores |
|-----------|----------|-------------|
| MEAT | 8 | 0 |
| FISH | 4 | 0 |
| LEGUME | 5 | 0 |
| VEGETABLE | 7 | 0 |
| GRAIN | 5 | 0 |
| FRUIT | 6 | 0 |
| DAIRY | 3 | 3 |
| BEVERAGE | 4 | 2 |
| **TOTAL** | **42** | **5** |

### 🥇 Top 10 Alimentos con Más Hierro

| # | ID | Alimento | Hierro (mg/100g) |
|---|----|----------|-----------------|
| 1 | `FOOD_001` | Sangrecita de pollo | 29.5 |
| 2 | `FOOD_002` | Bazo de res | 14.0 |
| 3 | `FOOD_003` | Hígado de pollo | 8.5 |
| 4 | `FOOD_004` | Hígado de res | 6.5 |
| 5 | `FOOD_013` | Lentejas cocidas | 3.3 |
| 6 | `FOOD_009` | Anchoveta | 3.2 |
| 7 | `FOOD_025` | Kiwicha cocida | 3.1 |
| 8 | `FOOD_010` | Sardina en conserva | 2.9 |
| 9 | `FOOD_014` | Garbanzos cocidos | 2.9 |
| 10 | `FOOD_018` | Espinaca cocida | 2.8 |

---

## Cálculo de Hierro Absorbido

### Fórmulas

| Tipo de Hierro | Absorción | Fórmula |
|----------------|-----------|---------|
| Hemo | 25% | `(ironMg / 100 × quantity) × 0.25` |
| No-Hemo | 5% | `(ironMg / 100 × quantity) × 0.05` |

### Ejemplos

**Carne de res (`FOOD_005`):**
- Hierro por 100g: `2.7 mg`
- Cantidad: `150g`
- Hierro total: `(2.7 / 100 × 150) = 4.05 mg`
- Hierro absorbido: `4.05 × 0.25 = 1.01 mg`

**Lentejas cocidas (`FOOD_013`):**
- Hierro por 100g: `3.3 mg`
- Cantidad: `100g`
- Hierro total: `(3.3 / 100 × 100) = 3.3 mg`
- Hierro absorbido: `3.3 × 0.05 = 0.17 mg`

---

## Recomendaciones para el Frontend

### Mostrar advertencias visuales

Cuando `isInhibitor: true`, mostrar ícono ⚠️ y el `warningMessage` devuelto por el backend.

### Unidad por defecto según categoría

| Categoría | Unidad |
|-----------|--------|
| `BEVERAGE` | mililitros |
| `DAIRY` (leche, yogur) | mililitros |
| `DAIRY` (queso) | gramos |
| Todas las demás | gramos |

### Orden de alimentos

Mostrar por defecto ordenados por mayor contenido de hierro (`ironMgPer100g` descendente).

### Tips educativos

- 💡 El hierro **Hemo** (carnes y pescados) se absorbe mejor que el No-Hemo.
- 💡 Consumir **vitamina C** (naranja, limón) ayuda a absorber más hierro.
- ⚠️ Evitar **té, café o lácteos** durante las comidas principales.

---

## Implementación en Kotlin

### Modelos de Datos

```kotlin
data class RegisterFoodEntryRequest(
    val patientId: String,
    val foodItemId: String,
    val quantity: Int
)

data class FoodEntryResponse(
    val success: Boolean,
    val message: String,
    val foodEntry: FoodEntryData,
    val newTotalIronAbsorbed: Double,
    val warningMessage: String?
)

data class FoodEntryData(
    val id: String,
    val foodName: String,
    val quantity: Int,
    val unit: String,
    val ironAbsorbed: Double,
    val isInhibitor: Boolean
)

data class TodayDiaryResponse(
    val diaryId: String?,
    val date: String,
    val totalIronAbsorbed: Double,
    val foodEntries: List<FoodEntryItem>
)

data class FoodEntryItem(
    val entryId: String,
    val foodName: String,
    val quantity: Int,
    val unit: String,
    val ironAbsorbed: Double,
    val isInhibitor: Boolean
)

data class CategoryFoodResponse(
    val category: String,
    val items: List<FoodItemSummary>
)

data class FoodItemSummary(
    val foodItemId: String,
    val name: String,
    val ironType: String,
    val ironMgPer100g: Double,
    val isInhibitor: Boolean
)

data class FoodItemDetailsResponse(
    val foodItemId: String,
    val name: String,
    val ironType: String,
    val ironMgPer100g: Double,
    val isInhibitor: Boolean,
    val warningMessage: String?,
    val defaultUnit: String
)

data class NutritionalHistoryResponse(
    val patientId: String,
    val period: Period,
    val days: List<DaySummary>
)

data class Period(
    val startDate: String,
    val endDate: String
)

data class DaySummary(
    val date: String,
    val displayDate: String,
    val totalIronAbsorbed: Double,
    val hasInhibitor: Boolean,
    val inhibitorCount: Int,
    val totalFoodEntries: Int
)
```

### Servicio API

```kotlin
class NutritionalDiaryService(private val tokenManager: TokenManager) {

    private val client = OkHttpClient.Builder()
        .addInterceptor { chain ->
            val request = chain.request().newBuilder()
            tokenManager.getToken()?.let { token ->
                request.header("Authorization", "Bearer $token")
            }
            chain.proceed(request.build())
        }
        .build()

    private val gson = Gson()
    private val baseUrl = "https://tu-api-domain.com/api/nutritional-diary"

    // ── Endpoints autenticados ──────────────────────────────────────────────

    suspend fun registerFoodEntry(
        patientId: String,
        foodItemId: String,
        quantity: Int
    ): Result<FoodEntryResponse> = withContext(Dispatchers.IO) {
        try {
            val body = mapOf(
                "patientId" to patientId,
                "foodItemId" to foodItemId,
                "quantity" to quantity
            )
            val request = Request.Builder()
                .url("$baseUrl/food-entry")
                .post(JSONObject(body).toString().toRequestBody())
                .build()
            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                Result.success(gson.fromJson(response.body?.string(), FoodEntryResponse::class.java))
            } else {
                Result.failure(Exception("Error: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getTodayDiary(patientId: String): Result<TodayDiaryResponse> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder().url("$baseUrl/today/$patientId").get().build()
            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                Result.success(gson.fromJson(response.body?.string(), TodayDiaryResponse::class.java))
            } else {
                Result.failure(Exception("Error: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getNutritionalHistory(patientId: String): Result<NutritionalHistoryResponse> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder().url("$baseUrl/history/$patientId").get().build()
            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                Result.success(gson.fromJson(response.body?.string(), NutritionalHistoryResponse::class.java))
            } else {
                Result.failure(Exception("Error: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ── Endpoints públicos (sin token) ──────────────────────────────────────

    private val publicClient = OkHttpClient()

    suspend fun getFoodsByCategory(category: String): Result<CategoryFoodResponse> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder().url("$baseUrl/foods/category/$category").get().build()
            val response = publicClient.newCall(request).execute()
            if (response.isSuccessful) {
                Result.success(gson.fromJson(response.body?.string(), CategoryFoodResponse::class.java))
            } else {
                Result.failure(Exception("Error: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun searchFoods(searchText: String): Result<SearchFoodResponse> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder().url("$baseUrl/foods/search?text=$searchText").get().build()
            val response = publicClient.newCall(request).execute()
            if (response.isSuccessful) {
                Result.success(gson.fromJson(response.body?.string(), SearchFoodResponse::class.java))
            } else {
                Result.failure(Exception("Error: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getFoodItemDetails(foodItemId: String): Result<FoodItemDetailsResponse> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder().url("$baseUrl/foods/$foodItemId").get().build()
            val response = publicClient.newCall(request).execute()
            if (response.isSuccessful) {
                Result.success(gson.fromJson(response.body?.string(), FoodItemDetailsResponse::class.java))
            } else {
                Result.failure(Exception("Error: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```

### ViewModel

```kotlin
class NutritionalDiaryViewModel(
    private val service: NutritionalDiaryService
) : ViewModel() {

    private val _todayDiary = MutableStateFlow<TodayDiaryResponse?>(null)
    val todayDiary: StateFlow<TodayDiaryResponse?> = _todayDiary

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error

    private val _warning = MutableStateFlow<String?>(null)
    val warning: StateFlow<String?> = _warning

    fun loadTodayDiary(patientId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            service.getTodayDiary(patientId)
                .onSuccess { _todayDiary.value = it }
                .onFailure { _error.value = it.message }
            _isLoading.value = false
        }
    }

    fun registerFoodEntry(patientId: String, foodItemId: String, quantity: Int) {
        viewModelScope.launch {
            _isLoading.value = true
            _warning.value = null
            service.registerFoodEntry(patientId, foodItemId, quantity)
                .onSuccess { response ->
                    response.warningMessage?.let { _warning.value = it }
                    loadTodayDiary(patientId)
                }
                .onFailure { _error.value = it.message }
            _isLoading.value = false
        }
    }
}
```

---

## Script de Seed

Para poblar la base de datos con el catálogo de alimentos:

```bash
npm run seed:foods
```
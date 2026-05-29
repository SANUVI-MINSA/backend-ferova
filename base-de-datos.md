# Configuración de Bases de Datos

## Entornos disponibles

Se utilizan **dos bases de datos separadas** para mantener un flujo de trabajo profesional y ordenado.

---

### 🟢 Producción (`ferova_prod`)

Base de datos utilizada por el aplicativo móvil en producción. **Solo debe contener datos reales de usuarios finales.**

```env
MONGO_URI=mongodb+srv://ferova:ferova123@cluster0.eks3jqe.mongodb.net/ferova_prod?appName=Cluster0
```

---

### 🧪 Testing (`ferova_test`)

Base de datos destinada al desarrollo y pruebas. Aquí se trabaja con **datos inventados** para validar endpoints sin afectar el entorno productivo.

```env
MONGO_URI=mongodb+srv://ferova:ferova123@cluster0.eks3jqe.mongodb.net/ferova_test?appName=Cluster0
```

---

## ¿Por qué dos bases de datos?

| Aspecto | `ferova_test` | `ferova_prod` |
|---|---|---|
| **Propósito** | Desarrollo y pruebas | Aplicativo móvil en vivo |
| **Datos** | Inventados / ficticios | Datos reales de usuarios |
| **Uso** | Validar endpoints GET y POST | Servir a los usuarios finales |
| **Riesgo** | Bajo (datos desechables) | Alto (datos sensibles) |

---

## Flujo de trabajo recomendado

1. **Siempre** conectarse a `ferova_test` durante el desarrollo.
2. Probar que los endpoints GET y POST retornen y almacenen correctamente los datos esperados.
3. Una vez validado, los cambios pasan a producción usando `ferova_prod`.
4. **Nunca** usar `ferova_prod` para pruebas o datos de relleno.

> ⚠️ **Importante:** Ambas bases de datos tienen la misma estructura. La única diferencia es el tipo de datos que contienen y quién las consume.
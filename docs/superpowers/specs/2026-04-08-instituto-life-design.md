# Instituto Life — Especificacion de Diseno

## Contexto

La organizacion Casa del Rey opera una academia llamada **Instituto Life** donde se imparten cursos con distintas modalidades de evaluacion, asistencia y avance. Actualmente se necesitan dos cursos (ADL y PEC), cada uno con reglas de evaluacion completamente diferentes. El modulo debe integrarse al sistema Noah existente, permitiendo que cualquier usuario de la iglesia pueda participar como estudiante, maestro o coordinador sin perder su rol eclesiastico original.

**Problema que resuelve:** No existe forma de gestionar inscripciones, asistencia, calificaciones ni avance academico dentro de Noah. Todo se hace manualmente.

**Resultado esperado:** Un modulo completo donde estudiantes se inscriben, maestros gestionan sus clases, y administradores supervisan todo el instituto desde una interfaz integrada.

---

## 1. Modelo de Datos

### 1.1 Enfoque: Semi-flexible con JSON para configuracion de evaluacion

Datos operacionales (asistencia, notas, inscripciones) en columnas tipadas. Reglas de evaluacion del curso en campo JSON configurable, permitiendo cursos futuros sin migraciones.

### 1.2 Nuevas Tablas

#### ILCourse — Definicion del curso

| Campo | Tipo | Descripcion |
|---|---|---|
| id | String @id @default(cuid()) | |
| name | String | "ADL", "PEC" |
| slug | String @unique | "adl", "pec" |
| description | String? | Descripcion del curso |
| imageUrl | String? | Imagen representativa |
| evaluationType | String | `'graded'` o `'pass_fail'` |
| evaluationConfig | Json | Configuracion de evaluacion (ver ejemplos abajo) |
| isActive | Boolean @default(true) | |
| organizationId | String (FK) | |
| createdAt / updatedAt | DateTime | |

**evaluationConfig para ADL (graded):**
```json
{
  "type": "weighted",
  "passingGrade": 70,
  "components": [
    { "key": "test", "label": "Test", "weight": 0.40 },
    { "key": "lectura", "label": "Lectura de libro", "weight": 0.35 },
    { "key": "asistencia", "label": "Asistencia", "weight": 0.15 },
    { "key": "participacion", "label": "Participacion", "weight": 0.10 }
  ]
}
```

**evaluationConfig para PEC (pass_fail):**
```json
{
  "type": "attendance_threshold",
  "maxAbsencesPerLevel": 1,
  "failOnExceed": "course"
}
```

#### ILLevel — Niveles/Pilares del curso

| Campo | Tipo | Descripcion |
|---|---|---|
| id | String @id @default(cuid()) | |
| courseId | String (FK → ILCourse) | |
| name | String | "Principios del creyente", "Identidad" |
| slug | String | "nivel-1", "pilar-1" |
| sortOrder | Int | Orden secuencial |
| sessionCount | Int | Cantidad de sesiones (13, 9, 5, etc.) |
| evaluationConfig | Json? | Override opcional del config del curso |
| prerequisiteLevelId | String? (FK → ILLevel) | Nivel previo requerido (null = primero) |
| isActive | Boolean @default(true) | |
| createdAt / updatedAt | DateTime | |
| @@unique([courseId, slug]) | | |

#### ILCohort — Instancia de un nivel en un periodo

| Campo | Tipo | Descripcion |
|---|---|---|
| id | String @id @default(cuid()) | |
| levelId | String (FK → ILLevel) | |
| teacherId | String (FK → User) | Maestro asignado |
| name | String? | Nombre descriptivo opcional ("ADL N1 - Enero 2026") |
| weekDay | String | "lunes", "martes", ..., "domingo" |
| startTime | String | "09:00", "19:00" |
| startDate | DateTime @db.Date | |
| endDate | DateTime @db.Date | |
| maxCapacity | Int | Cupo maximo |
| status | String @default("upcoming") | `'upcoming'`, `'active'`, `'completed'`, `'cancelled'` |
| organizationId | String (FK) | |
| createdAt / updatedAt | DateTime | |

#### ILSession — Sesion individual (auto-generada)

| Campo | Tipo | Descripcion |
|---|---|---|
| id | String @id @default(cuid()) | |
| cohortId | String (FK → ILCohort) | |
| sessionNumber | Int | 1, 2, 3... |
| scheduledDate | DateTime @db.Date | Fecha calculada |
| topic | String? | Tema de la leccion |
| status | String @default("scheduled") | `'scheduled'`, `'completed'`, `'cancelled'` |
| createdAt / updatedAt | DateTime | |
| @@unique([cohortId, sessionNumber]) | | |

#### ILEnrollment — Inscripcion de estudiante

| Campo | Tipo | Descripcion |
|---|---|---|
| id | String @id @default(cuid()) | |
| userId | String (FK → User) | |
| cohortId | String (FK → ILCohort) | |
| status | String @default("pending") | `'pending'`, `'approved'`, `'rejected'`, `'active'`, `'completed'`, `'failed'`, `'withdrawn'` |
| enrolledAt | DateTime @default(now()) | Fecha de solicitud |
| approvedAt | DateTime? | |
| approvedById | String? (FK → User) | Quien aprobo |
| completedAt | DateTime? | |
| finalGrade | Decimal? @db.Decimal(5,2) | Nota final (solo graded) |
| passed | Boolean? | Resultado final |
| createdAt / updatedAt | DateTime | |
| @@unique([userId, cohortId]) | | Un enrollment por usuario por cohorte |

#### ILAttendance — Asistencia por sesion

| Campo | Tipo | Descripcion |
|---|---|---|
| id | String @id @default(cuid()) | |
| sessionId | String (FK → ILSession) | |
| enrollmentId | String (FK → ILEnrollment) | |
| present | Boolean | |
| markedById | String (FK → User) | Maestro que registro |
| markedAt | DateTime @default(now()) | |
| @@unique([sessionId, enrollmentId]) | | Un registro por estudiante por sesion |

#### ILGrade — Nota por componente (solo cursos graded)

| Campo | Tipo | Descripcion |
|---|---|---|
| id | String @id @default(cuid()) | |
| enrollmentId | String (FK → ILEnrollment) | |
| component | String | Clave del componente: "test", "lectura", etc. |
| score | Decimal @db.Decimal(5,2) | Nota 0-100 |
| gradedById | String (FK → User) | |
| gradedAt | DateTime @default(now()) | |
| @@unique([enrollmentId, component]) | | Una nota por componente por enrollment |

#### ILBadge — Insignias ganadas

| Campo | Tipo | Descripcion |
|---|---|---|
| id | String @id @default(cuid()) | |
| userId | String (FK → User) | |
| badgeType | String | `'course_completed'`, `'level_completed'` |
| courseId | String (FK → ILCourse) | |
| levelId | String? (FK → ILLevel) | null si es badge de curso completo |
| earnedAt | DateTime @default(now()) | |
| @@unique([userId, badgeType, courseId, levelId]) | | Sin duplicados |

#### ILUserTag — Tags de rol del instituto (many-to-many)

| Campo | Tipo | Descripcion |
|---|---|---|
| id | String @id @default(cuid()) | |
| userId | String (FK → User) | |
| tag | String | `'coordinador'`, `'maestro'`, `'estudiante'` |
| assignedAt | DateTime @default(now()) | |
| assignedById | String (FK → User) | Quien asigno el tag |
| isActive | Boolean @default(true) | |
| @@unique([userId, tag]) | | Un tag de cada tipo por usuario |

### 1.3 Modificaciones a modelos existentes

**User** — Agregar relaciones inversas:
- `ilTags ILUserTag[]`
- `ilEnrollments ILEnrollment[]`
- `ilBadges ILBadge[]`
- `ilCohorts ILCohort[]` (como maestro)

**Organization** — Agregar relaciones inversas:
- `ilCourses ILCourse[]`
- `ilCohorts ILCohort[]`

---

## 2. Roles y Tags del Instituto

### 2.1 Sistema de tags

Los roles del instituto son **tags acumulables** sobre el rol eclesiastico existente del usuario:

- `estudiante` — Puede inscribirse a cursos, ver su avance
- `maestro` — Puede gestionar sus cohortes, pasar lista, calificar
- `coordinador` — Supervisa multiples cursos, aprueba inscripciones, asigna maestros

Un usuario puede tener multiples tags simultaneamente (ej: maestro de ADL + estudiante de PEC).

Los admins de Noah (hierarchy <= 2) tienen acceso admin completo al instituto sin necesitar tag.

### 2.2 Extension del JWT/Session

Agregar al tipo de sesion:
```typescript
session.user.instituteTags?: string[]  // ['maestro', 'estudiante']
```

Poblado desde `ILUserTag` donde `isActive = true` durante el callback JWT de NextAuth.

---

## 3. Cursos Iniciales

### 3.1 ADL — Academia de Liderazgo

| Nivel | Nombre | Sesiones |
|---|---|---|
| 1 | Principios del creyente | 13 |
| 2 | Principios del exito | 9 |
| 3 | Principios del liderazgo | 13 |
| 4 | El modelo de Jesus | 8 |

- **Evaluacion:** Ponderada (Test 40%, Lectura 35%, Asistencia 15%, Participacion 10%)
- **Nota minima:** Configurable (default 70%)
- **Progresion:** Secuencial obligatoria (aprobar Nivel 1 → Nivel 2 → ...)
- **Notas:** Se registran una vez por nivel completo (no por leccion)
- **Asistencia:** Por sesion, maestro pasa lista

### 3.2 PEC — Programa de Edificacion del Caracter

| Pilar | Nombre | Sesiones |
|---|---|---|
| 1 | Identidad | 5 |
| 2 | Caracter | 4 |
| 3 | Proposito | 3 |

- **Evaluacion:** Aprobado/Reprobado por asistencia
- **Regla:** Pierde TODO el curso si falla a mas de X sesiones de cualquier pilar (X configurable, default 1)
- **Progresion:** Secuencial obligatoria
- **Sin notas**

---

## 4. Flujos de Usuario

### 4.1 Inscripcion

1. Estudiante navega al catalogo de cursos abiertos
2. Ve cohortes disponibles (con cupo, horario, maestro, fechas)
3. Solicita inscripcion (solo si no tiene curso activo)
4. Admin/Coordinador ve solicitudes pendientes
5. Aprueba o rechaza → enrollment pasa a `'approved'` / `'rejected'`
6. Al iniciar la cohorte, enrollments aprobados pasan a `'active'`

**Restriccion:** Un estudiante solo puede tener UN enrollment con status `'active'` a la vez.

### 4.2 Asistencia (Maestro)

1. Maestro abre su cohorte → tab "Asistencia"
2. Ve grilla: filas = estudiantes, columnas = sesiones
3. Marca presente/ausente por sesion con checkboxes
4. El sistema calcula % de asistencia automaticamente
5. Para PEC: alerta visual si un estudiante esta cerca del limite de faltas

### 4.3 Calificaciones (Maestro, solo cursos graded)

1. Maestro abre su cohorte → tab "Calificaciones"
2. Ve tabla con estudiantes y columnas por componente de evaluacion
3. Ingresa notas por componente (0-100)
4. Nota final se calcula automaticamente segun pesos del `evaluationConfig`
5. Visual: verde (aprobado), rojo (reprobado), amarillo (en riesgo)

### 4.4 Completar nivel

1. Cuando todas las sesiones se completan:
   - **Graded:** Sistema calcula nota final ponderada. Si >= passingGrade → `passed: true`
   - **Pass/fail:** Sistema verifica faltas por nivel. Si dentro del limite → `passed: true`
2. Se actualiza `ILEnrollment.passed`, `finalGrade`, `completedAt`
3. Si aprobo → se crea `ILBadge` de nivel
4. Si aprobo todos los niveles del curso → se crea `ILBadge` de curso completo

### 4.5 Progresion secuencial

- Para inscribirse al Nivel N, debe existir un `ILEnrollment` con `passed: true` para el nivel con `prerequisiteLevelId` correspondiente
- El catalogo muestra niveles bloqueados/desbloqueados visualmente

---

## 5. Vistas y UI

### 5.1 Vista Estudiante — "/dashboard/instituto/mis-cursos"

- **Card de curso activo:** Nombre, nivel, barra de progreso (sesiones completadas/total), proxima clase, maestro
- **Catalogo:** Cursos abiertos con cohortes disponibles, boton "Solicitar inscripcion"
- **Historial:** Niveles completados con badges y notas finales
- **Estado de solicitud:** Si tiene solicitud pendiente, mostrar con chip de estado

### 5.2 Vista Maestro — "/dashboard/instituto/cohortes"

- **Lista de cohortes activas** como cards (nivel, horario, inscritos/cupo)
- **Detalle de cohorte** con tabs:
  - **Estudiantes:** Lista con foto, nombre, red, grupo, estado
  - **Asistencia:** Grilla interactiva sesion x estudiante
  - **Calificaciones:** Tabla con componentes como columnas (solo graded)
  - **Avance:** Resumen visual, estudiantes en riesgo, barras de progreso

### 5.3 Vista Coordinador — "/dashboard/instituto"

Todo lo del maestro, mas:
- Ver TODAS las cohortes (no solo las propias)
- Aprobar/rechazar inscripciones
- Asignar maestros a cohortes
- Estadisticas generales del instituto

### 5.4 Vista Admin (hierarchy <= 2) — "/dashboard/instituto"

Todo lo del coordinador, mas:
- **CRUD cursos:** Crear/editar con evaluationConfig visual
- **CRUD niveles:** Cantidad de sesiones, orden, prerequisitos
- **CRUD cohortes:** Crear, asignar maestro, horario, cupo
- **Gestion de tags:** Asignar/revocar tags a usuarios
- **Dashboard:** Estadisticas globales (inscritos, aprobados, desercion)

### 5.5 Tab en perfil de usuario — "/dashboard/admin/usuarios/[id]"

Nuevo tab "Instituto Life" (icono solar-square-academic-cap-linear):
- Tags activos del usuario como chips
- Curso actual con progreso visual
- Badges ganados
- Historial de niveles completados con notas
- Estado vacio elegante si no participa en el instituto

---

## 6. Navegacion

### 6.1 Menu principal

```
Instituto Life (solar-square-academic-cap-linear)
  ├── Dashboard       → /dashboard/instituto
  ├── Cursos          → /dashboard/instituto/cursos         (admin/coordinador)
  ├── Cohortes        → /dashboard/instituto/cohortes       (admin/coordinador/maestro)
  ├── Inscripciones   → /dashboard/instituto/inscripciones  (admin/coordinador)
  └── Mis Cursos      → /dashboard/instituto/mis-cursos     (estudiante)
```

Visibilidad controlada por tags del usuario y jerarquia del rol Noah.

### 6.2 Diccionarios

Nuevas claves en `navigation`:
```json
{
  "institutoLife": "Instituto Life",
  "institutoDashboard": "Dashboard",
  "institutoCursos": "Cursos",
  "institutoCohortes": "Cohortes",
  "institutoInscripciones": "Inscripciones",
  "institutoMisCursos": "Mis Cursos"
}
```

---

## 7. Permisos

Nuevo modulo `"instituto"` en tabla Permission:

| Permiso | Acceso |
|---|---|
| `instituto.ver` | Cualquier usuario con tag activo o admin |
| `instituto.crear` | Admin, Coordinador |
| `instituto.editar` | Admin, Coordinador, Maestro (solo su cohorte) |
| `instituto.eliminar` | Admin |
| `instituto.gestionar` | Admin, Coordinador (aprobar inscripciones, tags) |
| `instituto.calificar` | Maestro (solo su cohorte) |

---

## 8. Logica de Negocio Clave

### 8.1 Motor de evaluacion (TypeScript)

Funcion `computeEnrollmentResult(enrollment, config)`:
1. Lee `evaluationConfig` del curso/nivel
2. Switch por `type`:
   - `'weighted'`: Suma (score * weight) de cada ILGrade, compara con `passingGrade`
   - `'attendance_threshold'`: Cuenta ausencias por nivel desde ILAttendance, compara con `maxAbsencesPerLevel`
3. Actualiza `ILEnrollment.finalGrade`, `passed`, `completedAt`
4. Genera ILBadge si aprobo

### 8.2 Auto-generacion de sesiones

Al crear cohorte con `startDate`, `endDate`, `weekDay`:
- Iterar con `date-fns` cada ocurrencia del `weekDay` en el rango
- Crear `ILSession` por cada fecha (hasta `sessionCount` del nivel)
- Validar que el numero de fechas >= sessionCount

### 8.3 Restriccion de curso unico

Antes de aprobar enrollment: `ILEnrollment.count({ where: { userId, status: 'active' } }) === 0`

### 8.4 Progresion secuencial

Antes de permitir inscripcion al Nivel N: verificar `ILEnrollment.findFirst({ where: { userId, cohort: { level: { id: prerequisiteLevelId } }, passed: true } })`

---

## 9. Estructura de Archivos

```
src/
├── app/
│   ├── dashboard/
│   │   └── instituto/
│   │       ├── page.tsx                    # Dashboard del instituto
│   │       ├── cursos/
│   │       │   ├── page.tsx                # Lista de cursos (admin)
│   │       │   └── [id]/page.tsx           # Detalle curso
│   │       ├── cohortes/
│   │       │   ├── page.tsx                # Lista cohortes
│   │       │   └── [id]/page.tsx           # Detalle cohorte (tabs)
│   │       ├── inscripciones/page.tsx       # Gestion inscripciones
│   │       └── mis-cursos/page.tsx          # Vista estudiante
│   └── server/
│       └── institutoActions.ts              # Server actions del modulo
├── views/
│   └── instituto/
│       ├── InstitutoDashboard.tsx            # Dashboard principal
│       ├── cursos/
│       │   ├── index.tsx                    # Lista cursos
│       │   ├── CourseDrawer.tsx             # Crear/editar curso
│       │   └── CourseDetail.tsx             # Detalle curso con niveles
│       ├── cohortes/
│       │   ├── index.tsx                    # Lista cohortes
│       │   ├── CohortDrawer.tsx            # Crear/editar cohorte
│       │   └── detail/
│       │       ├── index.tsx               # Vista cohorte con tabs
│       │       ├── CohortStudents.tsx      # Tab estudiantes
│       │       ├── CohortAttendance.tsx    # Tab asistencia (grilla)
│       │       ├── CohortGrades.tsx        # Tab calificaciones
│       │       └── CohortProgress.tsx      # Tab avance
│       ├── inscripciones/
│       │   └── index.tsx                   # Gestion de inscripciones
│       ├── mis-cursos/
│       │   └── index.tsx                   # Vista estudiante
│       └── components/
│           ├── BadgeDisplay.tsx             # Componente de badges
│           ├── ProgressBar.tsx             # Barra de progreso
│           └── EnrollmentStatusChip.tsx    # Chip de estado
├── views/admin/usuarios/detail/
│   └── ProfileInstituto.tsx                 # Tab Instituto Life en perfil
```

---

## 10. Archivos Criticos a Modificar

| Archivo | Cambio |
|---|---|
| `src/prisma/schema.prisma` | Agregar 9 nuevos modelos + relaciones en User y Organization |
| `src/libs/auth.ts` | Extender JWT/session con `instituteTags` |
| `src/app/server/helpers.ts` | Agregar `requireInstituteTag(tag)` helper |
| `src/data/navigation/verticalMenuData.tsx` | Agregar seccion Instituto Life |
| `src/data/navigation/horizontalMenuData.tsx` | Idem |
| `src/data/dictionaries/es.json` (y en, fr, ar) | Claves de navegacion e instituto |
| `src/views/admin/usuarios/detail/index.tsx` | Agregar tab "Instituto Life" |
| `src/app/server/actions.ts` | Extender `getUserFullDetails` con datos del instituto |

---

## 11. Verificacion

Para validar la implementacion end-to-end:

1. **Schema:** `prisma db push` exitoso, verificar tablas creadas en Supabase
2. **Seed:** Script para crear cursos ADL y PEC con sus niveles y evaluationConfig
3. **Auth:** Verificar que `session.user.instituteTags` se popula correctamente
4. **CRUD cursos:** Crear, editar, desactivar curso desde UI admin
5. **CRUD cohortes:** Crear cohorte, verificar sesiones auto-generadas
6. **Inscripcion:** Estudiante solicita → admin aprueba → estado cambia correctamente
7. **Restriccion curso unico:** Intentar inscribir estudiante con curso activo → debe fallar
8. **Asistencia:** Maestro pasa lista, % se calcula automaticamente
9. **Calificaciones ADL:** Ingresar notas por componente, nota final calculada correctamente
10. **PEC faltas:** Simular 2 faltas en un pilar → enrollment pasa a 'failed'
11. **Progresion:** Completar Nivel 1 → poder inscribirse a Nivel 2
12. **Badges:** Al aprobar nivel → badge aparece en perfil
13. **Tab perfil:** Verificar que el tab Instituto Life muestra datos correctos
14. **Navegacion:** Items visibles/ocultos segun tags del usuario
15. **Export:** PDF/Excel de listas de estudiantes, asistencia, calificaciones

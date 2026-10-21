# Performance Optimizations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar los principales cuellos de botella de rendimiento en la app Noah: N+1 queries en el dashboard, awaits secuenciales en layout/providers, y debug mode activo en producción.

**Architecture:** Cuatro fixes independientes sin cambios de arquitectura: (1) convertir loop con await en una sola query bulk + matching en memoria, (2) paralelizar awaits independientes con Promise.all en layout y providers, (3) paralelizar dos queries secuenciales en getDashboardStats, (4) desactivar debug mode en NextAuth. No se requieren nuevas dependencias.

**Tech Stack:** Next.js App Router, Prisma, NextAuth 4, TypeScript

---

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/app/server/dashboardActions.ts` | Fix N+1: bulk query + paralelizar currentUser con organizationId |
| `src/app/dashboard/layout.tsx` | Paralelizar 5 awaits con Promise.all |
| `src/components/Providers.tsx` | Paralelizar 3 awaits con Promise.all |
| `src/libs/auth.ts` | debug: true → debug: process.env.NODE_ENV === 'development' |

---

### Task 1: Fix debug mode en NextAuth

**Files:**
- Modify: `src/libs/auth.ts:189`

- [ ] **Step 1: Cambiar debug flag**

En `src/libs/auth.ts`, línea 189, reemplazar:

```ts
  debug: true
```

con:

```ts
  debug: process.env.NODE_ENV === 'development'
```

- [ ] **Step 2: Commit**

```bash
cd /Users/dan/Documents/Nkrease/Noah
git add src/libs/auth.ts
git commit -m "perf: disable NextAuth debug logging in production"
```

---

### Task 2: Paralelizar awaits en Providers.tsx

**Files:**
- Modify: `src/components/Providers.tsx:27-29`

`getMode()`, `getSettingsFromCookie()` y `getSystemMode()` son independientes entre sí — leen cookies distintas. Ejecutarlos en paralelo elimina la espera secuencial.

- [ ] **Step 1: Reemplazar los 3 awaits secuenciales**

En `src/components/Providers.tsx`, reemplazar:

```ts
  const mode = await getMode()
  const settingsCookie = await getSettingsFromCookie()
  const systemMode = await getSystemMode()
```

con:

```ts
  const [mode, settingsCookie, systemMode] = await Promise.all([
    getMode(),
    getSettingsFromCookie(),
    getSystemMode()
  ])
```

- [ ] **Step 2: Verificar que el archivo compila**

```bash
cd /Users/dan/Documents/Nkrease/Noah
npx tsc --noEmit 2>&1 | grep "Providers"
```

Resultado esperado: sin errores en Providers.tsx.

- [ ] **Step 3: Commit**

```bash
git add src/components/Providers.tsx
git commit -m "perf: parallelize independent awaits in Providers with Promise.all"
```

---

### Task 3: Paralelizar awaits en dashboard layout

**Files:**
- Modify: `src/app/dashboard/layout.tsx:32-36`

`getLocaleFromCookie()`, `getDictionaryFromCookie()`, `getMode()` y `getSystemMode()` son independientes de `getServerSession()` y entre sí — todos leen cookies. Se pueden ejecutar todos en paralelo.

- [ ] **Step 1: Reemplazar los 5 awaits secuenciales**

En `src/app/dashboard/layout.tsx`, reemplazar:

```ts
  const session = await getServerSession(authOptions)
  const locale = await getLocaleFromCookie()
  const dictionary = await getDictionaryFromCookie()
  const mode = await getMode()
  const systemMode = await getSystemMode()
  const userHierarchy = session?.user?.roleHierarchy ?? 999
```

con:

```ts
  const [session, locale, dictionary, mode, systemMode] = await Promise.all([
    getServerSession(authOptions),
    getLocaleFromCookie(),
    getDictionaryFromCookie(),
    getMode(),
    getSystemMode()
  ])
  const userHierarchy = session?.user?.roleHierarchy ?? 999
```

- [ ] **Step 2: Verificar que el archivo compila**

```bash
cd /Users/dan/Documents/Nkrease/Noah
npx tsc --noEmit 2>&1 | grep "layout"
```

Resultado esperado: sin errores en dashboard/layout.tsx.

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/layout.tsx
git commit -m "perf: parallelize session + cookie reads in dashboard layout"
```

---

### Task 4: Paralelizar queries iniciales en getDashboardStats

**Files:**
- Modify: `src/app/server/dashboardActions.ts:82-96`

Actualmente `getUserOrganizationId` y `prisma.user.findUnique` (currentUser) se ejecutan secuencialmente tras `requireAuth()`. Son independientes entre sí — ambas necesitan `session.user.id` pero no dependen una de la otra.

- [ ] **Step 1: Combinar las dos queries secuenciales en Promise.all**

En `src/app/server/dashboardActions.ts`, reemplazar las líneas 82-96:

```ts
export async function getDashboardStats(): Promise<DashboardStats> {
  const session = await requireAuth()
  const organizationId = await getUserOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El usuario no pertenece a ninguna organización')
  }

  // Obtener nombre del usuario actual
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, firstName: true }
  })

  const currentUserName = currentUser?.firstName || currentUser?.name?.split(' ')[0] || 'Usuario'
```

con:

```ts
export async function getDashboardStats(): Promise<DashboardStats> {
  const session = await requireAuth()

  const [organizationId, currentUser] = await Promise.all([
    getUserOrganizationId(session.user.id),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, firstName: true }
    })
  ])

  if (!organizationId) {
    throw new Error('El usuario no pertenece a ninguna organización')
  }

  const currentUserName = currentUser?.firstName || currentUser?.name?.split(' ')[0] || 'Usuario'
```

- [ ] **Step 2: Verificar que el archivo compila**

```bash
cd /Users/dan/Documents/Nkrease/Noah
npx tsc --noEmit 2>&1 | grep "dashboardActions"
```

Resultado esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/app/server/dashboardActions.ts
git commit -m "perf: parallelize organizationId + currentUser queries in getDashboardStats"
```

---

### Task 5: Fix N+1 queries en reporting progress del dashboard

**Files:**
- Modify: `src/app/server/dashboardActions.ts:298-347`

Este es el mayor cuello de botella. El loop hace una query a BD por cada grupo activo (si hay 30 grupos = 30 queries secuenciales). Fix: calcular todos los (groupId, expectedDate) en memoria, hacer UNA sola query bulk, y comparar con un Set.

- [ ] **Step 1: Reemplazar el bloque de reporting progress (líneas 298-347)**

Reemplazar desde `const activeVacation = await getActiveVacationPeriod(organizationId)` hasta el cierre del bloque `if (!activeVacation)`:

```ts
  // Weekly reporting progress
  const activeVacation = await getActiveVacationPeriod(organizationId)
  let reportingProgress = { expected: 0, reported: 0, unreportedGroups: [] as Array<{ id: string; name: string; meetingDay: string; networkName: string }> }

  if (!activeVacation) {
    const todayDate = new Date()

    todayDate.setHours(0, 0, 0, 0)

    const todayDay = todayDate.getDay()

    // Calcular (group, expectedDate) en memoria — sin queries
    const groupDates: Array<{ group: typeof allGroups[0]; expectedDate: Date }> = []

    for (const group of allGroups) {
      if (!group.meetingDay) continue

      const dayNum = DAY_ORDER[group.meetingDay.toLowerCase()] ?? -1

      if (dayNum === -1) continue

      const monday = new Date(todayDate)

      monday.setDate(todayDate.getDate() - ((todayDay + 6) % 7))

      const offset = dayNum === 0 ? 6 : dayNum - 1
      const expectedDate = new Date(monday)

      expectedDate.setDate(monday.getDate() + offset)

      if (expectedDate > todayDate) continue

      groupDates.push({ group, expectedDate })
    }

    if (groupDates.length > 0) {
      // Una sola query para todos los grupos
      const groupIds = groupDates.map(gd => gd.group.id)
      const dates = groupDates.map(gd => gd.expectedDate)
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))

      const existingReports = await prisma.groupReport.findMany({
        where: {
          groupId: { in: groupIds },
          meetingDate: { gte: minDate, lte: maxDate }
        },
        select: { groupId: true, meetingDate: true }
      })

      // Set de lookup: "groupId_YYYY-MM-DD"
      const reportedSet = new Set(
        existingReports.map(r => {
          const d = new Date(r.meetingDate)

          return `${r.groupId}_${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
        })
      )

      for (const { group, expectedDate } of groupDates) {
        const key = `${group.id}_${expectedDate.getFullYear()}-${expectedDate.getMonth()}-${expectedDate.getDate()}`

        if (reportedSet.has(key)) {
          reportingProgress.reported++
        } else {
          reportingProgress.unreportedGroups.push({
            id: group.id,
            name: group.name,
            meetingDay: group.meetingDay!,
            networkName: group.network.name
          })
        }

        reportingProgress.expected++
      }
    }
  }
```

- [ ] **Step 2: Verificar que el archivo compila**

```bash
cd /Users/dan/Documents/Nkrease/Noah
npx tsc --noEmit 2>&1 | grep "dashboardActions"
```

Resultado esperado: sin errores.

- [ ] **Step 3: Verificar manualmente en el navegador**

Navegar a `http://localhost:3000/dashboard` y confirmar:
- Los stats del dashboard cargan correctamente
- La sección de "reportes pendientes" muestra los mismos grupos que antes
- El contador de `expected` y `reported` coincide con el estado real

- [ ] **Step 4: Commit**

```bash
git add src/app/server/dashboardActions.ts
git commit -m "perf: fix N+1 queries in dashboard reporting progress — bulk fetch + in-memory matching"
```

---

## Self-Review

**Spec coverage:**
- ✅ N+1 queries → Task 5
- ✅ Awaits secuenciales layout → Task 3
- ✅ Awaits secuenciales Providers → Task 2
- ✅ Paralelizar currentUser con organizationId → Task 4
- ✅ debug: true → Task 1

**Placeholder scan:** Ningún TBD o sección incompleta.

**Type consistency:**
- `allGroups` en Task 5 es el resultado del `Promise.all` de la línea 117 — tipo `Prisma.GroupGetPayload` con los campos `id`, `name`, `imageUrl`, `meetingDay`, `meetingTime`, `modality`, `network.name`, `members`. La propiedad `meetingDay` se accede con `!` (non-null assertion) porque el `where` ya filtra `meetingDay: { not: null }`.

**Notas de implementación:**
- Tasks 1-4 son de bajo riesgo (cambios mecánicos de paralelización).
- Task 5 es la más importante pero también la más sensible — verificar manualmente el dashboard después de aplicarla.
- No se toca `getServerSession()` en `helpers.ts` — requeriría refactor mayor con riesgo de regressions.

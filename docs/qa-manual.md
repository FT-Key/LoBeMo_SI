# QA Manual — Mapa de Funcionalidades US-035 a US-049

> **Propósito:** Documentar paso a paso cómo acceder y probar cada funcionalidad del sistema.
> **Fecha:** 2026-09-07
> **Proyecto:** LoBeMo Seguridad Informática — Sistema de Gestión

---

## Prerrequisitos Generales

1. **Base de datos:** Ejecutar `npm run db:seed` para cargar datos demo (cliente "Centro Hogar", proyectos de ejemplo).
2. **Servidor:** Ejecutar `npm run dev` en `http://localhost:3000`.
3. **Credenciales de prueba:**
   - Gerente General: `gerente@lobemo.com` / `password123`
   - CISO: `ciso@lobemo.com` / `password123`
   - Empleado: `empleado@lobemo.com` / `password123`
4. **Navegador:** Chrome o Firefox (última versión).

---

## US-035: Notificaciones por Email a Empleados

### Objetivo
Verificar que al asignar un empleado a un proyecto o crear una tarea asignada, se envíe un email de notificación.

### Prerrequisitos
- Servicio de email configurado (Resend o similar).
- Empleado con email válido en el sistema.

### Pasos

#### Test A: Email al asignar empleado a proyecto
1. Iniciar sesión como **Gerente General**.
2. Navegar a **Proyectos** → seleccionar un proyecto.
3. Ir a la pestaña **Asignaciones** o sección de equipo.
4. Hacer clic en **Asignar empleado**.
5. Seleccionar un empleado de la lista.
6. Confirmar la asignación.
7. Abrir la bandeja de entrada del empleado asignado.

#### Resultado esperado
- [ ] Se muestra mensaje de éxito en el sistema.
- [ ] El empleado recibe email con asunto: "Has sido asignado al proyecto [Nombre]".
- [ ] El email contiene: nombre del proyecto, rol asignado, link al proyecto.
- [ ] El email tiene el layout profesional de LoBeMo (header con logo, footer).

#### Test B: Email al crear tarea asignada
1. Navegar a un proyecto → pestaña **Tareas**.
2. Hacer clic en **Crear tarea**.
3. Completar: título, descripción, prioridad.
4. **Asignar** la tarea a un empleado.
5. Guardar la tarea.
6. Abrir la bandeja de entrada del empleado.

#### Resultado esperado
- [ ] El empleado recibe email con asunto: "Tarea asignada: [Título]".
- [ ] El email contiene: título de la tarea, proyecto asociado, prioridad, fecha límite (si apica), link a la tarea.

---

## US-036: Envío de Propuestas por Email

### Objetivo
Verificar que se pueda enviar una propuesta al cliente directamente desde el sistema.

### Prerrequisitos
- Propuesta creada con estado "BORRADOR" o "ENVIADA".
- Cliente con email válido asociado a la propuesta.

### Pasos
1. Iniciar sesión como **Administración** o **Gerente General**.
2. Navegar a **Propuestas**.
3. Seleccionar una propuesta existente.
4. Verificar que el botón **"Enviar por email"** sea visible.
5. Hacer clic en **"Enviar por email"**.
6. Confirmar el envío en el modal de confirmación (si aparece).
7. Abrir la bandeja de entrada del cliente.

#### Resultado esperado
- [ ] El botón "Enviar por email" es visible para roles: ADMINISTRACION, VENTAS, GERENTE_GENERAL.
- [ ] El botón NO es visible para otros roles (CISO, Analista, etc.).
- [ ] Se muestra mensaje de éxito: "Propuesta enviada exitosamente".
- [ ] El estado de la propuesta cambia a "ENVIADA".
- [ ] El cliente recibe email con: monto total, resumen de servicios, link al sistema/portal.
- [ ] El email tiene el layout profesional de LoBeMo.

---

## US-038: Exportar Dashboard a Excel/CSV

### Objetivo
Verificar que se puedan exportar los datos del dashboard en formato XLSX o CSV.

### Prerrequisitos
- Tener datos en el dashboard (proyectos, clientes, etc.).
- Rol con acceso al dashboard (Gerente, CISO, Administración).

### Pasos
1. Iniciar sesión como **Gerente General**.
2. Navegar al **Dashboard** (`/dashboard`).
3. Localizar el botón **"Exportar"** (dropdown con opciones).
4. Hacer clic en **"Exportar"**.
5. Seleccionar **XLSX** o **CSV**.

#### Resultado esperado
- [ ] Aparece dropdown con opciones: XLSX y CSV.
- [ ] Al seleccionar XLSX: se descarga un archivo `.xlsx` con los datos del dashboard.
- [ ] Al seleccionar CSV: se descarga un archivo `.csv` con los datos del dashboard.
- [ ] El archivo contiene las mismas métricas que se ven en pantalla (KPIs, proyectos, clientes).
- [ ] Los datos son correctos y consistentes con lo mostrado en el dashboard.

---

## US-039: Búsqueda Global

### Objetivo
Verificar que la búsqueda global funcione con atajo de teclado y muestre resultados agrupados.

### Prerrequisitos
- Tener datos de prueba: proyectos, clientes, empleados, tareas.

### Pasos

#### Test A: Atajo de teclado
1. Iniciar sesión en el sistema.
2. Presionar **Ctrl+K** (o **/** ).

#### Resultado esperado
- [ ] Se abre el input de búsqueda global con dropdown.
- [ ] El cursor está enfocado en el input.

#### Test B: Búsqueda por texto
1. Abrir búsqueda (Ctrl+K).
2. Escribir el nombre de un proyecto existente (ej: "Centro Hogar").
3. Esperar 300ms (debounce).

#### Resultado esperado
- [ ] Aparecen resultados agrupados por tipo: Proyectos, Clientes, Empleados, Tareas.
- [ ] Cada resultado muestra nombre/descripción breve.
- [ ] Hacer clic en un resultado navega a la entidad correspondiente.

#### Test C: Búsqueda sin resultados
1. Abrir búsqueda.
2. Escribir un texto que no exista (ej: "xyz123qwerty").

#### Resultado esperado
- [ ] Se muestra mensaje: "Sin resultados para 'xyz123qwerty'".

---

## US-041: Comentarios en Tareas/Proyectos

### Objetivo
Verificar el CRUD de comentarios en proyectos y tareas.

### Prerrequisitos
- Proyecto o tarea existente.
- Usuario autenticado.

### Pasos

#### Test A: Crear comentario en proyecto
1. Navegar a **Proyectos** → seleccionar uno.
2. Ir a la sección **Comentarios** (al final de la página).
3. Escribir un comentario en el input.
4. Presionar **Ctrl+Enter** o hacer clic en **Enviar**.

#### Resultado esperado
- [ ] El comentario aparece en la lista con: autor, rol, contenido, timestamp.
- [ ] El formulario se limpia después de enviar.

#### Test B: Crear comentario en tarea
1. Navegar a **Proyectos** → seleccionar uno → pestaña **Tareas**.
2. Seleccionar una tarea.
3. Ir a sección **Comentarios**.
4. Escribir y enviar un comentario.

#### Resultado esperado
- [ ] El comentario se guarda asociado a la tarea.

#### Test C: Eliminar comentario propio
1. Localizar un comentario propio.
2. Hacer clic en el botón de **eliminar** (icono de papelera).

#### Resultado esperado
- [ ] Se muestra confirmación.
- [ ] El comentario se elimina.
- [ ] Solo se puede eliminar comentarios propios (botón no visible en ajenos).

---

## US-042: Dashboard del Empleado (Mi Dashboard)

### Objetivo
Verificar que el empleado vea su dashboard personal con tareas y proyectos asignados.

### Prerrequisitos
- Empleado con al menos 1 proyecto activo y 1 tarea asignada.

### Pasos
1. Iniciar sesión como **Empleado** (no Gerente/CISO).
2. Navegar a **Mi Dashboard** en el sidebar.

#### Resultado esperado
- [ ] Se muestran 4 cards de resumen: Proyectos activos, Tareas pendientes, Completadas, Total.
- [ ] Gráfico de barras: tareas por estado (Pendiente, En Progreso, Completada, Cancelada).
- [ ] Gráfico de barras: tareas por prioridad (Alta, Media, Baja).
- [ ] Lista de proyectos activos con link al detalle.
- [ ] Lista de tareas con: estado, prioridad, proyecto, fecha límite.
- [ ] "Mi Dashboard" es accesible desde el sidebar para TODOS los roles.

---

## US-043: Kanban para Tareas

### Objetivo
Verificar el tablero Kanban con drag-and-drop para gestionar tareas.

### Prerrequisitos
- Proyecto con al menos 3-4 tareas en diferentes estados.

### Pasos
1. Navegar a **Proyectos** → seleccionar uno.
2. Ir a la pestaña **Kanban** (o vista Kanban).
3. Verificar las 4 columnas: Pendiente, En Progreso, Completada, Cancelada.

#### Test A: Mover tarea entre columnas (drag-and-drop)
1. Arrastrar una tarea de "Pendiente" a "En Progreso".
2. Soltar la tarea en la columna destino.

#### Resultado esperado
- [ ] La tarea se mueve a la columna "En Progreso".
- [ ] El estado de la tarea se actualiza en la base de datos.
- [ ] Se muestra feedback visual durante el arrastre.

#### Test B: Reordenar dentro de una columna
1. Arrastrar una tarea dentro de la misma columna (cambiar posición).
2. Soltar en la nueva posición.

#### Resultado esperado
- [ ] Las tareas se reordenan.
- [ ] El campo `orden` se actualiza.

#### Test C: Info en las cards
1. Observar las cards del Kanban.

#### Resultado esperado
- [ ] Cada card muestra: título, prioridad (badge de color), empleado asignado, fecha límite.
- [ ] Colores de prioridad: Alta=rojo, Media=amarillo, Baja=verde.

---

## US-044: Timer de Horas Trabajadas

### Objetivo
Verificar el cronómetro para registrar horas trabajadas en tareas.

### Prerrequisitos
- Empleado asignado a una tarea.

### Pasos
1. Navegar a una **tarea** asignada al empleado.
2. Localizar el componente **TimeTracker** (cronómetro).

#### Test A: Iniciar timer
1. Hacer clic en **Iniciar**.

#### Resultado esperado
- [ ] El cronómetro comienza a contar en formato HH:MM:SS.
- [ ] El botón cambia a **Detener**.

#### Test B: Detener timer
1. Esperar unos segundos.
2. Hacer clic en **Detener**.

#### Resultado esperado
- [ ] El cronómetro se detiene.
- [ ] Se guarda un registro de horas con: empleado, tarea, inicio, fin, duración.
- [ ] Se muestra el total de horas trabajadas en la tarea.

#### Test C: Permisos
1. Iniciar sesión como empleado **no asignado** a la tarea.

#### Resultado esperado
- [ ] El timer NO está disponible (solo lectura o no se muestra).

---

## US-045: Gantt Simplificado

### Objetivo
Verificar la visualización de timeline tipo Gantt para tareas e hitos de un proyecto.

### Prerrequisitos
- Proyecto con tareas que tengan fechas de inicio y fin.
- Proyecto con al menos 1 hito.

### Pasos
1. Navegar a **Proyectos** → seleccionar uno.
2. Ir a la pestaña o página **Gantt** (`/proyectos/[id]/gantt`).

#### Resultado esperado
- [ ] Se muestra timeline horizontal.
- [ ] Las tareas aparecen como barras con duración proporcional.
- [ ] Los hitos aparecen como marcadores/milestones.
- [ ] La escala de tiempo es clara (días/semanas).
- [ ] Las barras de tareas se superponen correctamente si hay overlap.

---

## US-046: Evidencia en Pentesting

### Objetivo
Verificar que se puedan adjuntar evidencias (archivos) a hallazgos de pentesting.

### Prerrequisitos
- Hallazgo de pentesting existente.
- Cloudflare R2 configurado (Variables de entorno: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`).
- Archivos de prueba (imágenes PNG, PDFs).

### Pasos
1. Navegar a **Pentesting** → seleccionar un hallazgo.
2. Ir a la sección **Evidencias**.
3. Hacer clic en **Subir evidencia** (o drag & drop).

#### Test A: Subir imagen
1. Seleccionar una imagen PNG/JPG.
2. Confirmar la subida.

#### Resultado esperado
- [ ] La imagen se sube correctamente.
- [ ] Aparece en la lista de evidencias con nombre de archivo.
- [ ] Se muestra preview de la imagen.

#### Test B: Subir PDF
1. Seleccionar un archivo PDF.
2. Confirmar la subida.

#### Resultado esperado
- [ ] El PDF se sube correctamente.
- [ ] Aparece en la lista de evidencias.

#### Test C: Ver evidencia
1. Hacer clic en una evidencia subida.

#### Resultado esperado
- [ ] Se abre/vista previa del archivo.
- [ ] La URL apunta a R2 (no a almacenamiento local).

---

## US-047: Modo Oscuro / Claro

### Objetivo
Verificar el toggle de tema y la persistencia de la preferencia.

### Prerrequisitos
- Ninguno.

### Pasos
1. Iniciar sesión en el sistema.
2. Localizar el **ThemeToggle** en el sidebar.

#### Test A: Cambiar a light mode
1. Hacer clic en el toggle de tema.
2. Verificar que cambia a light mode.

#### Resultado esperado
- [ ] Los colores de fondo cambian a claro.
- [ ] El texto cambia a oscuro.
- [ ] Los componentes (cards, sidebar, botones) se adaptan al tema claro.
- [ ] El icono del toggle cambia (sol/luna).

#### Test B: Persistencia
1. Cambiar a dark mode.
2. Recargar la página (F5).

#### Resultado esperado
- [ ] El tema se mantiene en dark mode después de recargar.

#### Test C: Respeta preferencia del sistema
1. En el sistema operativo, configurar tema claro.
2. Abrir el sistema sin haber seleccionado tema previamente.

#### Resultado esperado
- [ ] El sistema respeta la preferencia del SO (light).

---

## US-048: Animaciones de Transición

### Objetivo
Verificar que las transiciones entre páginas tengan animación suave.

### Prerrequisitos
- Que `prefers-reduced-motion` NO esté activo en el SO.

### Pasos
1. Iniciar sesión.
2. Navegar entre páginas haciendo clic en el sidebar.

#### Resultado esperado
- [ ] Al cambiar de página, hay una transición suave (fade-in + slide-up sutil).
- [ ] La duración es ~250ms (no instantánea, no lenta).
- [ ] La animación se ejecuta en cada cambio de ruta.

#### Test con reduced-motion
1. Activar `prefers-reduced-motion` en el SO (Configuración de accesibilidad).
2. Navegar entre páginas.

#### Resultado esperado
- [ ] Las transiciones son planas (sin animación), respetando la preferencia del usuario.

---

## US-049: Actividad Reciente en Dashboard

### Objetivo
Verificar que el dashboard muestre las últimas acciones del sistema.

### Prerrequisitos
- Tener al menos algunas acciones registradas en el audit log.

### Pasos
1. Iniciar sesión como **Gerente General**, **CISO** o **Administración**.
2. Navegar al **Dashboard**.
3. Ir a la sección **Actividad Reciente** (al final del dashboard).

#### Resultado esperado
- [ ] Se muestran las últimas 20 acciones.
- [ ] Cada acción muestra: avatar con iniciales, nombre del empleado, acción (CREATE/UPDATE/DELETE), entidad, timestamp relativo.
- [ ] Los badges de acción tienen colores: CREATE=verde, UPDATE=azul, DELETE=rojo.
- [ ] El timestamp es legible en español ("hace 5 min", "hace 2 horas", "ayer").
- [ ] Si no hay actividad, se muestra: "Sin actividad registrada".

---

## Funcionalidades NO incluidas en QA Manual

| US | Razón |
|----|-------|
| US-040 | **No implementada** (en Backlog) |
| US-050 | Tests automatizados (infraestructura de desarrollo) |
| US-051 | Logging estructurado (infraestructura, no visible al usuario) |
| US-052 | Limpieza de código muerto (refactoring interno) |

---

## Checklist General de QA

| # | US | Funcionalidad | Pass | Fail | Observaciones |
|---|-----|--------------|------|------|---------------|
| 1 | 035 | Email a empleados | | | |
| 2 | 036 | Envío propuestas email | | | |
| 3 | 038 | Exportar dashboard | | | |
| 4 | 039 | Búsqueda global | | | |
| 5 | 041 | Comentarios | | | |
| 6 | 042 | Mi Dashboard | | | |
| 7 | 043 | Kanban tareas | | | |
| 8 | 044 | Timer horas | | | |
| 9 | 045 | Gantt | | | |
| 10 | 046 | Evidencia pentesting | | | |
| 11 | 047 | Modo oscuro/claro | | | |
| 12 | 048 | Transiciones | | | |
| 13 | 049 | Actividad dashboard | | | |

---

*Documento generado como parte de US-061 — QA Manual*

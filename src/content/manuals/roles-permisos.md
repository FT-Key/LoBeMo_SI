# Roles y Permisos

Tabla completa de roles del sistema y sus permisos asociados.

---

## Roles Disponibles

| Rol | Código | Descripción |
|-----|--------|-------------|
| Gerente General | `GERENTE_GENERAL` | Acceso total al sistema |
| Administración | `ADMINISTRACION` | Gestión administrativa y financiera |
| Ventas | `VENTAS` | Gestión comercial y propuestas |
| CISO | `CISO` | Oficial de seguridad de la información |
| Analista de Seguridad | `ANALISTA_SEGURIDAD` | Análisis de vulnerabilidades |
| Desarrollador | `DESARROLLADOR` | Desarrollo de software |
| Especialista de Redes | `ESPECIALISTA_REDES` | Configuración y gestión de redes |
| Pentester | `PENTESTER` | Pruebas de penetración |
| Soporte Técnico | `SOPORTE_TECNICO` | Soporte y ayuda al cliente |
| Auditor | `AUDITOR` | Auditorías de seguridad |
| Capacitador | `CAPACITADOR` | Capacitación y formación |

---

## Matriz de Permisos

### Acceso por Módulo

| Módulo | GERENTE_GENERAL | CISO | ADMINISTRACION | VENTAS | AUDITOR | CAPACITADOR | PENTESTER | DESARROLLADOR | SOPORTE_TECNICO | ANALISTA_SEGURIDAD | ESPECIALISTA_REDES |
|--------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Proyectos | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Clientes | ✅ | ✅ | ✅ | ✅ | — | — | — | — | — | — | — |
| Empleados | ✅ | — | — | — | — | — | — | — | — | — | — |
| Servicios | ✅ | ✅ | ✅ | ✅ | — | — | — | — | — | — | — |
| Capacitaciones | ✅ | ✅ | — | — | — | ✅ | — | — | — | — | — |
| Pentesting | ✅ | ✅ | — | — | — | — | ✅ | — | — | ✅ | — |
| Soporte | ✅ | ✅ | — | — | — | — | — | — | ✅ | — | — |
| Auditoría | ✅ | ✅ | — | — | ✅ | — | — | — | — | — | — |
| Calendario | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Acciones por Módulo

#### Proyectos

| Acción | Roles permitidos |
|--------|------------------|
| Ver proyectos | Todos los roles autenticados |
| Crear proyecto | GERENTE_GENERAL, CISO, ADMINISTRACION, VENTAS |
| Editar proyecto | GERENTE_GENERAL, CISO, ADMINISTRACION |
| Cambiar estado | GERENTE_GENERAL, CISO |
| Eliminar proyecto | GERENTE_GENERAL |

#### Empleados

| Acción | Roles permitidos |
|--------|------------------|
| Ver empleados | GERENTE_GENERAL |
| Crear empleado | GERENTE_GENERAL |
| Editar empleado | GERENTE_GENERAL |
| Desactivar empleado | GERENTE_GENERAL |

#### Tareas

| Acción | Roles permitidos |
|--------|------------------|
| Ver tareas (proyecto asignado) | Empleados asignados al proyecto |
| Crear tarea | GERENTE_GENERAL, CISO, Empleados asignados |
| Editar tarea | GERENTE_GENERAL, CISO, Empleados asignados |
| Completar tarea | Empleado asignado a la tarea |

#### Documentos

| Acción | Roles permitidos |
|--------|------------------|
| Ver documentos | GERENTE_GENERAL, CISO, Empleados asignados |
| Subir documento | GERENTE_GENERAL, CISO, Empleados asignados |
| Eliminar documento | GERENTE_GENERAL, CISO, Empleados asignados |

#### Capacitaciones

| Acción | Roles permitidos |
|--------|------------------|
| Ver capacitaciones | GERENTE_GENERAL, CISO, CAPACITADOR |
| Crear capacitación | GERENTE_GENERAL, CISO, CAPACITADOR |
| Calificar asistentes | GERENTE_GENERAL, CISO, CAPACITADOR |
| Generar certificados | GERENTE_GENERAL, CISO, CAPACITADOR |

#### Pentesting

| Acción | Roles permitidos |
|--------|------------------|
| Ver hallazgos | GERENTE_GENERAL, CISO, PENTESTER, ANALISTA_SEGURIDAD |
| Crear hallazgo | GERENTE_GENERAL, CISO, PENTESTER, ANALISTA_SEGURIDAD |
| Editar hallazgo | GERENTE_GENERAL, CISO, PENTESTER, ANALISTA_SEGURIDAD |

#### Soporte

| Acción | Roles permitidos |
|--------|------------------|
| Ver tickets | GERENTE_GENERAL, CISO, SOPORTE_TECNICO |
| Crear ticket | GERENTE_GENERAL, CISO, SOPORTE_TECNICO |
| Asignar ticket | GERENTE_GENERAL, CISO |
| Cerrar ticket | SOPORTE_TECNICO, GERENTE_GENERAL |

#### Auditoría

| Acción | Roles permitidos |
|--------|------------------|
| Ver informes | GERENTE_GENERAL, CISO, AUDITOR |
| Crear informe | GERENTE_GENERAL, CISO, AUDITOR |
| Editar informe | GERENTE_GENERAL, CISO, AUDITOR |

---

## Áreas Organizacionales

| Área | Código | Descripción |
|------|--------|-------------|
| Gerencia | `GERENCIA` | Dirección general |
| Administración | `ADMINISTRACION` | Área administrativa y contable |
| Comercial | `COMERCIAL` | Ventas y marketing |
| Sistemas | `SISTEMAS` | Tecnología e infraestructura |
| Auditoría | `AUDITORIA` | Auditoría interna |
| Capacitación | `CAPACITACION` | Formación y capacitación |

---

## Reglas de Acceso

1. **Principio de menor privilegio**: Cada rol solo tiene acceso a las funcionalidades necesarias para su trabajo.

2. **Separación de funciones**: Ningún rol puede ejecutar todas las operaciones (excepto GERENTE_GENERAL).

3. **Auditoría**: Todas las acciones quedan registradas en `audit_logs` con el ID del empleado que las ejecutó.

4. **Protección de rutas**: El sistema valida el rol del usuario en cada petición API.

5. **Protección de UI**: El navbar y los componentes de UI filtran las opciones según el rol del usuario.

---
name: design-principles
description: Principios SOLID, KISS, DRY, YAGNI y reglas de diseno limpio para el proyecto. Usar siempre antes y durante la implementacion
license: MIT
---

## SOLID

### S — Single Responsibility
Una clase/funcion debe tener UNA sola razon para cambiar.

- Entities: solo logica de negocio y validacion de dominio
- Use cases: solo orquestacion de flujos
- Repositories: solo persistencia
- Mappers: solo conversion entre capas
- Route handlers: solo recibir request y devolver response

### O — Open/Closed
Abierto a extension, cerrado a modificacion.

- Usa interfaces para permitir nuevas implementaciones
- NO modifiques clases existentes para anadir comportamiento
- Ej: nuevo proveedor de email → nueva clase que implementa IEmailService

### L — Liskov Substitution
Las subclases deben poder reemplazar a sus padres sin alterar el programa.

- NO sobrescribas comportamiento base de forma inesperada
- Las implementaciones de interfaces deben cumplir el contrato (precondiciones, postcondiciones)

### I — Interface Segregation
Mejor muchas interfaces especificas que una general.

- `IUserRepository` (CRUD usuario) separado de `IAnalyticsRepository`
- NO obligues a implementar metodos que no se usan

### D — Dependency Inversion
Depende de abstracciones, no de implementaciones concretas.

- Use cases dependen de `IUserRepository` (NO de `MongoUserRepository`)
- La DI container decide que implementacion inyectar (dev, prod, test)

## KISS (Keep It Simple, Stupid)

- La solucion mas simple que funciona es la correcta
- No anticipes necesidades futuras (YAGNI)
- Si un metodo tiene > 20 lineas, preguntate si puede dividirse
- Si una clase tiene > 5 metodos publicos, quizas hace demasiadas cosas
- Prefiere funciones puras sobre metodos de clase cuando no haya estado

## DRY (Don't Repeat Yourself)

- Codigo duplicado 2+ veces → extraer a funcion/clase
- PERO no fuerces DRY prematuramente (viola KISS)
- La abstraccion incorrecta es peor que la duplicacion
- Las validaciones de Zod pueden compartirse entre cliente y servidor

## YAGNI (You Ain't Gonna Need It)

- No anadas abstracciones "por si acaso"
- No crees interfaces hasta que necesites una segunda implementacion
- No anadas funcionalidad que no esta en los requisitos actuales

## Reglas adicionales

### Command-Query Separation (CQS)
- Metodos que modifican estado (comandos) no devuelven datos
- Metodos que consultan (queries) no modifican estado

### Fail Fast
- Valida inputs al inicio de cada funcion
- Si un parametro es invalido, lanza error inmediatamente
- No dejes que errores lleguen lejos antes de detectarlos

### Tell, Don't Ask
- Dile al objeto que hacer, no le preguntes su estado para decidir tu
- Mal: `if (user.isActive()) { user.activate() }`
- Bien: `user.activate()`

### Law of Demeter
- No encadenes mas de 2-3 llamadas: `user.getAddress().getCity().getName()`
- Usa metodos de conveniencia en la entidad: `user.getCityName()`

### Early Returns
- Evita if-else anidados profundos
- Valida y retorna temprano, el flujo feliz al final

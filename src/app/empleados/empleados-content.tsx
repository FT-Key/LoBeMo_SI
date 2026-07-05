"use client"

type Empleado = {
  id: string
  nombre: string
  apellido: string
  email: string
  rol: string
  area: string
  activo: boolean
}

export function EmpleadosContent({ empleados }: { empleados: Empleado[] }) {
  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-3 text-sm font-medium">Nombre</th>
            <th className="text-left p-3 text-sm font-medium">Email</th>
            <th className="text-left p-3 text-sm font-medium">Rol</th>
            <th className="text-left p-3 text-sm font-medium">Área</th>
            <th className="text-left p-3 text-sm font-medium">Estado</th>
          </tr>
        </thead>
        <tbody>
          {empleados.map((emp) => (
            <tr key={emp.id} className="border-b last:border-0">
              <td className="p-3 text-sm">
                {emp.nombre} {emp.apellido}
              </td>
              <td className="p-3 text-sm">{emp.email}</td>
              <td className="p-3 text-sm">{emp.rol}</td>
              <td className="p-3 text-sm">{emp.area}</td>
              <td className="p-3 text-sm">
                {emp.activo ? (
                  <span className="text-green-600">Activo</span>
                ) : (
                  <span className="text-red-600">Inactivo</span>
                )}
              </td>
            </tr>
          ))}
          {empleados.length === 0 && (
            <tr>
              <td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">
                No hay empleados registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

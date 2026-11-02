import { STORAGE_KEY } from '../domain/constants';
import type { Ticket } from '../domain/types';
import { createLocalStorageRepository } from '../storage/localStorageRepository';

const examples: Pick<Ticket, 'titulo' | 'descripcion' | 'categoria' | 'prioridad' | 'estado'>[] = [
  {
    titulo: 'Impresora de recepción no imprime',
    descripcion: 'La impresora muestra papel atascado aunque la bandeja está libre. Revisar los rodillos y realizar una impresión de prueba.',
    categoria: 'hardware', prioridad: 'alta', estado: 'pendiente',
  },
  {
    titulo: 'Laptop se apaga durante las reuniones',
    descripcion: 'El equipo se apaga después de veinte minutos de videollamada. Comprobar temperatura, ventilación y estado de la batería.',
    categoria: 'hardware', prioridad: 'critica', estado: 'en_proceso',
  },
  {
    titulo: 'Monitor adicional sin señal',
    descripcion: 'Se sustituyó el cable HDMI y se configuró la salida de video. El monitor funciona correctamente en la estación de pruebas.',
    categoria: 'hardware', prioridad: 'media', estado: 'resuelto',
  },
  {
    titulo: 'Teclado con teclas que no responden',
    descripcion: 'Varias teclas del teclado de la sala de capacitación no responden. Solicitar un reemplazo y comprobar el puerto USB.',
    categoria: 'hardware', prioridad: 'baja', estado: 'pendiente',
  },
  {
    titulo: 'Aplicación de inventario no inicia',
    descripcion: 'Al abrir el sistema de inventario aparece un error de configuración. Revisar dependencias y reinstalar el cliente de prueba.',
    categoria: 'software', prioridad: 'critica', estado: 'pendiente',
  },
  {
    titulo: 'Hoja de cálculo se cierra al exportar',
    descripcion: 'El programa se cierra cuando se exporta un reporte a PDF. Reproducir el fallo con un archivo ficticio y revisar los complementos.',
    categoria: 'software', prioridad: 'alta', estado: 'en_proceso',
  },
  {
    titulo: 'Actualizar lector de archivos PDF',
    descripcion: 'Se instaló la actualización del lector y se comprobó la apertura de documentos de muestra sin errores.',
    categoria: 'software', prioridad: 'baja', estado: 'resuelto',
  },
  {
    titulo: 'Instalar herramienta de videoconferencia',
    descripcion: 'Preparar la herramienta de reuniones en el equipo del aula y comprobar cámara, micrófono y permisos de la aplicación.',
    categoria: 'software', prioridad: 'media', estado: 'pendiente',
  },
  {
    titulo: 'Sin conexión a Internet en el laboratorio',
    descripcion: 'Todos los equipos del laboratorio perdieron la conexión. Revisar el enlace principal y la configuración del conmutador.',
    categoria: 'red', prioridad: 'critica', estado: 'en_proceso',
  },
  {
    titulo: 'Wi-Fi intermitente en la sala de reuniones',
    descripcion: 'La conexión inalámbrica se desconecta durante las presentaciones. Medir cobertura y revisar interferencias del punto de acceso.',
    categoria: 'red', prioridad: 'alta', estado: 'pendiente',
  },
  {
    titulo: 'Conexión VPN restablecida',
    descripcion: 'Se renovó la configuración del cliente VPN y se verificó el acceso al entorno de demostración desde una red externa.',
    categoria: 'red', prioridad: 'media', estado: 'resuelto',
  },
  {
    titulo: 'Identificar punto de red del aula',
    descripcion: 'Localizar y etiquetar el punto de red disponible para un equipo de capacitación. Comprobar conectividad al finalizar.',
    categoria: 'red', prioridad: 'baja', estado: 'en_proceso',
  },
  {
    titulo: 'Cuenta de demostración bloqueada',
    descripcion: 'La cuenta ficticia de capacitación quedó bloqueada después de varios intentos fallidos. Revisar el bloqueo y restablecer el acceso.',
    categoria: 'cuentas', prioridad: 'alta', estado: 'en_proceso',
  },
  {
    titulo: 'Acceso urgente al sistema de pruebas',
    descripcion: 'El equipo de validación no puede ingresar al entorno de pruebas antes de la sesión programada. Revisar la asignación de permisos.',
    categoria: 'cuentas', prioridad: 'critica', estado: 'pendiente',
  },
  {
    titulo: 'Permisos de lectura habilitados',
    descripcion: 'Se asignó acceso de solo lectura a una cuenta ficticia y se comprobó que no puede modificar los registros de demostración.',
    categoria: 'cuentas', prioridad: 'media', estado: 'resuelto',
  },
  {
    titulo: 'Crear cuenta temporal de capacitación',
    descripcion: 'Preparar una cuenta ficticia para el taller interno con acceso limitado y fecha de vencimiento al terminar la capacitación.',
    categoria: 'cuentas', prioridad: 'baja', estado: 'pendiente',
  },
  {
    titulo: 'Preparar equipos para la demostración',
    descripcion: 'Revisar proyector, audio y conectividad de la sala antes de la presentación del sistema de tickets.',
    categoria: 'otro', prioridad: 'alta', estado: 'en_proceso',
  },
  {
    titulo: 'Revisión de contingencia de la sala técnica',
    descripcion: 'Se verificaron los equipos de respaldo y se completó la lista de comprobación de una contingencia simulada.',
    categoria: 'otro', prioridad: 'critica', estado: 'resuelto',
  },
  {
    titulo: 'Solicitar orientación para registrar incidencias',
    descripcion: 'Preparar una explicación breve sobre categorías, prioridades y seguimiento para las personas que participarán en el taller.',
    categoria: 'otro', prioridad: 'media', estado: 'pendiente',
  },
  {
    titulo: 'Documentación de soporte entregada',
    descripcion: 'Se compartió la guía de uso del entorno ficticio y se comprobó que los ejemplos permiten practicar el registro de incidencias.',
    categoria: 'otro', prioridad: 'baja', estado: 'resuelto',
  },
];

export function createDemoTickets(now = new Date()): Ticket[] {
  return examples.map((example, index) => {
    const created = now.getTime() - (examples.length - index) * 24 * 60 * 60 * 1000;
    const creadoEn = new Date(created).toISOString();
    const actualizadoEn = example.estado === 'pendiente'
      ? creadoEn
      : new Date(created + 4 * 60 * 60 * 1000).toISOString();
    return {
      ...example,
      id: `f17c0000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
      codigo: index + 1,
      creadoEn,
      actualizadoEn,
      resueltoEn: example.estado === 'resuelto' ? actualizadoEn : null,
    };
  });
}

export function seedDemoTickets(storage: Storage, now = new Date()): number {
  // Una clave existente también puede representar un listado vaciado a propósito.
  if (storage.getItem(STORAGE_KEY) !== null) return 0;
  const tickets = createDemoTickets(now);
  createLocalStorageRepository(storage).saveAll(tickets);
  return tickets.length;
}

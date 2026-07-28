/**
 * Reglas de validación del formulario de contacto, compartidas entre el
 * cliente (Footer, errores inline) y la API route (revalidación server-side)
 * — un solo lugar de verdad para que nunca diverjan.
 */

export interface ContactFormData {
  nombre: string;
  email: string;
  /** Opcional. */
  telefono: string;
  mensaje: string;
}

export interface ContactFormErrors {
  nombre?: string;
  email?: string;
  telefono?: string;
  mensaje?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactForm(data: ContactFormData): ContactFormErrors {
  const errors: ContactFormErrors = {};

  const nombre = data.nombre.trim();
  if (!nombre) {
    errors.nombre = "Ingresa tu nombre.";
  } else if (nombre.length < 2) {
    errors.nombre = "El nombre es demasiado corto.";
  }

  const email = data.email.trim();
  if (!email) {
    errors.email = "Ingresa tu correo electrónico.";
  } else if (!EMAIL_RE.test(email)) {
    errors.email = "Ingresa un correo electrónico válido.";
  }

  const telefono = data.telefono.trim();
  if (telefono) {
    const digitCount = (telefono.match(/\d/g) ?? []).length;
    if (digitCount < 7 || digitCount > 15) {
      errors.telefono = "Ingresa un teléfono válido.";
    }
  }

  const mensaje = data.mensaje.trim();
  if (!mensaje) {
    errors.mensaje = "Cuéntanos brevemente sobre tu proyecto.";
  } else if (mensaje.length < 10) {
    errors.mensaje = "Agrega un poco más de detalle (mínimo 10 caracteres).";
  }

  return errors;
}

export function hasErrors(errors: ContactFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

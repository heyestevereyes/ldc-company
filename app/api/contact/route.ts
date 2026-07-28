import { Resend } from "resend";
import {
  validateContactForm,
  hasErrors,
  type ContactFormData,
} from "@/lib/contactValidation";

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const raw = (body ?? {}) as Record<string, unknown>;
  const data: ContactFormData = {
    nombre: asString(raw.nombre),
    email: asString(raw.email),
    telefono: asString(raw.telefono),
    mensaje: asString(raw.mensaje),
  };

  // Nunca confiar solo en la validación del cliente: se revalida aquí con
  // las mismas reglas (lib/contactValidation), no una copia aparte.
  const errors = validateContactForm(data);
  if (hasErrors(errors)) {
    return Response.json({ errors }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL_TO;
  const isPending = (value: string | undefined) => !value || value.startsWith("PENDIENTE_");

  if (isPending(apiKey) || isPending(to)) {
    console.warn(
      "[api/contact] RESEND_API_KEY o CONTACT_EMAIL_TO no están configurados todavía " +
        "(placeholder PENDIENTE_ detectado en .env.local) — no se envió ningún correo.",
    );
    return Response.json(
      {
        error:
          "El envío de correo aún no está configurado en el sitio. Escríbenos directamente a ventas@ldc-lithosdev.com mientras tanto.",
      },
      { status: 503 },
    );
  }

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      // Remitente de prueba de Resend: cambiar por un remitente del dominio
      // propio (@ldc-lithosdev.com) en cuanto ese dominio esté verificado ahí.
      from: "Sitio LDC <onboarding@resend.dev>",
      to: to as string,
      replyTo: data.email,
      subject: `Nuevo contacto desde el sitio — ${data.nombre}`,
      text: [
        `Nombre: ${data.nombre}`,
        `Email: ${data.email}`,
        data.telefono ? `Teléfono: ${data.telefono}` : null,
        "",
        "Mensaje:",
        data.mensaje,
      ]
        .filter((line) => line !== null)
        .join("\n"),
    });

    if (error) {
      console.error("[api/contact] Error de Resend:", error);
      return Response.json(
        { error: "No pudimos enviar tu mensaje. Intenta de nuevo en unos minutos." },
        { status: 502 },
      );
    }

    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[api/contact] Error inesperado:", err);
    return Response.json(
      { error: "No pudimos enviar tu mensaje. Intenta de nuevo en unos minutos." },
      { status: 500 },
    );
  }
}

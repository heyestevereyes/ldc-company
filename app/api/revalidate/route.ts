import type { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { parseBody } from "next-sanity/webhook";

interface SanityWebhookPayload {
  _type?: string;
}

function isPending(value: string | undefined): boolean {
  return !value || value.startsWith("PENDIENTE_");
}

/** Webhook de Sanity (configurar en manage.sanity.io → API → Webhooks,
 * apuntando a esta ruta y con el mismo secreto que SANITY_REVALIDATE_SECRET)
 * disparado al publicar un documento hero/proyecto/footer. Revalida por
 * `_type`, que coincide con los tags usados en lib/sanity/fetchers.ts. */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;

  if (isPending(secret)) {
    console.warn(
      "[api/revalidate] SANITY_REVALIDATE_SECRET no está configurado todavía " +
        "(placeholder PENDIENTE_ detectado en .env.local) — se ignora la solicitud.",
    );
    return Response.json(
      { revalidated: false, message: "El webhook de Sanity aún no está configurado en el sitio." },
      { status: 503 },
    );
  }

  try {
    const { isValidSignature, body } = await parseBody<SanityWebhookPayload>(request, secret);

    if (!isValidSignature) {
      console.warn("[api/revalidate] Firma de webhook inválida.");
      return Response.json({ revalidated: false, message: "Firma inválida." }, { status: 401 });
    }

    const type = body?._type;
    if (!type) {
      return Response.json({ revalidated: false, message: "Payload sin _type." }, { status: 400 });
    }

    // Expiración inmediata: este endpoint solo lo llama el webhook de Sanity
    // (un sistema externo), no una Server Action del propio sitio — ver la
    // nota sobre webhooks en la doc de revalidateTag.
    revalidateTag(type, { expire: 0 });

    return Response.json({ revalidated: true, tag: type, now: Date.now() });
  } catch (err) {
    console.error("[api/revalidate] Error inesperado:", err);
    return Response.json({ revalidated: false, message: "Error interno." }, { status: 500 });
  }
}

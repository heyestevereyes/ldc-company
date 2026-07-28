"use client";

import { useId, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import AnimatedSection from "@/components/AnimatedSection";
import {
  validateContactForm,
  hasErrors,
  type ContactFormData,
  type ContactFormErrors,
} from "@/lib/contactValidation";

export interface FooterProps {
  headline?: string;
  email?: string;
  logoSrc?: string;
  logoAlt?: string;
  companyName?: string;
}

function ArrowUpRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" fill="none" className={className} aria-hidden>
      <path d="M5.25 5.25H12.75V12.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.25 12.75L12.75 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Marca decorativa grande de la esquina (node 1:417, "Isolation_Mode") — path
 * exacto exportado por Figma, no una aproximación. */
function DecorativeMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 301 301.083" fill="none" className={className} aria-hidden>
      <path d="M68.3977 68.3977H0V233.019L68.0645 301.083H185.615V232.686H68.3977V68.3977Z" fill="currentColor" />
      <path d="M232.935 0H115.385V68.3977H232.602V232.686H301V68.0645C274.424 41.4885 259.511 26.576 232.935 0Z" fill="currentColor" />
      <path d="M107.637 107.637V174.035L126.965 193.363H193.363V126.965L174.035 107.637H107.637Z" fill="currentColor" />
    </svg>
  );
}

/** Mismo radio de esquinas que el pill de email (node 1:363), fondo
 * semitransparente con blur sobre el gradiente y texto blanco — el
 * "lenguaje visual" del formulario pedido en vez del panel blanco del
 * modal anterior. */
const FIELD_CLASS =
  "w-full rounded-xl xl:rounded-[clamp(0.4447rem,0.5208vw,0.625rem)] border border-white/20 bg-white/10 px-4 py-2.5 text-base text-white backdrop-blur-sm placeholder:text-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-1 aria-[invalid=true]:border-red-400";

function FormField({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-white">
        {label}
        {optional && <span className="font-normal text-white/50"> (opcional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

type SubmitStatus = "idle" | "submitting" | "success" | "error";

const EMPTY_FORM: ContactFormData = { nombre: "", email: "", telefono: "", mensaje: "" };

/** Formulario de contacto inline (no modal): vive directamente en el flujo
 * del Footer, entre el headline y el pill de email, siempre visible. */
function ContactForm() {
  const [values, setValues] = useState<ContactFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const headingId = useId();
  const nombreId = useId();
  const emailId = useId();
  const telefonoId = useId();
  const mensajeId = useId();

  const handleChange =
    (field: keyof ContactFormData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validateContactForm(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setStatus("submitting");
    setServerError(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data: { ok?: boolean; error?: string; errors?: ContactFormErrors } = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        if (data.errors) setErrors(data.errors);
        setServerError(data.error ?? "No pudimos enviar tu mensaje. Intenta de nuevo.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setServerError("No pudimos enviar tu mensaje. Revisa tu conexión e intenta de nuevo.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div
        role="status"
        className="flex w-full flex-col gap-2 rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm xl:rounded-[clamp(0.4447rem,0.5208vw,0.625rem)]"
      >
        <p className="font-display text-xl font-bold text-white">¡Mensaje enviado!</p>
        <p className="max-w-xl text-sm leading-relaxed text-white/70">
          Gracias por escribirnos. Un miembro de nuestro equipo se pondrá en contacto contigo muy
          pronto.
        </p>
        <button
          type="button"
          onClick={() => {
            setValues(EMPTY_FORM);
            setStatus("idle");
          }}
          className="mt-2 self-start text-sm font-medium text-white underline underline-offset-2 hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby={headingId}
      className="flex w-full flex-col gap-5"
    >
      <h3 id={headingId} className="sr-only">
        Formulario de contacto
      </h3>

      {/* Fila 1: Nombre, Correo, Teléfono lado a lado desde sm: — el form ya
          ocupa el 100% del ancho del contenedor, así que hay lugar de sobra;
          se apilan en mobile porque a 375px tres campos en fila no caben. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        <FormField id={nombreId} label="Nombre" error={errors.nombre}>
          <input
            id={nombreId}
            name="nombre"
            type="text"
            autoComplete="name"
            value={values.nombre}
            onChange={handleChange("nombre")}
            aria-invalid={Boolean(errors.nombre)}
            aria-describedby={errors.nombre ? `${nombreId}-error` : undefined}
            className={FIELD_CLASS}
          />
        </FormField>

        <FormField id={emailId} label="Correo electrónico" error={errors.email}>
          <input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange("email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${emailId}-error` : undefined}
            className={FIELD_CLASS}
          />
        </FormField>

        <FormField id={telefonoId} label="Teléfono" optional error={errors.telefono}>
          <input
            id={telefonoId}
            name="telefono"
            type="tel"
            autoComplete="tel"
            value={values.telefono}
            onChange={handleChange("telefono")}
            aria-invalid={Boolean(errors.telefono)}
            aria-describedby={errors.telefono ? `${telefonoId}-error` : undefined}
            className={FIELD_CLASS}
          />
        </FormField>
      </div>

      {/* Fila 2: Mensaje, a todo el ancho */}
      <FormField id={mensajeId} label="Mensaje" error={errors.mensaje}>
        <textarea
          id={mensajeId}
          name="mensaje"
          rows={4}
          value={values.mensaje}
          onChange={handleChange("mensaje")}
          aria-invalid={Boolean(errors.mensaje)}
          aria-describedby={errors.mensaje ? `${mensajeId}-error` : undefined}
          className={`${FIELD_CLASS} resize-none`}
        />
      </FormField>

      {status === "error" && serverError && (
        <p role="alert" className="text-sm text-red-300">
          {serverError}
        </p>
      )}

      {/* Fila 3: Enviar mensaje */}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center self-start rounded-xl bg-ldc-blue px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-ldc-blue/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:px-8 xl:rounded-[clamp(0.4447rem,0.5208vw,0.625rem)]"
      >
        {status === "submitting" ? "Enviando…" : "Enviar mensaje"}
      </button>
    </form>
  );
}

export default function Footer({
  headline = "Hagamos tu proyecto\nrealidad.",
  email = "ventas@ldc-lithosdev.com",
  logoSrc = "/images/logo-lockup.svg",
  logoAlt = "Lithos Development Company",
  companyName = "Lithos Development Company",
}: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer id="contacto" className="relative w-full overflow-hidden bg-ldc-navy">
      <div className="absolute inset-0" aria-hidden>
        <Image
          src="/images/footer-bg.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-bottom"
        />
      </div>

      <DecorativeMark className="pointer-events-none absolute right-6 top-6 size-16 text-ldc-gray opacity-40 mix-blend-overlay sm:right-10 sm:size-20 md:size-28 lg:size-36 xl:right-[clamp(3.0237rem,3.5417vw,4.25rem)] xl:top-[clamp(2.4456rem,2.8646vw,3.4375rem)] xl:size-[clamp(13.3843rem,15.6771vw,18.8125rem)]" />

      <div className="relative mx-auto max-w-[clamp(62.2526rem,72.9167vw,87.5rem)]">
        <AnimatedSection className="flex flex-col items-start px-6 py-16 md:px-10 md:py-20 xl:px-[clamp(1.7786rem,2.0833vw,2.5rem)] xl:py-[clamp(5.6917rem,6.6667vw,8rem)]">
          <Image
            src={logoSrc}
            alt={logoAlt}
            width={724}
            height={158}
            unoptimized
            className="h-10 w-auto sm:h-12 md:h-14 xl:h-[clamp(2.3678rem,2.7734vw,3.3281rem)]"
          />

          <h2 className="mt-5 max-w-md whitespace-pre-line font-display text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-white sm:max-w-xl sm:text-5xl md:max-w-2xl md:text-6xl lg:text-7xl xl:mt-[clamp(1.4229rem,1.6667vw,2rem)] xl:max-w-[clamp(39.8417rem,46.6667vw,56rem)] xl:text-[clamp(3.913rem,4.5833vw,5.5rem)] xl:leading-[1.1273] xl:tracking-[-0.03em]">
            {headline}
          </h2>

          {/* Formulario: vive entre el headline y el pill de email, siempre
              visible (no modal) — pedido explícito para que "se vea" el
              formulario real en vez de un trigger que lo esconde. w-full
              explícito: el padre es un flex items-start, que sin esto
              colapsaría el wrapper al ancho de su contenido en vez de dejar
              que el formulario ocupe el 100% del contenedor. */}
          <div className="mt-8 w-full md:mt-10 xl:mt-[clamp(1.7786rem,2.0833vw,2.5rem)]">
            <ContactForm />
          </div>

          {/* El pill vuelve a ser el mailto: directo original de Figma — ahora
              es una alternativa rápida junto al formulario, no su trigger. */}
          <a
            href={`mailto:${email}`}
            className="mt-8 inline-flex items-center gap-3 rounded-xl bg-white px-6 py-3 text-base text-black/85 transition-colors hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 md:mt-10 xl:mt-[clamp(1.7786rem,2.0833vw,2.5rem)] xl:gap-[clamp(0.5336rem,0.625vw,0.75rem)] xl:rounded-[clamp(0.4447rem,0.5208vw,0.625rem)] xl:px-[clamp(1.2451rem,1.4583vw,1.75rem)] xl:py-[clamp(0.7115rem,0.8333vw,1rem)] xl:text-[clamp(1.0227rem,1.1979vw,1.4375rem)]"
          >
            {email}
            <ArrowUpRightIcon className="size-4 xl:size-[clamp(0.8004rem,0.9375vw,1.125rem)]" />
          </a>

          <div className="mt-10 w-full border-t border-white/20 pt-4 xl:mt-[clamp(0.8893rem,1.0417vw,1.25rem)] xl:pt-[clamp(0.8893rem,1.0417vw,1.25rem)]">
            <p className="text-xs leading-relaxed text-white/60">
              © {year} {companyName}. Todos los derechos reservados.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </footer>
  );
}

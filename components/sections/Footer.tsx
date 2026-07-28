"use client";

import { useId, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import AnimatedSection from "@/components/AnimatedSection";
import { useModalBehavior } from "@/hooks/useModalBehavior";
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

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

const FIELD_CLASS =
  "w-full rounded-lg border border-black/15 bg-white px-4 py-2.5 text-base text-ldc-navy placeholder:text-ldc-ink/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ldc-blue focus-visible:outline-offset-1 aria-[invalid=true]:border-red-500";

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
      <label htmlFor={id} className="text-sm font-medium text-ldc-navy">
        {label}
        {optional && <span className="font-normal text-ldc-ink/50"> (opcional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

type SubmitStatus = "idle" | "submitting" | "success" | "error";

const EMPTY_FORM: ContactFormData = { nombre: "", email: "", telefono: "", mensaje: "" };

function ContactModal({ email, onClose }: { email: string; onClose: () => void }) {
  const { dialogRef, initialFocusRef } = useModalBehavior<HTMLInputElement>(onClose);
  const [values, setValues] = useState<ContactFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const titleId = useId();
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

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-ldc-navy/80 p-4 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative my-auto flex w-full max-w-md flex-col gap-6 rounded-lg bg-white p-6 shadow-2xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar formulario de contacto"
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full text-ldc-navy/60 transition-colors hover:bg-ldc-navy/10 hover:text-ldc-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-ldc-blue"
        >
          <CloseIcon className="size-5" />
        </button>

        {status === "success" ? (
          <div className="flex flex-col gap-3 py-4">
            <h3 id={titleId} className="font-display text-2xl font-bold text-ldc-navy">
              ¡Mensaje enviado!
            </h3>
            <p className="text-sm leading-relaxed text-ldc-ink/80">
              Gracias por escribirnos. Un miembro de nuestro equipo se pondrá en contacto contigo
              muy pronto.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-ldc-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ldc-navy/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ldc-blue focus-visible:outline-offset-2"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div>
              <h3 id={titleId} className="font-display text-2xl font-bold text-ldc-navy">
                Hablemos de tu proyecto
              </h3>
              <p className="mt-1 text-sm text-ldc-ink/70">
                Completa el formulario y te contactaremos a la brevedad, o escríbenos directamente
                a {email}.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <FormField id={nombreId} label="Nombre" error={errors.nombre}>
                <input
                  ref={initialFocusRef}
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
                <p role="alert" className="text-sm text-red-600">
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="mt-1 inline-flex items-center justify-center rounded-lg bg-ldc-blue px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-ldc-blue/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ldc-navy focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "submitting" ? "Enviando…" : "Enviar mensaje"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}

export default function Footer({
  headline = "Hagamos tu proyecto\nrealidad.",
  email = "ventas@ldc-lithosdev.com",
  logoSrc = "/images/logo-lockup.svg",
  logoAlt = "Lithos Development Company",
  companyName = "Lithos Development Company",
}: FooterProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-full overflow-hidden bg-ldc-navy">
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

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            aria-haspopup="dialog"
            aria-label={`Contactar a Lithos Development Company — abrir formulario de contacto (${email})`}
            className="mt-6 inline-flex items-center gap-3 rounded-xl bg-white px-6 py-3 text-base text-black/85 transition-colors hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 xl:mt-[clamp(1.7786rem,2.0833vw,2.5rem)] xl:gap-[clamp(0.5336rem,0.625vw,0.75rem)] xl:rounded-[clamp(0.4447rem,0.5208vw,0.625rem)] xl:px-[clamp(1.2451rem,1.4583vw,1.75rem)] xl:py-[clamp(0.7115rem,0.8333vw,1rem)] xl:text-[clamp(1.0227rem,1.1979vw,1.4375rem)]"
          >
            {email}
            <ArrowUpRightIcon className="size-4 xl:size-[clamp(0.8004rem,0.9375vw,1.125rem)]" />
          </button>

          <div className="mt-10 w-full border-t border-white/20 pt-4 xl:mt-[clamp(0.8893rem,1.0417vw,1.25rem)] xl:pt-[clamp(0.8893rem,1.0417vw,1.25rem)]">
            <p className="text-xs leading-relaxed text-white/60">
              © {year} {companyName}. Todos los derechos reservados.
            </p>
          </div>
        </AnimatedSection>
      </div>

      {isModalOpen && <ContactModal email={email} onClose={() => setIsModalOpen(false)} />}
    </footer>
  );
}

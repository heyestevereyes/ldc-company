@AGENTS.md

# LDC Company — Corporate Site

Sitio corporativo/institucional para "LDC Company". Next.js (App Router) +
TypeScript + Tailwind CSS v4.

## Reglas del proyecto

1. **El diseño viene de Figma vía MCP y debe replicarse EXACTAMENTE.**
   Colores, tipografías, tamaños y espaciados se toman tal cual los
   devuelve el MCP de Figma (`get_design_context`, `get_variable_defs`,
   `get_metadata`). Nunca aproximar ni inventar estilos — si un valor no
   viene del MCP, hay que pedirlo o volver a consultarlo, no adivinarlo.

   - **Estrategia responsive (desktop fluido):** el Figma de LDC solo
     tiene mockup para un frame fijo de escritorio (sin mobile/tablet),
     así que el sitio debe verse bien y escalar de forma continua en
     cualquier ancho de escritorio (1366px, 1536px, 1920px, 2560px...),
     no solo lucir "pixel perfect" al ancho del frame con saltos
     bruscos en otros anchos. Por eso: **todo tamaño o espaciado que en
     el Figma sea un valor fijo (tipografía, gaps, posiciones, padding,
     border-radius) debe convertirse a `clamp(mínimo, preferido, máximo)`
     proporcional al ancho del frame de referencia de Figma.**
     - `preferido = (valor-px / ancho-frame-figma) * 100vw`
     - `máximo = valor-px convertido a rem` (nunca crece más allá del
       valor exacto de Figma en monitores ultra anchos)
     - `mínimo = (valor-px * 1366 / ancho-frame-figma)` convertido a rem
       (el valor en el borde inferior del rango fluido, 1366px)
     - Este layout fiel a Figma vive detrás del breakpoint `xl:`
       (redefinir a 1366px en `globals.css` vía `--breakpoint-xl`), con
       el contenedor de contenido en `max-w-[<ancho-frame-figma-en-rem>]`
       centrado para no estirarse en ultra-wide.
     - **Por qué `xl:` y no un breakpoint con nombre custom:** Tailwind
       v4 agrupa los breakpoints con nombre arbitrario aparte de la
       escala default (sm/md/lg/xl/2xl) y los emite *antes* que esta en
       el CSS generado, sin importar su valor en px — eso rompe la
       cascada en cualquier vista que combine ese breakpoint custom con
       `md:`/`lg:` en la misma propiedad. Redefinir `--breakpoint-xl`
       evita el problema porque Tailwind sí ordena la escala default
       correctamente.
     - **Cuidado incluso con `xl:` ya arreglado:** en cualquier
       componente de un solo árbol que mezcle `sm:`/`md:` con `xl:` en
       la misma propiedad CSS, usar rangos acotados (`sm:max-xl:` /
       `md:max-xl:`) en vez de `sm:`/`md:` sueltos, para que sean
       mutuamente excluyentes con `xl:` y no dependan del orden de
       emisión del CSS. Verificar siempre con `getComputedStyle` en el
       navegador real a cada breakpoint, no solo mirando las clases.
   - **Mobile y tablet (< 1366px)** no tienen mockup de Figma: se
     resuelven con criterio de UX propio (layout apilado, nav
     colapsada, etc.), no como una versión escalada del layout de
     desktop. Si una sección es interactiva/mide su propio DOM (p. ej.
     un carrusel), usar un único árbol con clases responsivas en vez de
     duplicar el componente en versiones Desktop/Mobile — duplicar
     rompe las mediciones del componente en la instancia oculta.
   - **Verificación visual:** agregar Playwright como devDependency
     para capturar screenshots en varios anchos (375, 768, 1366, 1920,
     2560px) y confirmar que no haya saltos de layout al redimensionar.
     Usarlo al implementar o tocar el layout fluido de cualquier
     sección.

2. **Tipografías del proyecto:** definir según lo que entregue el
   cliente/Figma. Cargar como fuentes locales con `next/font/local`
   desde `src/lib/fonts.ts`, nunca vía Google Fonts CDN si el diseño
   especifica tipografías con licencia propia.

3. **Antes de implementar una sección, definir sus design tokens**
   (colores y tipografías) en `src/app/globals.css`, bloques `@theme` /
   `@theme inline` (Tailwind v4 — no hay `tailwind.config.ts`). Agregar
   los tokens de cada sección nueva ahí antes de escribir su JSX.

4. **Estructura de componentes por sección** en
   `src/components/sections/`, una por archivo, exportadas desde
   `src/components/sections/index.ts` y compuestas en orden en
   `src/app/page.tsx`.

5. **Los componentes reciben texto e imágenes por props desde el
   inicio** (interfaces `*Props` en cada archivo de sección), pensando
   en una futura integración de CMS headless. Ningún texto o imagen de
   contenido debe quedar hardcodeado dentro del componente; los valores
   por defecto de las props (si existen) son solo para
   desarrollo/preview.

6. **Animaciones de entrada al viewport: usar un componente
   `AnimatedSection`** (crear en `src/components/AnimatedSection.tsx`
   si no existe) — patrón estándar para toda sección, en vez de
   reimplementar `motion.div` + `whileInView` sueltos en cada
   componente.
   - Fade in + `translateY` sutil (~24px), dispara con `whileInView` y
     `viewport={{ once: true, amount: 0.2 }}`, transición ~0.6s
     `ease-out`.
   - Respeta `prefers-reduced-motion` automáticamente vía
     `useReducedMotion` de Framer Motion.
   - Acepta `delay` (en segundos) para escalonar (stagger) varios
     bloques dentro de una misma sección.
   - Para envolver un elemento que debe conservar su propia
     semántica/funcionalidad (p. ej. un `<a>` con `href`), envolver el
     elemento *dentro* de `<AnimatedSection>` en vez de reemplazarlo —
     no convertir links o botones reales en `div`s.
   - GSAP se reserva para timelines complejos o secuencias disparadas
     por scroll que Framer Motion no cubra bien; no usarlo para el
     fade-in estándar de sección (eso es trabajo de `AnimatedSection`).

## Estándares de desarrollo

Estos estándares aplican a **toda sección o componente que se
implemente**, sin que haya que pedirlos explícitamente cada vez.

**Responsive**
- Mobile-first con `clamp()` para el escalado fluido en desktop (regla
  1).
- Cada sección debe verse bien en mobile (375px), tablet (768px) y
  desktop (1920px+), aunque no exista mockup de Figma para esos
  tamaños — usar buen criterio de UX manteniendo la jerarquía visual y
  la paleta de la sección.

**Animación**
- Todas las secciones usan `AnimatedSection` (regla 6) para el fade-in
  + movimiento al entrar al viewport.
- Micro-interacciones en elementos interactivos: todo botón, link o
  campo de formulario debe tener estados de `hover` y `focus` visibles,
  con transición suave, nunca un cambio instantáneo.

**Accesibilidad**
- HTML semántico: `header`, `nav`, `main`, `section`, `footer` — no
  `div` genérico para todo.
- Un solo `<h1>` en la página; jerarquía lógica de `h2`/`h3` por
  sección a partir de ahí.
- `alt` descriptivo en toda imagen de contenido; `alt=""` solo en
  imágenes puramente decorativas.
- `aria-label` en botones que solo llevan ícono, más
  `aria-expanded`/`aria-controls` cuando el botón abre/cierra algo.
- Navegable por teclado: focus visible en todo elemento interactivo,
  orden de tab lógico.
- Contraste de color mínimo AA entre texto y fondo.

**Rendimiento**
- Toda imagen va con `next/image`, con `sizes` correcto y `priority`
  **solo** en la imagen above-the-fold. El resto, lazy loading por
  default.
  - Excepción: SVGs propios de UI se sirven con `Image` +
    `unoptimized` en vez de habilitar `dangerouslyAllowSVG`.
- Ancho/alto explícitos (o `fill` dentro de un contenedor con tamaño
  fijo) en toda imagen, para evitar layout shift.

**SEO**
- Metadata de Next.js (`title`, `description`, Open Graph) configurada
  por página vía el export `metadata`.
- Textos descriptivos, nunca genéricos: "Conoce más" sí, "Click aquí"
  no.

**Formularios**
- Validación inline con mensajes de error claros por campo — y nunca
  confiar solo en la validación del cliente: si un formulario pega a
  una API route propia, esa route debe validar de nuevo con las mismas
  reglas.
- Confirmación visible de envío exitoso o de error.

## Content language

Copy y textos de UI en español (mercado del cliente), a menos que se
indique lo contrario.

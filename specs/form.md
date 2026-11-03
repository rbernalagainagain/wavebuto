# Form

The v1 appointment form: its fields and every text it shows, in English and Spanish. This file is the source of truth for the fields
(`roadmap.md`, phase 2). It is derived from the Figma design, page "Web — v4" (`150:2`), frames "Landing — Desktop 1440" (`150:9`)
and "Landing — Mobile 390" (`210:61`), section "Contacto" (`175:110` and `210:70`). Every change from the design is listed under
[Differences from the design](#differences-from-the-design).

The rules for each field beyond "required" and its control (lengths, formats, date limits) are defined in phase 3, in the Zod
schema. Error messages come with them (phases 3 and 4); the sent and failed messages come with phase 6.

The Spanish text is a proposal for the artist to approve before launch (phase 11). It addresses the visitor as _tú_ and, like the
design, speaks as the artist in the first person, so it never needs to say who the artist is.

## Header

| Element | English            | Spanish           |
| ------- | ------------------ | ----------------- |
| Eyebrow | Bookings           | Reservas          |
| Title   | Tattoo appointment | Cita para tatuaje |
| Legend  | \* Required        | \* Obligatorio    |

## Fields

`*` marks a required field. The key is the field's name in the form value and in the request sent to `/api/contact`. No field has
placeholder or helper text: the design shows none for the fields kept in v1.

### 01 — Personal information / 01 — Datos personales

| Key         | Control | Req. | English        | Spanish       |
| ----------- | ------- | ---- | -------------- | ------------- |
| `name`      | text    | \*   | Name           | Nombre        |
| `instagram` | text    | \*   | Instagram      | Instagram     |
| `email`     | email   | \*   | Email          | Email         |
| `location`  | text    | \*   | City / Country | Ciudad / País |

### 02 — Tattoo / 02 — Tatuaje

| Key         | Control                 | Req. | English                      | Spanish                  |
| ----------- | ----------------------- | ---- | ---------------------------- | ------------------------ |
| `placement` | text                    | \*   | Body placement               | Zona del cuerpo          |
| `symmetry`  | radio group (3 options) |      | Symmetrical or asymmetrical? | ¿Simétrico o asimétrico? |

`symmetry` options:

| Value          | English      | Spanish    |
| -------------- | ------------ | ---------- |
| `symmetrical`  | Symmetrical  | Simétrico  |
| `asymmetrical` | Asymmetrical | Asimétrico |
| `not-sure`     | Not sure     | No lo sé   |

### 03 — Availability / 03 — Disponibilidad

| Key             | Control                 | Req. | English                      | Spanish                         |
| --------------- | ----------------------- | ---- | ---------------------------- | ------------------------------- |
| `dates`         | date range (see below)  | \*   | Preferred date / dates       | Fecha o fechas preferidas       |
| `flexibleDates` | radio group (2 options) |      | Are you flexible with dates? | ¿Tienes flexibilidad de fechas? |

`dates` is a range made of two native date inputs (`<input type="date">`), grouped under the field's label:

| Key          | Req. | English | Spanish | Meaning                                         |
| ------------ | ---- | ------- | ------- | ----------------------------------------------- |
| `dates.from` | \*   | From    | Desde   | The first day that suits the person.            |
| `dates.to`   |      | To      | Hasta   | The last day. Empty means a single day: `from`. |

`flexibleDates` options:

| Value | English | Spanish |
| ----- | ------- | ------- |
| `yes` | Yes     | Sí      |
| `no`  | No      | No      |

### 04 — Additional information / 04 — Información adicional

| Key             | Control                 | Req. | English                                                                 | Spanish                                                  |
| --------------- | ----------------------- | ---- | ----------------------------------------------------------------------- | -------------------------------------------------------- |
| `tattooHistory` | radio group (3 options) |      | Is this your first tattoo, or do you already have tattoos in this area? | ¿Es tu primer tatuaje o ya tienes tatuajes en esta zona? |
| `notes`         | multi-line text         |      | Anything else I should know?                                            | ¿Algo más que deba saber?                                |

`tattooHistory` options:

| Value         | English                              | Spanish                              |
| ------------- | ------------------------------------ | ------------------------------------ |
| `first`       | First tattoo                         | Primer tatuaje                       |
| `same-area`   | I already have tattoos in this area  | Ya tengo tatuajes en esta zona       |
| `other-areas` | I have tattoos, but not in this area | Tengo tatuajes, pero no en esta zona |

### Sending (no group title)

The design's last group ("Acciones") has no visible title. It holds, in this order: the consent checkbox, the privacy notice, the
button and the notice.

| Key       | Control  | Req. | English                                                  | Spanish                                                       |
| --------- | -------- | ---- | -------------------------------------------------------- | ------------------------------------------------------------- |
| `consent` | checkbox | \*   | I agree that my details are used to answer this request. | Acepto que mis datos se usen para responder a esta solicitud. |

Below the checkbox, before the button, the privacy notice:

> **Placeholder.** Invented for development; it must be replaced with the artist's real notice before launch (`roadmap.md`,
> phase 11). The address uses the reserved `.example` domain, so it cannot reach anyone by mistake.

- **English:** Your details reach me by email and I use them only to answer this request. I do not share them with anyone. To have
  them deleted, write to me at hello@wavebuto.example.
- **Spanish:** Tus datos me llegan por email y solo los uso para responder a esta solicitud. No los comparto con nadie. Para que los
  borre, escríbeme a hello@wavebuto.example.

| Element | English                                                                                                        | Spanish                                                                                            |
| ------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Button  | Send request                                                                                                   | Enviar solicitud                                                                                   |
| Notice  | Submitting this form does not guarantee an appointment. I will review your request and contact you personally. | Enviar este formulario no garantiza una cita. Revisaré tu solicitud y te contactaré personalmente. |

The button's arrow icon is decoration, not text, and is styled in phase 9.

## Design inventory

Every element of the form in the design, and where it went. Desktop and mobile show the same elements with the same text; they
differ only in layout (one column on mobile, two fields per row in group 01 on desktop).

| Design group (desktop / mobile)                   | Design layer                   | Design text                                                                 | In this file                |
| ------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------- | --------------------------- |
| Cabecera (`175:111` / `210:71`)                   | Etiqueta, Título, Leyenda      | BOOKINGS · TATTOO APPOINTMENT · \* REQUIRED                                 | Header                      |
| 01 — Personal information (`566:202`/`566:259`)   | Campo — Name                   | NAME \*                                                                     | `name`                      |
|                                                   | Campo — Instagram              | INSTAGRAM \*                                                                | `instagram`                 |
|                                                   | Campo — Email (type=email)     | EMAIL \*                                                                    | `email`                     |
|                                                   | Campo — City / Country         | CITY / COUNTRY \*                                                           | `location`                  |
| 02 — Tattoo (`566:212` / `566:269`)               | Campo — Body placement         | BODY PLACEMENT \*                                                           | `placement`                 |
|                                                   | Campo — Symmetry               | SYMMETRICAL OR ASYMMETRICAL? · Symmetrical · Asymmetrical · Not sure        | `symmetry`                  |
| 03 — References (`566:223` / `566:280`)           | Campo — Reference from my work | REFERENCE FROM MY WORK · UPLOAD IMAGE · helper text                         | Not in v1 (see differences) |
|                                                   | Campo — Additional references  | ADDITIONAL REFERENCES · UPLOAD IMAGES                                       | Not in v1 (see differences) |
|                                                   | Campo — Body photo             | BODY PHOTO · UPLOAD IMAGE · helper text                                     | Not in v1 (see differences) |
| 04 — Availability (`566:231` / `566:288`)         | Campo — Preferred dates        | PREFERRED DATE / DATES \*                                                   | `dates` (group 03)          |
|                                                   | Campo — Flexible dates         | ARE YOU FLEXIBLE WITH DATES? · Yes · No                                     | `flexibleDates` (group 03)  |
| 05 — Additional information (`566:241`/`566:298`) | Campo — Tattoo history         | IS THIS YOUR FIRST TATTOO, OR DO YOU ALREADY HAVE TATTOOS IN THIS AREA? · … | `tattooHistory` (group 04)  |
|                                                   | Campo — Anything else          | ANYTHING ELSE I SHOULD KNOW?                                                | `notes` (group 04)          |
| Acciones (`566:252` / `566:309`)                  | Send request                   | SEND REQUEST                                                                | Button                      |
|                                                   | Aviso                          | Submitting this form does not guarantee an appointment. …                   | Notice                      |

## Differences from the design

- **No references.** Group "03 — References" (reference from my work, additional references, body photo) is not in v1: reference
  images come after v1 (`roadmap.md`, phase 12). The groups after it move up, so the form has four groups, numbered 01–04.
- **No field describes the tattoo.** The design has none and none is added; the tattoo is described by its placement, its symmetry
  and "Anything else".
- **Dates are a range of native date pickers.** The design has one single-line field; v1 has two date inputs under the design's
  label. The "From" and "To" labels are new.
- **A required consent checkbox and a privacy notice** are added before "Send request". They are not in the design.
- **Spanish text** is new: the design is in English only.
- **Casing.** The design shows labels, group titles and the button in capitals; that is styling (phase 9), so the text here is in
  sentence case.

## Provisional answers, pending the artist

The questions of phase 2's review (`specs/2026-11-03-form-fields/plan.md`, group 2) were answered by the developer, not the artist,
so work can go on. Each answer is the one that changes least, so it is easy to revisit. The artist still has to confirm them; until
then, phase 2 is not closed (`specs/2026-11-03-form-fields/validation.md`). An answer the artist changes is recorded under
[Differences from the design](#differences-from-the-design) when it departs from the design, and this section is removed once all
are confirmed.

1. **Is anything missing?** With these fields, can you answer a request, or do you need to know something else first (for example
   the tattoo's size, or colour or black and grey)?
   **Provisional:** nothing is added. Size, colour or anything else about the tattoo goes in "Anything else I should know?", as
   `roadmap.md` phase 2 decided ("no field describes the tattoo").
2. **Tattoo history.** The question asks "first tattoo, or tattoos in this area?", but its third option ("I have tattoos, but not in
   this area") answers a broader question. Keep the label as in the design, or change it to "Do you already have tattoos?"
   ("¿Ya tienes tatuajes?")?
   **Provisional:** the design's label is kept. The three options make the question clear enough, and the change is one line of
   text if the artist wants it.
3. **Dates.** Two date pickers, "From" and "To", where an empty "To" means a single day. Does that work for how you plan
   appointments?
   **Provisional:** yes, as written under [03 — Availability](#03--availability--03--disponibilidad), together with "Are you flexible
   with dates?".
4. **Voice of the privacy notice.** The placeholder speaks in your first person ("Your details reach me…"), like the design's notice.
   Should the real one (phase 11) do the same?
   **Provisional:** yes, the real notice speaks in the first person too, like the rest of the form's text.

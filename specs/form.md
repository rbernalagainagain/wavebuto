# Form

The v1 appointment form: its fields and every text it shows, in English and Spanish. This file is the source of truth for the fields
(`roadmap.md`, phase 2). It comes from the Figma design, page "Web — v4" (`150:2`), with the changes agreed with the artist listed
under [Differences from the design](#differences-from-the-design).

The rules for each field beyond "required" and its type (lengths, formats, date limits) are defined in phase 3, in the Zod schema.
Error messages come with them (phases 3 and 4); the sent and failed messages come with phase 6.

The Spanish text is a proposal for the artist to approve. It addresses the visitor as _tú_.

## Header

| Element | English            | Spanish           |
| ------- | ------------------ | ----------------- |
| Eyebrow | Bookings           | Reservas          |
| Title   | Tattoo appointment | Cita para tatuaje |
| Legend  | \* Required        | \* Obligatorio    |

## Fields

`*` marks a required field. The key is the field's name in the form value and in the request sent to `/api/contact`.

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

| Key             | Control                 | Req. | English                                                                 | Spanish                                                   |
| --------------- | ----------------------- | ---- | ----------------------------------------------------------------------- | --------------------------------------------------------- |
| `tattooHistory` | radio group (3 options) |      | Is this your first tattoo, or do you already have tattoos in this area? | ¿Es tu primer tatuaje, o ya tienes tatuajes en esta zona? |
| `notes`         | multi-line text         |      | Anything else I should know?                                            | ¿Algo más que deba saber?                                 |

`tattooHistory` options:

| Value         | English                              | Spanish                              |
| ------------- | ------------------------------------ | ------------------------------------ |
| `first`       | First tattoo                         | Primer tatuaje                       |
| `same-area`   | I already have tattoos in this area  | Ya tengo tatuajes en esta zona       |
| `other-areas` | I have tattoos, but not in this area | Tengo tatuajes, pero no en esta zona |

### Sending / Envío

| Key       | Control  | Req. | English                                                  | Spanish                                                       |
| --------- | -------- | ---- | -------------------------------------------------------- | ------------------------------------------------------------- |
| `consent` | checkbox | \*   | I agree that my details are used to answer this request. | Acepto que mis datos se usen para responder a esta solicitud. |

Below the checkbox, before the button, the privacy notice:

> **Placeholder.** Invented for development; it must be replaced with the artist's real notice before launch (`roadmap.md`,
> phase 11). The address uses the reserved `.example` domain, so it cannot reach anyone by mistake.

- **English:** Your details are sent to the artist by email and are used only to answer this request. They are not shared with anyone
  else. To have them deleted, write to hello@wavebuto.example.
- **Spanish:** Tus datos se envían al artista por email y solo se usan para responder a esta solicitud. No se comparten con nadie más.
  Para que se borren, escribe a hello@wavebuto.example.

| Element | English                                                                                                        | Spanish                                                                                            |
| ------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Button  | Send request                                                                                                   | Enviar solicitud                                                                                   |
| Notice  | Submitting this form does not guarantee an appointment. I will review your request and contact you personally. | Enviar este formulario no garantiza una cita. Revisaré tu solicitud y te contactaré personalmente. |

## Differences from the design

- **No references.** Group "03 — References" (reference from my work, additional references, body photo) is not in v1: reference
  images come after v1 (`roadmap.md`, phase 12). The groups after it move up, so the form has four groups, numbered 01–04.
- **No field describes the tattoo.** The design has none and none is added; the tattoo is described by its placement, its symmetry
  and "Anything else".
- **Dates are a range of native date pickers**, not one text field. The design's label is kept; the "From" and "To" labels are new.
- **A required consent checkbox and a privacy notice** are added before "Send request". They are not in the design.
- **Spanish text** is new: the design is in English only.
- **Casing.** The design shows labels in capitals; that is styling (phase 9), so the text here is in sentence case.

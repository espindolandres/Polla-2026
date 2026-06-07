# Polla Mundial 2026

Aplicación web profesional para una polla/quiniela del Mundial 2026 construida con React, Vite, Tailwind CSS y Supabase. Está pensada para amigos, familiares o equipos de trabajo. No procesa pagos, apuestas ni dinero dentro de la app.

## Stack

- React + Vite
- Tailwind CSS
- Supabase Auth
- Supabase Database
- Supabase Row Level Security
- GitHub Pages

## Funcionalidades incluidas

- Registro e inicio de sesión con correo y contraseña.
- Creación automática de perfil al registrarse.
- Alias obligatorio y único.
- Rutas protegidas para participantes.
- Ruta `/admin` protegida por rol `admin`.
- Pronósticos por partido con bloqueo automático al inicio.
- Pronósticos especiales: campeón, subcampeón, goleador y selección sorpresa.
- Tabla de posiciones automática con desempate por marcadores exactos y resultados acertados.
- Panel administrador para crear, editar, importar y actualizar partidos.
- Recalcular puntos desde Supabase RPC.
- Exportar pronósticos y tabla de posiciones a CSV.
- Modo oscuro, mobile-first, diseño deportivo moderno.
- Configuración preparada para GitHub Pages.

## Estructura principal

```txt
.
├── .env.example
├── README.md
├── package.json
├── vite.config.js
├── supabase/
│   ├── schema.sql
│   └── policies.sql
└── src/
    ├── components/
    ├── context/
    ├── data/matches.example.json
    ├── hooks/
    ├── lib/supabaseClient.js
    ├── pages/
    └── utils/
```

## Instalación local

```bash
npm install
cp .env.example .env
npm run dev
```

Edita `.env`:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_SUPABASE_ANON_KEY
VITE_BASE_PATH=/
```

Nunca pongas la `service_role key` en el frontend.

## Configuración de Supabase

1. Crea un proyecto en Supabase.
2. En **Authentication > Providers**, activa Email.
3. En **SQL Editor**, ejecuta primero:

```sql
-- supabase/schema.sql
```

4. Después ejecuta:

```sql
-- supabase/policies.sql
```

El archivo `schema.sql` crea tablas, funciones, triggers y vistas. El archivo `policies.sql` activa RLS, crea políticas y ajusta privilegios de API.

## Crear el primer administrador

1. Regístrate desde la app con correo, contraseña y alias.
2. En Supabase SQL Editor ejecuta:

```sql
update public.profiles
set role = 'admin'
where email = 'tu-correo@ejemplo.com';
```

3. Cierra sesión y vuelve a entrar. Verás el enlace al panel `/admin`.

Después puedes cambiar roles con la función segura:

```sql
select public.set_user_role('UUID_DEL_USUARIO', 'admin');
```

## Cargar partidos

La fuente oficial de referencia debe ser FIFA:

https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums

Opciones:

1. Entrar a `/admin/matches` y crear/editar partidos manualmente.
2. Entrar a `/admin/import`, descargar `matches.example.json`, completar los 104 partidos con datos oficiales y cargar el archivo.

El archivo `src/data/matches.example.json` es una plantilla editable. No incluye fixtures inventados; usa valores `null`/TBD donde falta información.

Campos esperados para importar:

```json
{
  "match_number": 1,
  "phase": "Fase de grupos",
  "group_name": "Grupo A",
  "home_team": null,
  "away_team": null,
  "match_date": "2026-06-11T00:00:00.000Z",
  "stadium": "Mexico City Stadium",
  "city": "Mexico City",
  "home_score": null,
  "away_score": null,
  "status": "scheduled"
}
```

## Actualizar resultados

1. Entra como admin.
2. Ve a `/admin/results`.
3. Ingresa `home_score`, `away_score` y cambia `status` a `finished`.
4. Guarda. La app recalcula puntos de ese partido.

También puedes recalcular todo desde `/admin` o `/admin/results`.

## Cambiar reglas de puntuación

Entra a `/admin/settings` y edita:

- Puntos por marcador exacto.
- Puntos por resultado acertado.
- Bonus por campeón.
- Bonus por subcampeón.
- Fecha límite de pronósticos especiales.
- Campeón y subcampeón oficiales al terminar el torneo.

Al guardar, se ejecuta `recalculate_all_points`.

Reglas por defecto:

- 3 puntos por marcador exacto.
- 1 punto por acertar ganador o empate.
- 5 puntos por campeón.
- 3 puntos por subcampeón.

## Exportar CSV

Entra a `/admin` y usa:

- **Exportar pronósticos CSV**
- **Exportar tabla CSV**

`predictions_export_view` usa `security_invoker`, por lo que respeta RLS: los usuarios normales no pueden exportar predicciones de otros usuarios; los admins sí.

## Seguridad

- RLS activado en `profiles`, `matches`, `predictions`, `bonus_predictions` y `settings`.
- Los usuarios solo pueden editar sus propios pronósticos.
- Los pronósticos se bloquean si el partido ya inició.
- Los puntos, marcadores exactos y resultados acertados se calculan en base de datos por trigger/RPC.
- Los usuarios no tienen permisos de escritura sobre `points`, `exact_score` ni `correct_result`.
- Los admins pueden recalcular puntos mediante funciones `security definer` con validación de rol.
- El frontend solo usa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

## GitHub Pages

`vite.config.js` está preparado para GitHub Pages:

```js
base: process.env.VITE_BASE_PATH || (mode === 'production' ? '/NOMBRE_DEL_REPOSITORIO/' : '/')
```

Para publicar:

1. Crea un repositorio en GitHub.
2. Ajusta `.env`:

```env
VITE_BASE_PATH=/NOMBRE_DEL_REPOSITORIO/
```

Para desarrollo local puedes dejar `VITE_BASE_PATH=/`.

3. Sube el código:

```bash
git init
git add .
git commit -m "Polla Mundial 2026"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/NOMBRE_DEL_REPOSITORIO.git
git push -u origin main
```

4. Despliega:

```bash
npm run deploy
```

5. En GitHub, ve a **Settings > Pages** y selecciona la rama `gh-pages`.

La app incluye `public/404.html` y restauración de ruta en `src/main.jsx` para que las rutas directas funcionen en GitHub Pages con `BrowserRouter`.

## Rutas incluidas

- `/`
- `/login`
- `/register`
- `/dashboard`
- `/matches`
- `/predictions`
- `/leaderboard`
- `/rules`
- `/profile`
- `/admin`
- `/admin/matches`
- `/admin/results`
- `/admin/import`
- `/admin/settings`

## Siguiente ajuste recomendado antes de producción

Carga el calendario definitivo desde FIFA y revisa zonas horarias de `match_date`. Supabase almacena `timestamptz`; usa fechas ISO con zona horaria para evitar bloqueos antes o después de la hora real del partido.

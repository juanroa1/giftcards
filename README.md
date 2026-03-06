# RBM Daily Downloader (Vercel + Supabase)

Job en Node.js que:
1. Abre `https://infoproduccion.rbm.com.co/webclient/Login.xhtml`
2. Hace login
3. Entra a `Salidas`
4. Descarga todos los archivos cuyo nombre inicia con `MV` (configurable)
5. Los sube a Supabase Storage con `upsert` (reemplaza)

## Frecuencia
Configurado en Vercel Cron para correr todos los dias a las **07:00 AM Colombia** (`12:00 UTC`):
- `/vercel.json` -> `0 12 * * *`

## Variables de entorno
Configura en Vercel Project Settings -> Environment Variables:

- `LOGIN_URL`
- `RBM_USERNAME`
- `RBM_PASSWORD`
- `USERNAME_SELECTOR`
- `PASSWORD_SELECTOR`
- `SUBMIT_SELECTOR`
- `SALIDAS_PARENT_SELECTOR` (opcional)
- `SALIDAS_SELECTOR`
- `DOWNLOAD_SELECTOR`
- `FILE_PREFIX` (ej: `MV`)
- `TIMEOUT_MS`
- `POST_LOGIN_WAIT_MS`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_BUCKET`
- `SUPABASE_OBJECT_PATH` (carpeta destino, ej. `salidas`)

Usa `.env.example` como referencia.

## Deploy
1. Crea repo y sube este proyecto.
2. Importa el repo en Vercel.
3. Define variables de entorno.
4. Despliega.

## Ejecucion local (opcional)
```bash
npm install
npm start
```

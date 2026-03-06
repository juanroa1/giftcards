import { loadConfig } from '../src/config.js';
import { runJob } from '../src/downloader.js';

export default async function handler(req, res) {
  try {
    const config = loadConfig();
    const result = await runJob(config);
    return res.status(200).json({
      ok: true,
      message: 'Descarga y carga finalizadas',
      result,
      ranAtUtc: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      ranAtUtc: new Date().toISOString()
    });
  }
}

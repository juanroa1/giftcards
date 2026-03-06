import { chromium as playwrightChromium } from 'playwright-core';
import chromium from '@sparticuz/chromium';
import { createClient } from '@supabase/supabase-js';

async function launchBrowser() {
  const executablePath = process.env.CHROMIUM_EXECUTABLE_PATH || (await chromium.executablePath());

  return playwrightChromium.launch({
    args: chromium.args,
    executablePath,
    headless: true
  });
}

async function loginAndGoToSalidas(page, config) {
  await page.goto(config.loginUrl, { waitUntil: 'domcontentloaded', timeout: config.timeoutMs });

  await page.locator(config.usernameSelector).fill(config.username, { timeout: config.timeoutMs });
  await page.locator(config.passwordSelector).fill(config.password, { timeout: config.timeoutMs });

  await Promise.all([
    page.waitForLoadState('networkidle', { timeout: config.timeoutMs }).catch(() => undefined),
    page.locator(config.submitSelector).click({ timeout: config.timeoutMs })
  ]);

  if (config.postLoginWaitMs > 0) {
    await page.waitForTimeout(config.postLoginWaitMs);
  }

  if (config.salidasParentSelector) {
    await page.locator(config.salidasParentSelector).click({ timeout: config.timeoutMs });
  }

  await page.locator(config.salidasSelector).click({ timeout: config.timeoutMs });
}

function normalizePrefix(basePath) {
  const clean = (basePath || '').trim().replace(/^\/+/, '').replace(/\/+$/, '');
  return clean;
}

async function getBufferFromDownload(download) {
  const content = await download.createReadStream();
  if (!content) {
    throw new Error('No fue posible leer el archivo descargado.');
  }

  const chunks = [];
  for await (const chunk of content) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function getTargetFileNames(page, config) {
  const names = await page.locator(config.downloadSelector).allTextContents();
  return names
    .map((text) => text.trim())
    .filter((name) => name.toUpperCase().startsWith(config.filePrefix.toUpperCase()));
}

async function downloadFiles(page, config, names) {
  const files = [];

  for (const name of names) {
    const downloadPromise = page.waitForEvent('download', { timeout: config.timeoutMs });
    await page.locator(config.downloadSelector, { hasText: name }).first().click({ timeout: config.timeoutMs });
    const download = await downloadPromise;
    const filename = download.suggestedFilename() || name;
    const buffer = await getBufferFromDownload(download);
    files.push({ filename, buffer });
  }

  return files;
}

async function uploadToSupabase(config, files) {
  const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);
  const basePath = normalizePrefix(config.supabaseObjectPath);

  const uploaded = [];
  for (const file of files) {
    const path = basePath ? `${basePath}/${file.filename}` : file.filename;
    const { error } = await supabase.storage
      .from(config.supabaseBucket)
      .upload(path, file.buffer, {
        upsert: true,
        contentType: 'application/octet-stream'
      });

    if (error) {
      throw new Error(`Error subiendo ${file.filename} a Supabase: ${error.message}`);
    }

    uploaded.push(path);
  }

  return uploaded;
}

export async function runJob(config) {
  const browser = await launchBrowser();
  try {
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();

    await loginAndGoToSalidas(page, config);
    const fileNames = await getTargetFileNames(page, config);
    if (!fileNames.length) {
      throw new Error(`No se encontraron archivos con prefijo "${config.filePrefix}" en Salidas.`);
    }

    const files = await downloadFiles(page, config, fileNames);
    const uploadedPaths = await uploadToSupabase(config, files);

    return {
      ok: true,
      filePrefix: config.filePrefix,
      filesDownloaded: files.map((f) => f.filename),
      uploadedTo: uploadedPaths.map((p) => `${config.supabaseBucket}/${p}`)
    };
  } finally {
    await browser.close();
  }
}

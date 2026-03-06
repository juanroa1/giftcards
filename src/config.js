const REQUIRED_VARS = [
  'RBM_USERNAME',
  'RBM_PASSWORD',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_BUCKET',
  'USERNAME_SELECTOR',
  'PASSWORD_SELECTOR',
  'SUBMIT_SELECTOR',
  'SALIDAS_SELECTOR'
];

function get(name, fallback = '') {
  return process.env[name] ?? fallback;
}

export function loadConfig() {
  const config = {
    loginUrl: get('LOGIN_URL', 'https://infoproduccion.rbm.com.co/webclient/Login.xhtml'),
    username: get('RBM_USERNAME'),
    password: get('RBM_PASSWORD'),
    supabaseUrl: get('SUPABASE_URL'),
    supabaseServiceRoleKey: get('SUPABASE_SERVICE_ROLE_KEY'),
    supabaseBucket: get('SUPABASE_BUCKET'),
    supabaseObjectPath: get('SUPABASE_OBJECT_PATH', 'salidas'),
    usernameSelector: get('USERNAME_SELECTOR'),
    passwordSelector: get('PASSWORD_SELECTOR'),
    submitSelector: get('SUBMIT_SELECTOR'),
    salidasSelector: get('SALIDAS_SELECTOR'),
    downloadSelector: get('DOWNLOAD_SELECTOR', 'a.ItemName'),
    filePrefix: get('FILE_PREFIX', 'MV'),
    salidasParentSelector: get('SALIDAS_PARENT_SELECTOR'),
    postLoginWaitMs: Number(get('POST_LOGIN_WAIT_MS', '2500')),
    timeoutMs: Number(get('TIMEOUT_MS', '45000'))
  };

  const missing = REQUIRED_VARS.filter((name) => !get(name));
  if (missing.length) {
    throw new Error(`Faltan variables de entorno obligatorias: ${missing.join(', ')}`);
  }

  return config;
}

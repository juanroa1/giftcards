function inspectValue(value) {
  const raw = value ?? '';
  const trimmed = raw.trim();
  return {
    isSet: raw.length > 0,
    length: raw.length,
    trimmedLength: trimmed.length,
    hasLeadingOrTrailingSpaces: raw.length !== trimmed.length
  };
}

export default async function handler(req, res) {
  const username = inspectValue(process.env.RBM_USERNAME);
  const password = inspectValue(process.env.RBM_PASSWORD);

  return res.status(200).json({
    ok: true,
    variables: {
      RBM_USERNAME: username,
      RBM_PASSWORD: password
    },
    ranAtUtc: new Date().toISOString()
  });
}

/* ===== CV repo layout helpers ===== */
const REPO_ROOT = "repo";
const REGISTRY_URL = "CV_master_registry.json";

let _registryCache = null;

async function loadRegistry() {
  if (_registryCache) return _registryCache;
  try {
    const res = await fetch(REGISTRY_URL);
    if (res.ok) {
      const data = await res.json();
      _registryCache = data.cvs || [];
      return _registryCache;
    }
  } catch (e) {
    /* ignore */
  }
  _registryCache = [];
  return _registryCache;
}

function registryEntryFor(id, registry) {
  return (registry || []).find((c) => c.id === id);
}

function cvRepoFolder(id, registryEntry) {
  if (registryEntry && registryEntry.repoFolder) return registryEntry.repoFolder;
  const cap = id.charAt(0).toUpperCase() + id.slice(1);
  return `repo_CV_${cap}`;
}

function cvJsonPath(id, repoFolder) {
  const folder = repoFolder || cvRepoFolder(id);
  return `${REPO_ROOT}/${folder}/cv.json`;
}

function cvFolderPath(id, repoFolder) {
  const folder = repoFolder || cvRepoFolder(id);
  return `${REPO_ROOT}/${folder}/`;
}

function isAbsoluteUrl(path) {
  return /^(https?:|data:|\/)/.test(path || "");
}

function cvAssetPath(id, relativePath, baseOverride) {
  if (!relativePath) return "";
  if (isAbsoluteUrl(relativePath)) return relativePath;
  const base = baseOverride != null ? baseOverride : cvFolderPath(id);
  return base + String(relativePath).replace(/^\.\//, "");
}

function cvThumbPath(id, thumb, repoFolder) {
  return cvAssetPath(id, thumb || "CV_Java_images/default-avatar.png", cvFolderPath(id, repoFolder));
}

function defaultAssetFolders(id) {
  const cap = id.charAt(0).toUpperCase() + id.slice(1);
  return {
    images: `CV_${cap}_images`,
    demos: `CV_${cap}_demos`,
    assets: `CV_${cap}_assets`,
  };
}

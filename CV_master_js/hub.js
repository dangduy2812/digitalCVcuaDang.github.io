/* ===== Master hub: list all CVs from manifest + local drafts ===== */
const DRAFTS_KEY = "cv-drafts";

function getDrafts() {
  try {
    return JSON.parse(localStorage.getItem(DRAFTS_KEY) || "{}");
  } catch (e) {
    return {};
  }
}

function renderTiles(list) {
  const grid = document.getElementById("cv-grid");
  const tiles = list
    .map((cv) => {
      const accent = cv.accent || "#a50064";
      const title = localize(cv.title) || cv.id;
      const role = localize(cv.role);
      const thumb = cvThumbPath(cv.id, cv.thumbnail, cv.repoFolder);
      const draftBadge = cv._draft
        ? `<span class="cv-tile-meta" style="color:var(--momo-pink)">● Local draft (chưa export)</span>`
        : cv.updated
        ? `<span class="cv-tile-meta">Updated: ${esc(cv.updated)}</span>`
        : "";
      return `
      <article class="cv-tile" style="--tile-accent:${esc(accent)}">
        <div class="cv-tile-banner"></div>
        <div class="cv-tile-body">
          <img class="cv-tile-thumb" src="${esc(thumb)}" alt="${esc(title)}" />
          <h3>${esc(title)}</h3>
          <p class="cv-tile-role">${esc(role)}</p>
          ${draftBadge}
          <div class="cv-tile-actions">
            <a class="cv-tile-open" href="cv.html?id=${encodeURIComponent(cv.id)}" data-i18n="hub_open">Open CV</a>
            <a class="cv-tile-edit" href="editor.html?id=${encodeURIComponent(cv.id)}" data-i18n="hub_edit">Edit</a>
          </div>
        </div>
      </article>`;
    })
    .join("");

  const newTile = `
    <a class="cv-tile cv-tile-new" href="editor.html">
      <i class="icon-plus"></i>
      <span data-i18n="hub_new">New CV</span>
    </a>`;

  grid.innerHTML = tiles + newTile;
  applyLanguage(currentLang);
}

function esc(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

document.addEventListener("DOMContentLoaded", async () => {
  initChrome();

  let manifest = await loadRegistry();

  // Merge local drafts not present in manifest
  const drafts = getDrafts();
  const ids = new Set(manifest.map((c) => c.id));
  Object.values(drafts).forEach((d) => {
    if (!ids.has(d.id)) {
      const folders = defaultAssetFolders(d.id);
      manifest.push({
        id: d.id,
        title: (d.meta && d.meta.role) || { en: d.id, vi: d.id },
        role: (d.meta && d.meta.role) || { en: "", vi: "" },
        accent: (d.meta && d.meta.accent) || "#a50064",
        thumbnail: (d.meta && d.meta.avatar) || `${folders.images}/default-avatar.png`,
        repoFolder: cvRepoFolder(d.id),
        _draft: true,
      });
    }
  });

  renderTiles(manifest);
});

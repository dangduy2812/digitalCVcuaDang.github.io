/* ===== Visual CV editor ===== */
const DRAFTS_KEY = "cv-drafts";
let state = null;
let previewReady = false;
let previewTimer = null;

/* ---------- utils ---------- */
function escAttr(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
function getPath(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
function setPath(obj, path, val) {
  const keys = path.split(".");
  let o = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (o[k] == null) o[k] = /^\d+$/.test(keys[i + 1]) ? [] : {};
    o = o[k];
  }
  o[keys[keys.length - 1]] = val;
}

function blankCV(id) {
  return {
    id: id || "",
    meta: { name: "", role: { en: "", vi: "" }, accent: "#a50064", avatar: "", cvPdf: "", tags: [] },
    contact: { gender: { en: "", vi: "" }, dob: "", phone: "", email: "", address: { en: "", vi: "" }, facebook: "", linkedin: "", github: "" },
    sections: {
      about: { enabled: true, title: { en: "Career Objective", vi: "Mục tiêu nghề nghiệp" }, text: { en: "", vi: "" } },
      experience: { enabled: true, title: { en: "Experience", vi: "Kinh nghiệm" }, items: [] },
      education: { enabled: true, title: { en: "Education", vi: "Học vấn" }, items: [] },
      skills: { enabled: true, title: { en: "Skills", vi: "Kỹ năng" }, items: [] },
      interests: { enabled: false, title: { en: "Interests", vi: "Sở thích" }, items: [] },
      certificates: { enabled: false, title: { en: "Certificates", vi: "Chứng chỉ" }, subtitle: { en: "", vi: "" }, items: [] },
      projects: { enabled: false, title: { en: "Projects", vi: "Dự án" }, subtitle: { en: "", vi: "" }, items: [] },
      gallery: { enabled: false, title: { en: "Gallery", vi: "Thư viện" }, subtitle: { en: "", vi: "" }, items: [] },
    },
  };
}

/* ---------- field builders ---------- */
function field(label, path, value, type) {
  type = type || "text";
  const tag = type === "textarea" ? "textarea" : "input";
  const typeAttr = type === "textarea" ? "" : `type="${type}"`;
  const val = escAttr(value);
  if (tag === "textarea") {
    return `<div class="editor-field"><label>${label}</label><textarea data-path="${path}">${val}</textarea></div>`;
  }
  return `<div class="editor-field"><label>${label}</label><input ${typeAttr} data-path="${path}" value="${val}" /></div>`;
}
function bilingual(label, path, obj) {
  obj = obj || {};
  return `<div class="editor-field"><label>${label}</label>
    <div class="editor-bilingual">
      <input data-path="${path}.en" value="${escAttr(obj.en)}" placeholder="EN" />
      <input data-path="${path}.vi" value="${escAttr(obj.vi)}" placeholder="VI" />
    </div></div>`;
}
function bilingualArea(label, path, obj) {
  obj = obj || {};
  return `<div class="editor-field"><label>${label}</label>
    <div class="editor-bilingual">
      <textarea data-path="${path}.en" placeholder="EN">${escAttr(obj.en)}</textarea>
      <textarea data-path="${path}.vi" placeholder="VI">${escAttr(obj.vi)}</textarea>
    </div></div>`;
}
function imageField(label, imgPath, value) {
  const has = value ? "has-img" : "";
  return `<div class="editor-field">
    <label>${label}</label>
    <input type="file" accept="image/*" data-img-path="${imgPath}" />
    <img class="editor-img-preview ${has}" data-img-preview="${imgPath}" src="${escAttr(value)}" alt="" />
  </div>`;
}

function sectionWrap(key, title, bodyHtml, hasToggle) {
  const sec = state.sections[key];
  const toggle = hasToggle
    ? `<label class="editor-toggle-row" onclick="event.stopPropagation()">
         <input type="checkbox" data-toggle="${key}" ${sec.enabled ? "checked" : ""} /> on
       </label>`
    : "";
  return `<div class="editor-section" data-section-box="${key}">
    <div class="editor-section-head">${title} ${toggle}</div>
    <div class="editor-section-body">${bodyHtml}</div>
  </div>`;
}

/* ---------- per-section bodies ---------- */
function metaBody() {
  const m = state.meta;
  return (
    field("CV ID (slug, vd: embedded, mep)", "id", state.id) +
    field("Họ tên / Name", "meta.name", m.name) +
    bilingual("Vai trò / Role", "meta.role", m.role) +
    field("Accent màu (hex)", "meta.accent", m.accent, "color") +
    field("Tags (cách nhau bằng dấu phẩy)", "meta.tags", (m.tags || []).join(", ")) +
    field("Đường dẫn CV PDF (tùy chọn)", "meta.cvPdf", m.cvPdf) +
    imageField("Avatar", "meta.avatar", m.avatar)
  );
}
function contactBody() {
  const c = state.contact;
  return (
    bilingual("Giới tính / Gender", "contact.gender", c.gender) +
    field("Ngày sinh / DOB", "contact.dob", c.dob) +
    field("Điện thoại / Phone", "contact.phone", c.phone) +
    field("Email", "contact.email", c.email) +
    bilingual("Địa chỉ / Address", "contact.address", c.address) +
    field("Facebook URL", "contact.facebook", c.facebook) +
    field("LinkedIn URL", "contact.linkedin", c.linkedin) +
    field("GitHub URL", "contact.github", c.github)
  );
}
function aboutBody() {
  return bilingualArea("Nội dung mục tiêu / Objective", "sections.about.text", state.sections.about.text);
}
function expEduBody(key) {
  const sec = state.sections[key];
  const orgBilingual = key === "education";
  const items = (sec.items || [])
    .map((it, i) => {
      const base = `sections.${key}.items.${i}`;
      const org = orgBilingual
        ? bilingual("Tổ chức / Org", `${base}.org`, it.org)
        : field("Tổ chức / Org", `${base}.org`, it.org);
      const role = !orgBilingual ? bilingual("Chức danh / Role", `${base}.role`, it.role) : "";
      const points = (it.points || [])
        .map(
          (p, pi) =>
            `<div class="editor-bilingual" style="margin-bottom:.4rem">
               <input data-path="${base}.points.${pi}.en" value="${escAttr(p.en)}" placeholder="point EN" />
               <input data-path="${base}.points.${pi}.vi" value="${escAttr(p.vi)}" placeholder="point VI" />
               <button class="editor-item-remove" type="button" data-action="remove-point" data-key="${key}" data-item="${i}" data-index="${pi}" style="position:static">x</button>
             </div>`
        )
        .join("");
      return `<div class="editor-item">
        <button class="editor-item-remove" type="button" data-action="remove-item" data-key="${key}" data-index="${i}">Xóa</button>
        ${org}
        ${role}
        ${bilingual("Thời gian / Date", `${base}.date`, typeof it.date === "object" ? it.date : { en: it.date || "", vi: it.date || "" })}
        <label class="editor-toggle-row"><input type="checkbox" data-bool="${base}.current" ${it.current ? "checked" : ""} /> Đang làm/học (Present)</label>
        <label style="font-size:.8rem;color:var(--text-secondary);font-weight:600;margin-top:.5rem;display:block">Mô tả (bullet)</label>
        ${points}
        <button class="editor-add-btn" type="button" data-action="add-point" data-key="${key}" data-item="${i}">+ Thêm dòng</button>
      </div>`;
    })
    .join("");
  return items + `<button class="editor-add-btn" type="button" data-action="add-item" data-key="${key}">+ Thêm mục</button>`;
}
function skillsBody() {
  const items = (state.sections.skills.items || [])
    .map((sk, i) => {
      const base = `sections.skills.items.${i}`;
      const opts = [1, 2, 3, 4, 5]
        .map((n) => `<option value="${n}" ${sk.level === n ? "selected" : ""}>${n}/5</option>`)
        .join("");
      return `<div class="editor-item">
        <button class="editor-item-remove" type="button" data-action="remove-item" data-key="skills" data-index="${i}">Xóa</button>
        ${field("Kỹ năng / Skill", `${base}.name`, sk.name)}
        <div class="editor-field"><label>Mức độ</label><select data-path="${base}.level" data-num="1">${opts}</select></div>
      </div>`;
    })
    .join("");
  return items + `<button class="editor-add-btn" type="button" data-action="add-item" data-key="skills">+ Thêm kỹ năng</button>`;
}
function interestsBody() {
  const items = (state.sections.interests.items || [])
    .map((it, i) => {
      const base = `sections.interests.items.${i}`;
      return `<div class="editor-item">
        <button class="editor-item-remove" type="button" data-action="remove-item" data-key="interests" data-index="${i}">Xóa</button>
        ${field("Icon class (vd: ic-heart, ic-globe)", `${base}.icon`, it.icon)}
        ${bilingual("Nhãn / Label", `${base}.label`, it.label)}
      </div>`;
    })
    .join("");
  return items + `<button class="editor-add-btn" type="button" data-action="add-item" data-key="interests">+ Thêm sở thích</button>`;
}
function certsBody() {
  const sec = state.sections.certificates;
  const items = (sec.items || [])
    .map((c, i) => {
      const base = `sections.certificates.items.${i}`;
      return `<div class="editor-item">
        <button class="editor-item-remove" type="button" data-action="remove-item" data-key="certificates" data-index="${i}">Xóa</button>
        ${field("Tên / Name", `${base}.name`, c.name)}
        ${bilingual("Mô tả / Desc", `${base}.desc`, c.desc)}
        ${imageField("Ảnh chứng chỉ", `${base}.image`, c.image)}
      </div>`;
    })
    .join("");
  return (
    bilingual("Phụ đề / Subtitle", "sections.certificates.subtitle", sec.subtitle) +
    items +
    `<button class="editor-add-btn" type="button" data-action="add-item" data-key="certificates">+ Thêm chứng chỉ</button>`
  );
}
function projectsBody() {
  const sec = state.sections.projects;
  const items = (sec.items || [])
    .map((p, i) => {
      const base = `sections.projects.items.${i}`;
      return `<div class="editor-item">
        <button class="editor-item-remove" type="button" data-action="remove-item" data-key="projects" data-index="${i}">Xóa</button>
        ${field("Tên dự án / Name", `${base}.name`, p.name)}
        ${bilingual("Mô tả / Desc", `${base}.desc`, p.desc)}
        ${field("Công nghệ / Tech", `${base}.tech`, p.tech)}
        ${field("Tags (phẩy)", `${base}.tags`, (p.tags || []).join(", "))}
        ${field("Link demo (tùy chọn)", `${base}.demo`, p.demo)}
        ${imageField("Ảnh dự án", `${base}.image`, p.image)}
      </div>`;
    })
    .join("");
  return (
    bilingual("Phụ đề / Subtitle", "sections.projects.subtitle", sec.subtitle) +
    items +
    `<button class="editor-add-btn" type="button" data-action="add-item" data-key="projects">+ Thêm dự án</button>`
  );
}
function galleryBody() {
  const sec = state.sections.gallery;
  const items = (sec.items || [])
    .map((g, i) => {
      const base = `sections.gallery.items.${i}`;
      return `<div class="editor-item">
        <button class="editor-item-remove" type="button" data-action="remove-item" data-key="gallery" data-index="${i}">Xóa</button>
        ${imageField("Ảnh bản vẽ / Image", `${base}.image`, g.image)}
        ${bilingual("Chú thích / Caption", `${base}.caption`, g.caption)}
      </div>`;
    })
    .join("");
  return (
    bilingual("Phụ đề / Subtitle", "sections.gallery.subtitle", sec.subtitle) +
    items +
    `<button class="editor-add-btn" type="button" data-action="add-item" data-key="gallery">+ Thêm ảnh</button>`
  );
}

/* ---------- render whole form ---------- */
function renderForm() {
  const root = document.getElementById("form-sections");
  root.innerHTML =
    sectionWrap("__meta", "📋 Thông tin chung", metaBody(), false) +
    sectionWrap("__contact", "📞 Liên hệ", contactBody(), false) +
    sectionWrap("about", "🎯 Mục tiêu (About)", aboutBody(), true) +
    sectionWrap("experience", "💼 Kinh nghiệm (Experience)", expEduBody("experience"), true) +
    sectionWrap("education", "🎓 Học vấn (Education)", expEduBody("education"), true) +
    sectionWrap("skills", "🛠️ Kỹ năng (Skills)", skillsBody(), true) +
    sectionWrap("interests", "❤️ Sở thích (Interests)", interestsBody(), true) +
    sectionWrap("certificates", "📜 Chứng chỉ (Certificates)", certsBody(), true) +
    sectionWrap("projects", "🚀 Dự án (Projects)", projectsBody(), true) +
    sectionWrap("gallery", "🖼️ Thư viện/Bản vẽ (Gallery)", galleryBody(), true);

  // open the meta section by default
  const first = root.querySelector('[data-section-box="__meta"]');
  if (first) first.classList.add("open");
}

/* ---------- preview & persistence ---------- */
function sendPreview() {
  if (!previewReady) return;
  const frame = document.getElementById("preview-frame");
  frame.contentWindow.postMessage({ type: "cv-data", payload: JSON.parse(JSON.stringify(state)) }, "*");
}
function scheduleUpdate() {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(() => {
    sendPreview();
    saveDraft();
  }, 250);
}
function saveDraft() {
  if (!state.id) return;
  let drafts = {};
  try {
    drafts = JSON.parse(localStorage.getItem(DRAFTS_KEY) || "{}");
  } catch (e) {}
  drafts[state.id] = state;
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

/* ---------- event wiring ---------- */
function wireForm() {
  const root = document.getElementById("form-sections");

  // text/textarea/select input
  root.addEventListener("input", (e) => {
    const el = e.target;
    if (el.dataset.path) {
      let val = el.value;
      if (el.dataset.path === "meta.tags" || /\.tags$/.test(el.dataset.path)) {
        val = val.split(",").map((s) => s.trim()).filter(Boolean);
      } else if (el.dataset.num) {
        val = parseInt(val, 10);
      }
      setPath(state, el.dataset.path, val);
      scheduleUpdate();
    }
  });

  // checkboxes (section enable + booleans)
  root.addEventListener("change", (e) => {
    const el = e.target;
    if (el.dataset.toggle) {
      state.sections[el.dataset.toggle].enabled = el.checked;
      scheduleUpdate();
    } else if (el.dataset.bool) {
      setPath(state, el.dataset.bool, el.checked);
      scheduleUpdate();
    } else if (el.dataset.imgPath) {
      const file = el.files && el.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        setPath(state, el.dataset.imgPath, reader.result);
        const prev = root.querySelector(`[data-img-preview="${el.dataset.imgPath}"]`);
        if (prev) {
          prev.src = reader.result;
          prev.classList.add("has-img");
        }
        scheduleUpdate();
      };
      reader.readAsDataURL(file);
    }
  });

  // accordion + add/remove actions
  root.addEventListener("click", (e) => {
    const head = e.target.closest(".editor-section-head");
    if (head && !e.target.closest("label")) {
      head.parentElement.classList.toggle("open");
      return;
    }
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    const key = btn.dataset.key;
    if (action === "add-item") addItem(key);
    else if (action === "remove-item") removeItem(key, +btn.dataset.index);
    else if (action === "add-point") addPoint(key, +btn.dataset.item);
    else if (action === "remove-point") removePoint(key, +btn.dataset.item, +btn.dataset.index);
  });
}

function keepOpen(fn) {
  // remember which sections are open, run fn (re-render), restore
  const open = Array.from(document.querySelectorAll(".editor-section.open")).map((s) => s.dataset.sectionBox);
  fn();
  open.forEach((k) => {
    const box = document.querySelector(`[data-section-box="${k}"]`);
    if (box) box.classList.add("open");
  });
}

function addItem(key) {
  const templates = {
    experience: { org: "", role: { en: "", vi: "" }, date: { en: "", vi: "" }, current: false, points: [{ en: "", vi: "" }] },
    education: { org: { en: "", vi: "" }, date: { en: "", vi: "" }, current: false, points: [{ en: "", vi: "" }] },
    skills: { name: "", level: 3 },
    interests: { icon: "ic-heart", label: { en: "", vi: "" } },
    certificates: { name: "", desc: { en: "", vi: "" }, image: "" },
    projects: { name: "", desc: { en: "", vi: "" }, tech: "", tags: [], demo: "", image: "" },
    gallery: { image: "", caption: { en: "", vi: "" } },
  };
  state.sections[key].items.push(JSON.parse(JSON.stringify(templates[key])));
  keepOpen(renderForm);
  scheduleUpdate();
}
function removeItem(key, i) {
  state.sections[key].items.splice(i, 1);
  keepOpen(renderForm);
  scheduleUpdate();
}
function addPoint(key, i) {
  state.sections[key].items[i].points = state.sections[key].items[i].points || [];
  state.sections[key].items[i].points.push({ en: "", vi: "" });
  keepOpen(renderForm);
  scheduleUpdate();
}
function removePoint(key, i, pi) {
  state.sections[key].items[i].points.splice(pi, 1);
  keepOpen(renderForm);
  scheduleUpdate();
}

/* ---------- toolbar ---------- */
function download(filename, text) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
function exportCV() {
  if (!state.id) {
    alert("Vui lòng nhập CV ID (slug) ở mục Thông tin chung trước khi export.");
    return;
  }
  download("cv.json", JSON.stringify(state, null, 2));
  const folder = cvRepoFolder(state.id);
  alert(`Đã tải cv.json → đặt vào thư mục repo/${folder}/cv.json`);
}
async function exportManifest() {
  let manifest = { cvs: [] };
  try {
    const res = await fetch(REGISTRY_URL);
    if (res.ok) manifest = await res.json();
  } catch (e) {}
  const folders = defaultAssetFolders(state.id);
  const entry = {
    id: state.id,
    repoFolder: cvRepoFolder(state.id),
    title: state.meta.role,
    role: state.meta.role,
    accent: state.meta.accent,
    thumbnail: state.meta.avatar || `${folders.images}/default-avatar.png`,
    updated: new Date().toISOString().slice(0, 10),
  };
  const idx = (manifest.cvs || []).findIndex((c) => c.id === state.id);
  if (idx >= 0) manifest.cvs[idx] = entry;
  else manifest.cvs.push(entry);
  download("CV_master_registry.json", JSON.stringify(manifest, null, 2));
  alert("Đã tải CV_master_registry.json → đặt vào thư mục gốc repo master");
}
function wireToolbar() {
  document.getElementById("btn-new").addEventListener("click", () => {
    if (!confirm("Tạo CV mới? Nội dung chưa export sẽ vẫn lưu nháp theo ID hiện tại.")) return;
    state = blankCV("");
    keepOpen(renderForm);
    sendPreview();
  });
  document.getElementById("btn-export").addEventListener("click", exportCV);
  document.getElementById("btn-export-manifest").addEventListener("click", exportManifest);
  document.getElementById("btn-import").addEventListener("click", () => document.getElementById("import-file").click());
  document.getElementById("import-file").addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        state = JSON.parse(reader.result);
        if (!state.sections) state = blankCV(state.id || "");
        renderForm();
        sendPreview();
        saveDraft();
      } catch (err) {
        alert("File JSON không hợp lệ.");
      }
    };
    reader.readAsText(file);
  });
}

/* ---------- init ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  initChrome();

  // Forward theme changes to the preview iframe
  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const frame = document.getElementById("preview-frame");
      if (previewReady && frame) {
        frame.contentWindow.postMessage(
          { type: "cv-theme", theme: document.documentElement.getAttribute("data-theme") },
          "*"
        );
      }
    });
  }

  // receive ready signal from preview iframe
  window.addEventListener("message", (e) => {
    if (e.data && e.data.type === "cv-preview-ready") {
      previewReady = true;
      sendPreview();
    }
  });

  const id = new URLSearchParams(location.search).get("id");
  if (id) {
    // try local draft first, then data file
    let loaded = null;
    try {
      const drafts = JSON.parse(localStorage.getItem(DRAFTS_KEY) || "{}");
      if (drafts[id]) loaded = drafts[id];
    } catch (e) {}
    if (!loaded) {
      try {
        const registry = await loadRegistry();
        const entry = registryEntryFor(id, registry);
        const repoFolder = cvRepoFolder(id, entry);
        const res = await fetch(cvJsonPath(id, repoFolder));
        if (res.ok) loaded = await res.json();
      } catch (e) {}
    }
    state = loaded || blankCV(id);
  } else {
    state = blankCV("");
  }

  renderForm();
  wireForm();
  wireToolbar();
});

/* ===== CV renderer: builds a CV page from a JSON data object ===== */
let CV_DATA = null;
let IS_PREVIEW = false;
let CV_ASSET_BASE = "";
let CV_REPO_FOLDER = "";

function setAssetBase(id, repoFolder) {
  const standalone = window.__CV_STANDALONE__;
  CV_REPO_FOLDER = repoFolder || (standalone && standalone.repoFolder) || "";
  CV_ASSET_BASE = standalone ? standalone.assetBase || "" : cvFolderPath(id, CV_REPO_FOLDER);
}

function A(path) {
  if (!path) return "";
  return esc(cvAssetPath(CV_DATA && CV_DATA.id, path, CV_ASSET_BASE));
}

function esc(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function L(val) {
  return esc(localize(val));
}

function hexToRgba(hex, alpha) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
  if (!m) return `rgba(165,0,100,${alpha})`;
  return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${alpha})`;
}

function applyAccent(accent) {
  if (!accent) return;
  const root = document.documentElement.style;
  root.setProperty("--momo-pink", accent);
  root.setProperty("--momo-pink-light", accent);
  root.setProperty("--momo-pink-soft", hexToRgba(accent, 0.1));
}

/* Called by i18n.js when language changes */
function onLanguageChange() {
  if (CV_DATA) renderCV(CV_DATA);
}

function buildNav(sections) {
  const map = [
    ["about", "#info", "nav_about"],
    ["experience", "#resume", "nav_resume"],
    ["certificates", "#certs", "nav_certs"],
    ["projects", "#projects", "nav_projects"],
    ["gallery", "#gallery", "nav_gallery"],
  ];
  return map
    .filter(([key]) => sections[key] && sections[key].enabled)
    .map(([, anchor, i18n]) => `<a href="${anchor}" data-i18n="${i18n}">${t(i18n)}</a>`)
    .join("");
}

function skillLabel(item) {
  return esc(typeof item === "string" ? item : localize(item));
}

function renderSkillGroups(skills) {
  const groupsHtml = (skills.groups || [])
    .map((g) => {
      const tags = (g.items || []).map((item) => `<span class="skill-tag">${skillLabel(item)}</span>`).join("");
      return `<div class="skill-group"><h4 class="skill-group-label">${L(g.label)}</h4><div class="skill-tags">${tags}</div></div>`;
    })
    .join("");

  let softHtml = "";
  const soft = skills.soft;
  if (soft && (soft.items || []).length) {
    const softItems = soft.items
      .map(
        (s) =>
          `<div class="soft-skill-item"><strong>${L(s.title)}</strong><p>${L(s.text)}</p></div>`
      )
      .join("");
    softHtml = `<div class="soft-skills-block"><h4 class="skill-group-label">${L(soft.label || { en: "Soft Skills", vi: "Kỹ năng mềm" })}</h4><div class="soft-skills-grid">${softItems}</div></div>`;
  }

  return `<div class="skills-layout">${groupsHtml}${softHtml}</div>`;
}

function renderSkillTags(skills) {
  const tags = (skills.items || [])
    .map((sk) => `<span class="skill-tag">${esc(sk.name)}</span>`)
    .join("");
  return `<div class="skill-tags">${tags}</div>`;
}

function renderEntries(items) {
  return items
    .map((it) => {
      const org = L(it.org);
      const role = it.role ? `<p><em>${L(it.role)}</em></p>` : "";
      const tech = it.tech ? `<p class="resume-tech">${L(it.tech)}</p>` : "";
      const dateVal = localize(it.date);
      const date = it.current
        ? `<p class="resume-date">${esc(dateVal).replace(/-\s*.+$/, "- ")}<span class="badge-now">${t("badge_now")}</span></p>`
        : dateVal
        ? `<p class="resume-date">${esc(dateVal)}</p>`
        : "";
      const points = (it.points || []).map((p) => `<li>${L(p)}</li>`).join("");
      return `<div class="resume-entry"><h4>${org}</h4>${date}${role}${tech}<ul>${points}</ul></div>`;
    })
    .join("");
}

function renderInterests(items) {
  const hasDesc = items.some((it) => it.desc);
  if (!hasDesc) {
    return items
      .map(
        (it) =>
          `<div class="interest-chip"><i class="${esc(it.icon || "ic-heart")}"></i><span>${L(it.label)}</span></div>`
      )
      .join("");
  }
  return `<div class="interests-list">${items
    .map(
      (it) => `
      <div class="interest-item">
        <i class="${esc(it.icon || "ic-heart")}"></i>
        <div class="interest-item-text">
          <strong>${L(it.label)}</strong>
          ${it.desc ? `<p>${L(it.desc)}</p>` : ""}
        </div>
      </div>`
    )
    .join("")}</div>`;
}

function renderCV(data, repoFolder) {
  CV_DATA = data;
  setAssetBase(data.id, repoFolder);
  const meta = data.meta || {};
  const s = data.sections || {};
  applyAccent(meta.accent);
  document.title = localize(meta.role) + " - " + (meta.name || "CV");

  // nav
  const nav = document.getElementById("nav-links");
  if (nav) nav.innerHTML = buildNav(s);

  const tags = (meta.tags || []).map((tg) => `<span class="tag">${esc(tg)}</span>`).join("");
  const pdfBtn = meta.cvPdf
    ? `<a href="${A(meta.cvPdf)}" class="btn-primary-custom" download>${t("btn_download_cv")}</a>`
    : "";

  let html = `
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-content">
          <h1>${esc(meta.name)}</h1>
          <p class="hero-subtitle">${L(meta.role)}</p>
          <div class="hero-tags">${tags}</div>
          <div class="hero-actions">
            ${pdfBtn}
            <a href="#info" class="btn-outline-custom">${t("btn_contact")}</a>
          </div>
        </div>
        <div class="hero-avatar">
          <div class="avatar-ring">
            <img src="${A(meta.avatar || defaultAssetFolders(data.id).images + "/default-avatar.png")}" alt="${esc(meta.name)}" />
          </div>
        </div>
      </div>
    </section>`;

  // About + contact
  if (s.about && s.about.enabled) {
    const c = data.contact || {};
    const social = [
      c.facebook && `<a href="${esc(c.facebook)}" target="_blank" rel="noopener" aria-label="Facebook"><i class="icon-facebook"></i></a>`,
      c.linkedin && `<a href="${esc(c.linkedin)}" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="icon-linkedin"></i></a>`,
      c.github && `<a href="${esc(c.github)}" target="_blank" rel="noopener" aria-label="GitHub"><i class="icon-github-circled"></i></a>`,
    ]
      .filter(Boolean)
      .join("");

    html += `
    <section class="section-wrap" id="info">
      <div class="info-grid reveal">
        <div class="info-card">
          <h3>${L(s.about.title || { en: "Career Objective", vi: "Mục tiêu nghề nghiệp" })}</h3>
          <p>${L(s.about.text)}</p>
        </div>
        <div class="info-card">
          <h3>${t("personal_title")}</h3>
          <div class="email-gate">
            <label for="email">${t("email_gate_label")}</label>
            <input type="email" id="email" placeholder="your@email.com" />
            <p id="error-email"></p>
            <button type="button" class="btn-primary-custom" id="email-submit">${t("email_gate_btn")}</button>
          </div>
          <div class="personal-info-hidden">
            <ul class="personal-info-list">
              ${c.gender ? `<li><strong>${t("gender")}</strong> <span>${L(c.gender)}</span></li>` : ""}
              ${c.dob ? `<li><strong>${t("dob")}</strong> <span>${esc(c.dob)}</span></li>` : ""}
              ${c.phone ? `<li><strong>${t("phone")}</strong> <span>${esc(c.phone)}</span></li>` : ""}
              ${c.email ? `<li><strong>${t("email")}</strong> <a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>` : ""}
              ${c.address ? `<li><strong>${t("address")}</strong> <span>${L(c.address)}</span></li>` : ""}
            </ul>
            <div class="social-row">${social}</div>
          </div>
        </div>
      </div>
    </section>`;
  }

  // Resume: top row (experience, education, interests) + skills row below
  const topCards = [];
  let skillsCard = "";

  if (s.experience && s.experience.enabled && (s.experience.items || []).length) {
    topCards.push(`
      <div class="resume-card reveal">
        <div class="resume-card-header"><h3>${L(s.experience.title)}</h3><i class="ic-toolbox"></i></div>
        <div class="resume-card-body">${renderEntries(s.experience.items)}</div>
        <button class="resume-toggle" type="button">${t("view_more")}</button>
      </div>`);
  }
  if (s.education && s.education.enabled && (s.education.items || []).length) {
    topCards.push(`
      <div class="resume-card reveal">
        <div class="resume-card-header"><h3>${L(s.education.title)}</h3><i class="ic-pencil"></i></div>
        <div class="resume-card-body">${renderEntries(s.education.items)}</div>
        <button class="resume-toggle" type="button">${t("view_more")}</button>
      </div>`);
  }
  if (s.interests && s.interests.enabled && (s.interests.items || []).length) {
    const interestBody = renderInterests(s.interests.items);
    const interestWrap = s.interests.items.some((it) => it.desc)
      ? interestBody
      : `<div class="interests-grid">${interestBody}</div>`;
    topCards.push(`
      <div class="resume-card interests-card reveal">
        <div class="resume-card-header"><h3>${L(s.interests.title)}</h3><i class="ic-heart"></i></div>
        <div class="resume-card-body">${interestWrap}</div>
        <button class="resume-toggle" type="button">${t("view_more")}</button>
      </div>`);
  }
  if (s.skills && s.skills.enabled) {
    const hasGroups = (s.skills.groups || []).length > 0;
    const hasItems = (s.skills.items || []).length > 0;
    if (hasGroups || hasItems) {
      const skillBody = hasGroups ? renderSkillGroups(s.skills) : renderSkillTags(s.skills);
      skillsCard = `
      <div class="resume-card skills-card reveal">
        <div class="resume-card-header"><h3>${L(s.skills.title)}</h3><i class="ic-tools-2"></i></div>
        <div class="resume-card-body">${skillBody}</div>
        <button class="resume-toggle" type="button">${t("view_more")}</button>
      </div>`;
    }
  }

  if (topCards.length || skillsCard) {
    const resTitle = (s.experience && s.experience.sectionTitle) || { en: "Experience & Skills", vi: "Kinh nghiệm & Kỹ năng" };
    html += `
    <section class="section-wrap" id="resume">
      <h2 class="section-title reveal">${L(resTitle)}</h2>
      ${topCards.length ? `<div class="resume-grid resume-grid-top">${topCards.join("")}</div>` : ""}
      ${skillsCard ? `<div class="resume-skills-row">${skillsCard}</div>` : ""}
    </section>`;
  }

  // Certificates
  if (s.certificates && s.certificates.enabled && (s.certificates.items || []).length) {
    const items = s.certificates.items
      .map(
        (cert) => `
        <div class="cert-card">
          ${cert.image ? `<img src="${A(cert.image)}" alt="${esc(cert.name)}" />` : ""}
          <div class="cert-card-body"><h4>${esc(cert.name)}</h4><p>${L(cert.desc)}</p></div>
        </div>`
      )
      .join("");
    html += `
    <section class="section-wrap" id="certs">
      <h2 class="section-title reveal">${L(s.certificates.title)}</h2>
      <p class="section-subtitle reveal">${L(s.certificates.subtitle)}</p>
      <div class="cert-grid reveal">${items}</div>
    </section>`;
  }

  // Projects
  if (s.projects && s.projects.enabled && (s.projects.items || []).length) {
    const items = s.projects.items
      .map((p) => {
        const metaTags = (p.tags || []).map((tg) => `<span>${esc(tg)}</span>`).join("");
        const demo = p.demo ? `<a href="${A(p.demo)}" class="btn-demo" target="_blank" rel="noopener">${t("btn_view_demo") || "View Demo"}</a>` : "";
        const repo = p.repo ? `<a href="${esc(p.repo)}" class="btn-demo btn-source" target="_blank" rel="noopener">${t("btn_view_source") || "Source Code"}</a>` : "";
        const actions = demo || repo ? `<div class="project-actions">${demo}${repo}</div>` : "";
        return `
        <div class="project-card reveal">
          ${p.image ? `<div class="project-card-img"><img src="${A(p.image)}" alt="${esc(p.name)}" /></div>` : ""}
          <div class="project-card-body">
            <h4>${esc(p.name)}</h4>
            <div class="project-meta">${metaTags}</div>
            <p>${L(p.desc)}</p>
            ${p.tech ? `<p class="project-tech">${esc(p.tech)}</p>` : ""}
            ${actions}
          </div>
        </div>`;
      })
      .join("");
    html += `
    <section class="section-wrap" id="projects">
      <h2 class="section-title reveal">${L(s.projects.title)}</h2>
      <p class="section-subtitle reveal">${L(s.projects.subtitle)}</p>
      <div class="project-grid">${items}</div>
    </section>`;
  }

  // Gallery (e.g. MEP drawings)
  if (s.gallery && s.gallery.enabled && (s.gallery.items || []).length) {
    const items = s.gallery.items
      .map(
        (g) => `
        <figure class="gallery-item reveal">
          <img src="${A(g.image)}" alt="${L(g.caption)}" loading="lazy" />
          ${g.caption ? `<figcaption>${L(g.caption)}</figcaption>` : ""}
        </figure>`
      )
      .join("");
    html += `
    <section class="section-wrap" id="gallery">
      <h2 class="section-title reveal">${L(s.gallery.title)}</h2>
      <p class="section-subtitle reveal">${L(s.gallery.subtitle)}</p>
      <div class="gallery-grid">${items}</div>
    </section>`;
  }

  // Footer
  const c = data.contact || {};
  const footerLinks = [
    c.facebook && `<a href="${esc(c.facebook)}" target="_blank" rel="noopener"><i class="icon-facebook"></i> <span>Facebook</span></a>`,
    c.linkedin && `<a href="${esc(c.linkedin)}" target="_blank" rel="noopener"><i class="icon-linkedin"></i> <span>LinkedIn</span></a>`,
    c.github && `<a href="${esc(c.github)}" target="_blank" rel="noopener"><i class="icon-github-circled"></i> <span>GitHub</span></a>`,
  ]
    .filter(Boolean)
    .join("");
  html += `
    <footer class="site-footer">
      <div class="footer-links">${footerLinks}</div>
      <p class="footer-copy">${t("footer_copy")}</p>
    </footer>`;

  document.getElementById("cv-root").innerHTML = html;

  // Update language-button active state + static header data-i18n (without
  // re-triggering onLanguageChange, since the rendered content already used t()/L()).
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const str = t(el.getAttribute("data-i18n"));
    if (str) el.textContent = str;
  });
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === currentLang);
  });

  wireBehaviors();
  applyStandaloneChrome();
}

async function hashHubPin(pin) {
  const data = new TextEncoder().encode(String(pin) + ":cv-hub-gate");
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function wireHubSecretAccess(brand, cfg) {
  if (!cfg || !cfg.hubUrl || !cfg.pinHash) return;
  let clicks = 0;
  let timer = null;
  brand.addEventListener("click", async (e) => {
    e.preventDefault();
    clicks += 1;
    clearTimeout(timer);
    timer = setTimeout(() => {
      clicks = 0;
    }, 2000);
    if (clicks < 5) return;
    clicks = 0;
    clearTimeout(timer);
    const pin = prompt("PIN:");
    if (!pin) return;
    const hash = await hashHubPin(pin);
    if (hash === cfg.pinHash) {
      location.href = cfg.hubUrl;
      return;
    }
    alert("Invalid PIN.");
  });
}

function applyStandaloneChrome() {
  const cfg = window.__CV_STANDALONE__;
  if (!cfg) return;
  document.querySelectorAll(".demo-back-link").forEach((el) => el.remove());
  const brand = document.querySelector(".brand");
  if (brand) {
    brand.removeAttribute("href");
    brand.style.cursor = "default";
    brand.setAttribute("title", brand.getAttribute("title") || "");
    wireHubSecretAccess(brand, cfg);
  }
}

/* ===== Interactive behaviors (reveal, toggles, email gate) ===== */
function wireBehaviors() {
  const submit = document.getElementById("email-submit");
  if (submit) submit.addEventListener("click", handleEmailGate);

  document.querySelectorAll(".resume-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".resume-card");
      const expanded = card.classList.toggle("expanded");
      btn.textContent = expanded ? t("view_less") : t("view_more");
    });
  });

  wireNavScrollSpy();

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveals = document.querySelectorAll(".reveal");
  if (prefersReduced) {
    reveals.forEach((el) => el.classList.add("visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => observer.observe(el));
  }
}

function getNavOffset() {
  const h = getComputedStyle(document.documentElement).getPropertyValue("--nav-height").trim();
  return (parseInt(h, 10) || 64) + 16;
}

function updateNavActiveState() {
  const nav = document.getElementById("nav-links");
  if (!nav) return;
  const links = [...nav.querySelectorAll("a[href^='#']")];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if (!sections.length) return;

  const scrollPos = window.scrollY + getNavOffset();
  let activeId = sections[0].id;

  for (const sec of sections) {
    if (sec.offsetTop <= scrollPos) activeId = sec.id;
  }

  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
    activeId = sections[sections.length - 1].id;
  }

  links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${activeId}`));
}

function wireNavScrollSpy() {
  const nav = document.getElementById("nav-links");
  if (!nav) return;

  nav.querySelectorAll("a[href^='#']").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      const top = target.getBoundingClientRect().top + window.scrollY - getNavOffset();
      window.scrollTo({ top, behavior: "smooth" });
      nav.querySelectorAll("a").forEach((l) => l.classList.remove("active"));
      a.classList.add("active");
    });
  });

  updateNavActiveState();
}

if (!window.__cvNavSpyBound) {
  window.__cvNavSpyBound = true;
  let navTicking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (navTicking) return;
      navTicking = true;
      requestAnimationFrame(() => {
        updateNavActiveState();
        navTicking = false;
      });
    },
    { passive: true }
  );
}

function handleEmailGate() {
  const input = document.getElementById("email");
  const errorEmail = document.getElementById("error-email");
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const personalInfo = document.querySelector(".personal-info-hidden");
  const gate = document.querySelector(".email-gate");
  if (regex.test(input.value.toLowerCase().trim())) {
    personalInfo.classList.add("visible");
    gate.style.display = "none";
    errorEmail.textContent = "";
  } else {
    errorEmail.textContent = t("email_error");
  }
}

function showError(msg) {
  const backLink = window.__CV_STANDALONE__
    ? ""
    : `<a href="index.html" class="btn-primary-custom" style="margin-top:1rem;">← All CVs</a>`;
  document.getElementById("cv-root").innerHTML = `
    <section class="section-wrap" style="text-align:center;padding-top:6rem;">
      <h2 class="section-title">CV not found</h2>
      <p class="section-subtitle">${esc(msg || "Could not load this CV.")}</p>
      ${backLink}
    </section>`;
}

/* ===== Init ===== */
document.addEventListener("DOMContentLoaded", async () => {
  initChrome();

  const params = new URLSearchParams(location.search);
  IS_PREVIEW = params.get("preview") === "1";

  if (IS_PREVIEW) {
    window.addEventListener("message", (e) => {
      if (e.data && e.data.type === "cv-data") {
        renderCV(e.data.payload);
      } else if (e.data && e.data.type === "cv-lang") {
        applyLanguage(e.data.lang);
      } else if (e.data && e.data.type === "cv-theme") {
        applyTheme(e.data.theme);
      }
    });
    if (window.parent) window.parent.postMessage({ type: "cv-preview-ready" }, "*");
    return;
  }

  const standalone = window.__CV_STANDALONE__;
  const id = standalone ? standalone.id : params.get("id");
  if (!id) {
    showError("No CV id specified.");
    return;
  }
  let repoFolder = standalone && standalone.repoFolder;
  if (!repoFolder && !standalone) {
    const registry = await loadRegistry();
    const entry = registryEntryFor(id, registry);
    repoFolder = cvRepoFolder(id, entry);
  }
  try {
    const url = standalone ? standalone.dataUrl || "cv.json" : cvJsonPath(id, repoFolder);
    const res = await fetch(url);
    if (!res.ok) throw new Error("not found");
    const data = await res.json();
    renderCV(data, repoFolder);
  } catch (err) {
    if (standalone) {
      showError("Could not load cv.json.");
      return;
    }
    try {
      const drafts = JSON.parse(localStorage.getItem("cv-drafts") || "{}");
      if (drafts[id]) {
        renderCV(drafts[id], repoFolder);
        return;
      }
    } catch (e) {
      /* ignore */
    }
    showError("File " + cvJsonPath(id, repoFolder) + " not found.");
  }
});

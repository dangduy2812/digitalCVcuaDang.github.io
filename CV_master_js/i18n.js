/* ===== Shared chrome (UI) translations + theme + language ===== */
const UI_STRINGS = {
  en: {
    nav_about: "About",
    nav_resume: "Experience",
    nav_certs: "Certificates",
    nav_projects: "Projects",
    nav_gallery: "Gallery",
    btn_download_cv: "Download CV (PDF)",
    btn_contact: "Contact",
    personal_title: "Personal Information",
    gender: "Gender",
    dob: "Date of Birth",
    phone: "Phone",
    email: "Email",
    address: "Address",
    email_gate_label: "Enter email to view full contact details",
    email_gate_btn: "Submit",
    email_error: "Please enter a valid email address.",
    view_more: "View More ▼",
    view_less: "View Less ▲",
    btn_view_demo: "View Demo",
    btn_view_source: "Source Code",
    footer_copy: "© 2026 Nguyen Phan Duy Dang. All rights reserved.",
    badge_now: "Present",
    hub_title: "My CV Portfolio",
    hub_subtitle: "Select a CV to view, or open the editor to create a new one.",
    hub_open: "Open CV",
    hub_edit: "Edit",
    hub_new: "New CV",
    hub_manage: "Manage CVs",
    back_hub: "All CVs",
  },
  vi: {
    nav_about: "Giới thiệu",
    nav_resume: "Kinh nghiệm",
    nav_certs: "Chứng chỉ",
    nav_projects: "Dự án",
    nav_gallery: "Thư viện",
    btn_download_cv: "Tải CV (PDF)",
    btn_contact: "Liên hệ",
    personal_title: "Thông tin cá nhân",
    gender: "Giới tính",
    dob: "Ngày sinh",
    phone: "Điện thoại",
    email: "Email",
    address: "Địa chỉ",
    email_gate_label: "Nhập email để xem thông tin liên hệ đầy đủ",
    email_gate_btn: "Xác nhận",
    email_error: "Vui lòng nhập đúng định dạng email.",
    view_more: "Xem thêm ▼",
    view_less: "Thu gọn ▲",
    btn_view_demo: "Xem Demo",
    btn_view_source: "Mã nguồn",
    footer_copy: "© 2026 Nguyễn Phan Duy Đăng. All rights reserved.",
    badge_now: "Hiện tại",
    hub_title: "Bộ sưu tập CV",
    hub_subtitle: "Chọn một CV để xem, hoặc mở trình chỉnh sửa để tạo CV mới.",
    hub_open: "Xem CV",
    hub_edit: "Chỉnh sửa",
    hub_new: "Tạo CV mới",
    hub_manage: "Quản lý CV",
    back_hub: "Tất cả CV",
  },
};

let currentLang = localStorage.getItem("cv-lang") || "en";
let currentTheme = localStorage.getItem("cv-theme") || "light";

function t(key) {
  return (UI_STRINGS[currentLang] && UI_STRINGS[currentLang][key]) || key;
}

/* Pick localized value from a string or { en, vi } object */
function localize(val, lang) {
  lang = lang || currentLang;
  if (val == null) return "";
  if (typeof val === "string") return val;
  return val[lang] || val.en || val.vi || "";
}

/* ===== Theme ===== */
function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("cv-theme", theme);
  document.querySelectorAll("#theme-icon, .theme-icon").forEach((icon) => {
    icon.className = (theme === "dark" ? "icon-sun" : "icon-moon") + " theme-icon";
  });
}

function toggleTheme() {
  applyTheme(currentTheme === "dark" ? "light" : "dark");
}

/* ===== Language ===== */
function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("cv-lang", lang);
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const str = t(key);
    if (str) el.textContent = str;
  });

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  if (typeof onLanguageChange === "function") onLanguageChange(lang);
}

/* ===== Wire up shared controls (theme button + lang buttons) ===== */
function initChrome() {
  applyTheme(currentTheme);
  applyLanguage(currentLang);

  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
  });
}

const DEMO_KEY = "vehicle-profiles";
const TELEMETRY_KEY = "vehicle-telemetry-count";

const SEED_VEHICLES = [
  { id: "12345678", ownerName: "Nguyen Phan Duy Dang", email: "dangnguyenphanduy@gmail.com", model: "VF8" },
  { id: "87654321", ownerName: "Tran Van B", email: "tranb@email.com", model: "VF9" },
  { id: "11223344", ownerName: "Le Thi C", email: "lec@email.com", model: "VF5" },
  { id: "55667788", ownerName: "Pham Van D", email: "phamd@email.com", model: "VF6" },
];

const demoI18n = {
  vi: {
    demo_vehicle_title: "Vehicle Profile REST API",
    demo_vehicle_sub: "Spring Boot · JPA · MySQL",
    demo_vehicle_hero: "Bảng điều khiển quản lý xe",
    demo_vehicle_hero_desc: "Demo tương tác mô phỏng REST API CRUD",
    demo_live: "Demo trực tiếp",
    demo_stat_vehicles: "Tổng số xe",
    demo_stat_owners: "Chủ xe",
    demo_stat_telemetry: "Bản ghi telemetry",
    demo_vehicle_form: "Thêm / Sửa hồ sơ xe",
    demo_vehicle_id: "Mã xe (8 số)",
    demo_owner_name: "Tên chủ xe",
    demo_owner_email: "Email",
    demo_vehicle_model: "Model",
    demo_btn_save: "Lưu (POST/PUT)",
    demo_btn_cancel: "Hủy",
    demo_vehicle_list: "Danh sách hồ sơ",
    demo_actions: "Thao tác",
    demo_json_response: "Phản hồi API",
    demo_err_id: "Mã xe phải đúng 8 chữ số",
    demo_err_name: "Tên không được để trống",
    demo_err_email: "Email không hợp lệ",
    demo_btn_edit: "Sửa",
    demo_btn_delete: "Xóa",
    demo_post: "POST /api/vehicles - Created",
    demo_put: "PUT /api/vehicles/",
    demo_delete: "DELETE /api/vehicles/",
    demo_get: "GET /api/vehicles",
  },
  en: {
    demo_vehicle_title: "Vehicle Profile REST API",
    demo_vehicle_sub: "Spring Boot · JPA · MySQL",
    demo_vehicle_hero: "Vehicle Management Dashboard",
    demo_vehicle_hero_desc: "Interactive demo simulating REST API CRUD operations",
    demo_live: "Live Demo",
    demo_stat_vehicles: "Total Vehicles",
    demo_stat_owners: "Owners",
    demo_stat_telemetry: "Telemetry Records",
    demo_vehicle_form: "Add / Edit Vehicle Profile",
    demo_vehicle_id: "Vehicle ID (8 digits)",
    demo_owner_name: "Owner Name",
    demo_owner_email: "Email",
    demo_vehicle_model: "Model",
    demo_btn_save: "Save (POST/PUT)",
    demo_btn_cancel: "Cancel",
    demo_vehicle_list: "Profile List",
    demo_actions: "Actions",
    demo_json_response: "API Response",
    demo_err_id: "ID must be exactly 8 digits",
    demo_err_name: "Name cannot be empty",
    demo_err_email: "Invalid email",
    demo_btn_edit: "Edit",
    demo_btn_delete: "Delete",
    demo_post: "POST /api/vehicles - Created",
    demo_put: "PUT /api/vehicles/",
    demo_delete: "DELETE /api/vehicles/",
    demo_get: "GET /api/vehicles",
  },
};

function t(key) {
  const lang = localStorage.getItem("cv-lang") || "en";
  return demoI18n[lang][key] || key;
}

function getVehicles() {
  return JSON.parse(localStorage.getItem(DEMO_KEY) || "[]");
}

function saveVehicles(data) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(data));
}

function getTelemetryCount() {
  return parseInt(localStorage.getItem(TELEMETRY_KEY) || "127", 10);
}

function bumpTelemetryCount() {
  const n = getTelemetryCount() + Math.floor(Math.random() * 3) + 1;
  localStorage.setItem(TELEMETRY_KEY, String(n));
  return n;
}

function showJson(obj) {
  document.getElementById("json-output").textContent = JSON.stringify(obj, null, 2);
}

function updateStats() {
  const vehicles = getVehicles();
  const owners = new Set(vehicles.map((v) => v.ownerEmail)).size;
  document.getElementById("stat-total").textContent = vehicles.length;
  document.getElementById("stat-owners").textContent = owners;
  document.getElementById("stat-telemetry").textContent = getTelemetryCount();
}

function renderTable() {
  const vehicles = getVehicles();
  const tbody = document.getElementById("vehicle-table-body");
  if (!vehicles.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No vehicles yet</td></tr>`;
  } else {
    tbody.innerHTML = vehicles
      .map(
        (v) => `
    <tr>
      <td><strong>${v.id}</strong></td>
      <td>${v.ownerName}</td>
      <td>${v.email}</td>
      <td><span class="model-pill">${v.model}</span></td>
      <td>
        <button class="btn-sm-action btn-edit" onclick="editVehicle('${v.id}')">${t("demo_btn_edit")}</button>
        <button class="btn-sm-action btn-delete" onclick="deleteVehicle('${v.id}')">${t("demo_btn_delete")}</button>
      </td>
    </tr>`
      )
      .join("");
  }
  updateStats();
  showJson({ status: 200, message: t("demo_get"), count: vehicles.length, data: vehicles });
}

function validateForm() {
  let valid = true;
  const id = document.getElementById("vehicle-id").value.trim();
  const name = document.getElementById("owner-name").value.trim();
  const email = document.getElementById("owner-email").value.trim();
  const editId = document.getElementById("edit-id").value;

  document.getElementById("err-id").textContent = "";
  document.getElementById("err-name").textContent = "";
  document.getElementById("err-email").textContent = "";

  if (!/^\d{8}$/.test(id)) {
    document.getElementById("err-id").textContent = t("demo_err_id");
    valid = false;
  }
  if (!name) {
    document.getElementById("err-name").textContent = t("demo_err_name");
    valid = false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById("err-email").textContent = t("demo_err_email");
    valid = false;
  }

  const vehicles = getVehicles();
  if (!editId && vehicles.some((v) => v.id === id)) {
    document.getElementById("err-id").textContent = "ID already exists";
    valid = false;
  }

  return valid;
}

function resetForm() {
  document.getElementById("vehicle-form").reset();
  document.getElementById("edit-id").value = "";
  document.getElementById("btn-cancel").style.display = "none";
  document.getElementById("vehicle-id").disabled = false;
}

function editVehicle(id) {
  const v = getVehicles().find((x) => x.id === id);
  if (!v) return;
  document.getElementById("edit-id").value = v.id;
  document.getElementById("vehicle-id").value = v.id;
  document.getElementById("vehicle-id").disabled = true;
  document.getElementById("owner-name").value = v.ownerName;
  document.getElementById("owner-email").value = v.email;
  document.getElementById("vehicle-model").value = v.model;
  document.getElementById("btn-cancel").style.display = "inline-flex";
}

function deleteVehicle(id) {
  const vehicles = getVehicles().filter((v) => v.id !== id);
  saveVehicles(vehicles);
  showJson({ status: 200, message: t("demo_delete") + id, data: null });
  renderTable();
}

document.getElementById("vehicle-form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const editId = document.getElementById("edit-id").value;
  const vehicle = {
    id: document.getElementById("vehicle-id").value.trim(),
    ownerName: document.getElementById("owner-name").value.trim(),
    email: document.getElementById("owner-email").value.trim(),
    model: document.getElementById("vehicle-model").value,
  };

  let vehicles = getVehicles();
  if (editId) {
    vehicles = vehicles.map((v) => (v.id === editId ? vehicle : v));
    showJson({ status: 200, message: t("demo_put") + editId, data: vehicle });
  } else {
    vehicles.push(vehicle);
    bumpTelemetryCount();
    showJson({ status: 201, message: t("demo_post"), data: vehicle });
  }
  saveVehicles(vehicles);
  resetForm();
  renderTable();
});

document.getElementById("btn-cancel").addEventListener("click", resetForm);

function applyDemoI18n() {
  const lang = localStorage.getItem("cv-lang") || "en";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (demoI18n[lang] && demoI18n[lang][key]) {
      el.textContent = demoI18n[lang][key];
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initDemoPage();
  applyDemoI18n();
  if (getVehicles().length === 0) {
    saveVehicles(SEED_VEHICLES);
  }
  if (!localStorage.getItem(TELEMETRY_KEY)) {
    localStorage.setItem(TELEMETRY_KEY, "127");
  }
  renderTable();

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      setTimeout(() => {
        applyDemoI18n();
        renderTable();
      }, 50);
    });
  });
});

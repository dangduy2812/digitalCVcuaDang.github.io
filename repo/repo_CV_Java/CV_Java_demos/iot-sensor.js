const demoI18n = {
  vi: {
    demo_iot_title: "IoT Smart Sensor System",
    demo_iot_sub: "ESP32 · REST Ingestion · Spring Boot",
    demo_iot_hero: "Giám sát môi trường",
    demo_iot_hero_desc: "Mô phỏng thu thập dữ liệu cảm biến ESP32",
    demo_live: "Demo trực tiếp",
    demo_iot_status: "ESP32 đang gửi dữ liệu qua MQTT (mô phỏng)",
    demo_temperature: "Nhiệt độ",
    demo_humidity: "Độ ẩm",
    demo_air_quality: "Chất lượng không khí",
    demo_sensor_log: "Nhật ký cảm biến",
    demo_time: "Thời gian",
    demo_status: "Trạng thái",
    demo_json_response: "MQTT Payload",
    demo_ok: "Bình thường",
    demo_warn: "Cảnh báo",
  },
  en: {
    demo_iot_title: "IoT Smart Sensor System",
    demo_iot_sub: "ESP32 · REST Ingestion · Spring Boot",
    demo_iot_hero: "Environmental Monitoring",
    demo_iot_hero_desc: "Simulated ESP32 sensor data ingestion",
    demo_live: "Live Demo",
    demo_iot_status: "ESP32 sending data via MQTT (simulated)",
    demo_temperature: "Temperature",
    demo_humidity: "Humidity",
    demo_air_quality: "Air Quality",
    demo_sensor_log: "Sensor Log",
    demo_time: "Time",
    demo_status: "Status",
    demo_json_response: "MQTT Payload",
    demo_ok: "Normal",
    demo_warn: "Warning",
  },
};

const SEED_LOG = [
  { temp: 28.2, humidity: 62, aqi: 45, minsAgo: 8 },
  { temp: 27.8, humidity: 64, aqi: 52, minsAgo: 6 },
  { temp: 29.1, humidity: 58, aqi: 48, minsAgo: 4 },
  { temp: 30.5, humidity: 55, aqi: 72, minsAgo: 2 },
];

const ARC_LENGTH = 251;
let intervalId;

function t(key) {
  const lang = localStorage.getItem("cv-lang") || "en";
  return demoI18n[lang][key] || key;
}

function applyDemoI18n() {
  const lang = localStorage.getItem("cv-lang") || "en";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (demoI18n[lang] && demoI18n[lang][key]) el.textContent = demoI18n[lang][key];
  });
}

function setGauge(arcId, valueEl, value, min, max, suffix) {
  const pct = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const arc = document.getElementById(arcId);
  arc.style.strokeDashoffset = ARC_LENGTH - pct * ARC_LENGTH;
  document.getElementById(valueEl).textContent = value + suffix;
}

function randomBetween(min, max, dec = 0) {
  const v = min + Math.random() * (max - min);
  return dec ? parseFloat(v.toFixed(dec)) : Math.round(v);
}

function addLogRow(temp, humidity, aqi, timeStr) {
  const status = aqi > 100 ? t("demo_warn") : t("demo_ok");
  const statusColor = aqi > 100 ? "#e74c3c" : "#27ae60";
  const tbody = document.getElementById("sensor-log");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${timeStr}</td>
    <td>${temp}°C</td>
    <td>${humidity}%</td>
    <td>${aqi}</td>
    <td style="color:${statusColor};font-weight:600">${status}</td>`;
  tbody.prepend(row);
  while (tbody.children.length > 12) tbody.removeChild(tbody.lastChild);
}

function seedLog() {
  const tbody = document.getElementById("sensor-log");
  tbody.innerHTML = "";
  SEED_LOG.forEach((entry) => {
    const d = new Date(Date.now() - entry.minsAgo * 60000);
    addLogRow(entry.temp, entry.humidity, entry.aqi, d.toLocaleTimeString());
  });
}

function generateReading() {
  const temp = randomBetween(24, 36, 1);
  const humidity = randomBetween(42, 78);
  const aqi = randomBetween(25, 160);
  const now = new Date();
  const timeStr = now.toLocaleTimeString();

  setGauge("temp-arc", "temp-value", temp, 0, 50, "°C");
  setGauge("humidity-arc", "humidity-value", humidity, 0, 100, "%");
  setGauge("aqi-arc", "aqi-value", aqi, 0, 200, " AQI");

  addLogRow(temp, humidity, aqi, timeStr);

  const status = aqi > 100 ? t("demo_warn") : t("demo_ok");
  const payload = {
    topic: "sensors/environment",
    deviceId: "ESP32-A1B2C3",
    timestamp: now.toISOString(),
    data: { temperature: temp, humidity, airQualityIndex: aqi },
    status,
    endpoint: "POST /api/sensors/readings",
    stored: true,
  };
  document.getElementById("json-output").textContent = JSON.stringify(payload, null, 2);
}

document.addEventListener("DOMContentLoaded", () => {
  initDemoPage();
  applyDemoI18n();
  seedLog();
  generateReading();
  intervalId = setInterval(generateReading, 2000);

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => setTimeout(applyDemoI18n, 50));
  });
});

window.addEventListener("beforeunload", () => clearInterval(intervalId));

const demoI18n = {
  vi: {
    demo_telemetry_title: "Vehicle Telemetry Dashboard",
    demo_telemetry_status: "Đang nhận dữ liệu real-time (mô phỏng Kafka stream)",
    demo_speed: "Tốc độ",
    demo_temp: "Nhiệt độ động cơ",
    demo_fuel: "Mức nhiên liệu",
    demo_rpm: "Vòng quay",
    demo_chart_title: "Biểu đồ tốc độ (60 giây gần nhất)",
    demo_json_response: "Latest Kafka Message",
  },
  en: {
    demo_telemetry_title: "Vehicle Telemetry Dashboard",
    demo_telemetry_status: "Receiving real-time data (simulated Kafka stream)",
    demo_speed: "Speed",
    demo_temp: "Engine Temperature",
    demo_fuel: "Fuel Level",
    demo_rpm: "RPM",
    demo_chart_title: "Speed Chart (last 60 seconds)",
    demo_json_response: "Latest Kafka Message",
  },
};

const speedHistory = [];
const MAX_POINTS = 60;
let chartCtx;
let intervalId;

function applyDemoI18n() {
  const lang = localStorage.getItem("cv-lang") || "en";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (demoI18n[lang] && demoI18n[lang][key]) el.textContent = demoI18n[lang][key];
  });
}

function randomBetween(min, max) {
  return Math.round(min + Math.random() * (max - min));
}

function generateTelemetry() {
  const speed = randomBetween(30, 120);
  const temp = randomBetween(75, 105);
  const fuel = randomBetween(15, 95);
  const rpm = randomBetween(1500, 4500);

  document.getElementById("speed-value").textContent = speed;
  document.getElementById("temp-value").textContent = temp;
  document.getElementById("fuel-value").textContent = fuel;
  document.getElementById("rpm-value").textContent = rpm;

  speedHistory.push(speed);
  if (speedHistory.length > MAX_POINTS) speedHistory.shift();

  const msg = {
    topic: "vehicle.telemetry",
    timestamp: new Date().toISOString(),
    vehicleId: "VF8-12345678",
    payload: { speed, engineTemp: temp, fuelLevel: fuel, rpm },
    cached: true,
    source: "Redis cache hit",
  };
  document.getElementById("json-output").textContent = JSON.stringify(msg, null, 2);
  drawChart();
}

function drawChart() {
  if (!chartCtx) return;
  const canvas = document.getElementById("speed-chart");
  const w = canvas.width = canvas.offsetWidth * 2;
  const h = canvas.height = canvas.offsetHeight * 2;
  chartCtx.clearRect(0, 0, w, h);

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const gridColor = isDark ? "#2e2e4a" : "#e8e8f0";
  const lineColor = "#a50064";
  const textColor = isDark ? "#b0b0c8" : "#5c5c7a";

  chartCtx.strokeStyle = gridColor;
  chartCtx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = (h / 4) * i;
    chartCtx.beginPath();
    chartCtx.moveTo(0, y);
    chartCtx.lineTo(w, y);
    chartCtx.stroke();
  }

  if (speedHistory.length < 2) return;

  const maxSpeed = 140;
  const padding = 20;
  const stepX = (w - padding * 2) / (MAX_POINTS - 1);

  chartCtx.strokeStyle = lineColor;
  chartCtx.lineWidth = 3;
  chartCtx.beginPath();
  speedHistory.forEach((val, i) => {
    const x = padding + i * stepX;
    const y = h - padding - (val / maxSpeed) * (h - padding * 2);
    if (i === 0) chartCtx.moveTo(x, y);
    else chartCtx.lineTo(x, y);
  });
  chartCtx.stroke();

  chartCtx.fillStyle = lineColor + "33";
  chartCtx.lineTo(padding + (speedHistory.length - 1) * stepX, h - padding);
  chartCtx.lineTo(padding, h - padding);
  chartCtx.closePath();
  chartCtx.fill();

  chartCtx.fillStyle = textColor;
  chartCtx.font = "24px sans-serif";
  chartCtx.fillText("0", 4, h - padding + 4);
  chartCtx.fillText(maxSpeed + " km/h", 4, padding + 8);
}

document.addEventListener("DOMContentLoaded", () => {
  initDemoPage();
  applyDemoI18n();
  chartCtx = document.getElementById("speed-chart").getContext("2d");

  generateTelemetry();
  intervalId = setInterval(generateTelemetry, 1500);

  window.addEventListener("resize", drawChart);

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => setTimeout(applyDemoI18n, 50));
  });

  document.getElementById("theme-toggle").addEventListener("click", () => {
    setTimeout(drawChart, 100);
  });
});

window.addEventListener("beforeunload", () => clearInterval(intervalId));

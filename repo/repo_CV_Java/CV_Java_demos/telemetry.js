const demoI18n = {
  vi: {
    demo_telemetry_title: "Smart Telemetry Pipeline",
    demo_telemetry_sub: "Kafka · Redis · Spring Boot",
    demo_telemetry_hero: "Giám sát telemetry thời gian thực",
    demo_telemetry_hero_desc: "Mô phỏng luồng Kafka với cache Redis",
    demo_streaming: "Đang stream",
    demo_telemetry_status: "Đang nhận dữ liệu real-time (mô phỏng Kafka stream)",
    demo_speed: "Tốc độ",
    demo_temp: "Nhiệt độ động cơ",
    demo_fuel: "Mức nhiên liệu",
    demo_rpm: "Vòng quay",
    demo_chart_title: "Biểu đồ tốc độ (60 giây gần nhất)",
    demo_json_response: "Tin nhắn Kafka mới nhất",
  },
  en: {
    demo_telemetry_title: "Smart Telemetry Pipeline",
    demo_telemetry_sub: "Kafka · Redis · Spring Boot",
    demo_telemetry_hero: "Real-time Telemetry Monitor",
    demo_telemetry_hero_desc: "Simulated Kafka stream with Redis cache",
    demo_streaming: "Streaming",
    demo_telemetry_status: "Receiving real-time data (simulated Kafka stream)",
    demo_speed: "Speed",
    demo_temp: "Engine Temp",
    demo_fuel: "Fuel Level",
    demo_rpm: "RPM",
    demo_chart_title: "Speed Chart (last 60s)",
    demo_json_response: "Latest Kafka Message",
  },
};

const speedHistory = [];
const MAX_POINTS = 60;
let chartCtx;
let intervalId;
let msgCount = 0;

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

function seedHistory() {
  for (let i = 0; i < 25; i++) {
    speedHistory.push(randomBetween(45, 95));
  }
  msgCount = 25;
}

function generateTelemetry() {
  const speed = randomBetween(35, 115);
  const temp = randomBetween(78, 102);
  const fuel = randomBetween(22, 88);
  const rpm = randomBetween(1600, 4200);

  document.getElementById("speed-value").textContent = speed;
  document.getElementById("temp-value").textContent = temp;
  document.getElementById("fuel-value").textContent = fuel;
  document.getElementById("rpm-value").textContent = rpm;

  speedHistory.push(speed);
  if (speedHistory.length > MAX_POINTS) speedHistory.shift();

  msgCount += 1;
  document.getElementById("msg-count").textContent = msgCount + " msgs";

  const msg = {
    topic: "vehicle.telemetry",
    partition: 0,
    offset: 10000 + msgCount,
    timestamp: new Date().toISOString(),
    vehicleId: "VF8-12345678",
    payload: { speed, engineTemp: temp, fuelLevel: fuel, rpm },
    cached: true,
    cacheKey: "vehicle:VF8-12345678:latest",
    source: "Redis cache hit",
    latencyMs: randomBetween(2, 18),
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
  const fillColor = isDark ? "rgba(165, 0, 100, 0.2)" : "rgba(165, 0, 100, 0.12)";
  const textColor = isDark ? "#b0b0c8" : "#5c5c7a";

  const padding = 36;
  const maxSpeed = 140;

  chartCtx.strokeStyle = gridColor;
  chartCtx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding + ((h - padding * 2) / 4) * i;
    chartCtx.beginPath();
    chartCtx.moveTo(padding, y);
    chartCtx.lineTo(w - padding, y);
    chartCtx.stroke();
  }

  if (speedHistory.length < 2) return;

  const stepX = (w - padding * 2) / (MAX_POINTS - 1);

  chartCtx.strokeStyle = lineColor;
  chartCtx.lineWidth = 4;
  chartCtx.lineJoin = "round";
  chartCtx.beginPath();
  speedHistory.forEach((val, i) => {
    const x = padding + i * stepX;
    const y = h - padding - (val / maxSpeed) * (h - padding * 2);
    if (i === 0) chartCtx.moveTo(x, y);
    else chartCtx.lineTo(x, y);
  });
  chartCtx.stroke();

  chartCtx.fillStyle = fillColor;
  chartCtx.lineTo(padding + (speedHistory.length - 1) * stepX, h - padding);
  chartCtx.lineTo(padding, h - padding);
  chartCtx.closePath();
  chartCtx.fill();

  const last = speedHistory[speedHistory.length - 1];
  const lx = padding + (speedHistory.length - 1) * stepX;
  const ly = h - padding - (last / maxSpeed) * (h - padding * 2);
  chartCtx.fillStyle = lineColor;
  chartCtx.beginPath();
  chartCtx.arc(lx, ly, 8, 0, Math.PI * 2);
  chartCtx.fill();

  chartCtx.fillStyle = textColor;
  chartCtx.font = "22px sans-serif";
  chartCtx.fillText("0", 8, h - padding + 6);
  chartCtx.fillText(maxSpeed + " km/h", 8, padding);
}

document.addEventListener("DOMContentLoaded", () => {
  initDemoPage();
  applyDemoI18n();
  chartCtx = document.getElementById("speed-chart").getContext("2d");
  seedHistory();
  drawChart();
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

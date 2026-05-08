const ticket = document.querySelector("#ticket");
const ticketWrap = document.querySelector("#ticketWrap");
const revealButton = document.querySelector("#revealButton");
const resetButton = document.querySelector("#resetButton");
const messagePanel = document.querySelector("#messagePanel");
const soundButton = document.querySelector(".sound-toggle");
const starCanvas = document.querySelector("#stars");
const barcodeCanvas = document.querySelector("#barcode");

let audioContext;
let ambienceGain;
let ambienceOscillator;

function drawBarcode() {
  const ctx = barcodeCanvas.getContext("2d");
  const { width, height } = barcodeCanvas;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#f8f2e9";
  ctx.fillRect(0, 0, width, height);

  const bars = [4, 2, 7, 3, 2, 9, 4, 6, 2, 3, 8, 2, 5, 4, 7, 2, 3, 9, 4, 2, 6, 3, 7, 5];
  let x = 12;
  ctx.fillStyle = "#1a1613";
  bars.forEach((bar, index) => {
    if (index % 2 === 0) {
      ctx.fillRect(x, 10, bar, height - 22);
    }
    x += bar + 3;
  });

  ctx.fillStyle = "rgba(26, 22, 19, 0.7)";
  ctx.font = "10px Inter, Arial, sans-serif";
  ctx.fillText("VIERNES SANTO 0805", 42, height - 6);
}

function setupStars() {
  const ctx = starCanvas.getContext("2d");
  const dots = Array.from({ length: 96 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.8 + 0.3,
    speed: Math.random() * 0.18 + 0.04,
    alpha: Math.random() * 0.55 + 0.2
  }));

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    starCanvas.width = Math.floor(window.innerWidth * dpr);
    starCanvas.height = Math.floor(window.innerHeight * dpr);
    starCanvas.style.width = `${window.innerWidth}px`;
    starCanvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function animate() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const glow = ctx.createLinearGradient(0, 0, window.innerWidth, window.innerHeight);
    glow.addColorStop(0, "rgba(200, 156, 84, 0.12)");
    glow.addColorStop(0.5, "rgba(143, 23, 33, 0.08)");
    glow.addColorStop(1, "rgba(20, 63, 58, 0.12)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    dots.forEach((dot) => {
      dot.y -= dot.speed / 1000;
      if (dot.y < -0.02) dot.y = 1.02;
      ctx.beginPath();
      ctx.arc(dot.x * window.innerWidth, dot.y * window.innerHeight, dot.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(248, 242, 233, ${dot.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  resize();
  animate();
  window.addEventListener("resize", resize);
}

function tiltTicket(event) {
  const bounds = ticketWrap.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  ticket.style.transform = `rotateX(${y * -5}deg) rotateY(${x * 7}deg)`;
}

function resetTilt() {
  ticket.style.transform = "rotateX(0deg) rotateY(0deg)";
}

function detachTicket() {
  ticket.classList.add("is-detached");
  messagePanel.classList.add("is-visible");
  revealButton.disabled = true;
}

function rejoinTicket() {
  ticket.classList.remove("is-detached");
  messagePanel.classList.remove("is-visible");
  revealButton.disabled = false;
}

function toggleAmbience() {
  const isActive = soundButton.getAttribute("aria-pressed") === "true";

  if (isActive) {
    ambienceGain.gain.setTargetAtTime(0, audioContext.currentTime, 0.04);
    soundButton.setAttribute("aria-pressed", "false");
    return;
  }

  if (!audioContext) {
    audioContext = new AudioContext();
    ambienceGain = audioContext.createGain();
    ambienceOscillator = audioContext.createOscillator();
    ambienceOscillator.type = "sine";
    ambienceOscillator.frequency.value = 174;
    ambienceGain.gain.value = 0;
    ambienceOscillator.connect(ambienceGain).connect(audioContext.destination);
    ambienceOscillator.start();
  }

  audioContext.resume();
  ambienceGain.gain.setTargetAtTime(0.035, audioContext.currentTime, 0.08);
  soundButton.setAttribute("aria-pressed", "true");
}

drawBarcode();
setupStars();

ticketWrap.addEventListener("pointermove", tiltTicket);
ticketWrap.addEventListener("pointerleave", resetTilt);
revealButton.addEventListener("click", detachTicket);
resetButton.addEventListener("click", rejoinTicket);
soundButton.addEventListener("click", toggleAmbience);

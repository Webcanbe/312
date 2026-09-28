const TARGET = new Date("2027-01-01T00:00:00+09:00").getTime();
const CAPSULE_URL = "/capsule.json";
const KEY_URL = "https://raw.githubusercontent.com/Webcanbe/312/main/unlock-key.json";

const countdownEl = document.querySelector("#countdown");
const statusEl = document.querySelector("#status");
const messageEl = document.querySelector("#message");

function b64urlToBytes(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  return Uint8Array.from(bin, c => c.charCodeAt(0));
}

function fmt(ms) {
  if (ms <= 0) return "UNLOCK WINDOW OPEN";
  const total = Math.floor(ms / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${d}d ${String(h).padStart(2,"0")}h ${String(m).padStart(2,"0")}m ${String(s).padStart(2,"0")}s`;
}

async function decrypt(capsule, keyText) {
  const rawKey = b64urlToBytes(keyText.trim());
  const key = await crypto.subtle.importKey("raw", rawKey, "AES-GCM", false, ["decrypt"]);
  const plaintext = await crypto.subtle.decrypt(
    { name:"AES-GCM", iv:b64urlToBytes(capsule.nonce), additionalData:new TextEncoder().encode(capsule.aad) },
    key,
    b64urlToBytes(capsule.ciphertext)
  );
  return new TextDecoder().decode(plaintext);
}

async function tryUnlock() {
  if (Date.now() < TARGET) return;
  statusEl.textContent = "해제 키 공개 여부를 확인하는 중…";
  try {
    const [capsuleRes, keyRes] = await Promise.all([
      fetch(`${CAPSULE_URL}?v=1`, {cache:"no-store"}),
      fetch(`${KEY_URL}?t=${Date.now()}`, {cache:"no-store"})
    ]);
    if (!capsuleRes.ok) throw new Error("capsule unavailable");
    if (!keyRes.ok) {
      statusEl.textContent = "해제 시각은 지났지만 키 게시를 기다리고 있습니다. 자동으로 다시 확인합니다.";
      return;
    }
    const capsule = await capsuleRes.json();
    const keyObj = await keyRes.json();
    const text = await decrypt(capsule, keyObj.key);
    statusEl.textContent = "해제 완료.";
    statusEl.classList.add("ok");
    messageEl.textContent = text;
    messageEl.style.display = "block";
  } catch (err) {
    statusEl.textContent = "아직 복호화할 수 없습니다. 자동으로 다시 확인합니다.";
  }
}

setInterval(() => {
  countdownEl.textContent = fmt(TARGET - Date.now());
  if (Date.now() >= TARGET && messageEl.style.display !== "block") tryUnlock();
}, 1000);
countdownEl.textContent = fmt(TARGET - Date.now());
fetch(CAPSULE_URL, {cache:"no-store"}).then(r => {
  if (!r.ok) throw new Error();
  statusEl.textContent = Date.now() < TARGET
    ? "암호문은 준비되어 있습니다. 해제 키는 아직 공개되지 않았습니다."
    : "해제 시각에 도달했습니다. 키를 확인합니다.";
  tryUnlock();
}).catch(() => statusEl.textContent = "암호문을 불러오지 못했습니다.");
const svg = document.getElementById("canvas");
const layer = document.getElementById("layer");
const tool = document.getElementById("tool");
const strokeColor = document.getElementById("strokeColor");
const fillColor = document.getElementById("fillColor");
const useFill = document.getElementById("useFill");
const strokeWidth = document.getElementById("strokeWidth");
const undoBtn = document.getElementById("undo");
const redoBtn = document.getElementById("redo");
const clearBtn = document.getElementById("clear");
const downloadBtn = document.getElementById("download");

let drawing = false;
let start = null;
let currentEl = null;
let history = [];
let redoStack = [];

function svgPoint(evt) {
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  const ctm = svg.getScreenCTM().inverse();
  return pt.matrixTransform(ctm);
}

function applyStyle(el) {
  el.setAttribute("stroke", strokeColor.value);
  el.setAttribute("stroke-width", Number(strokeWidth.value) || 1);
  el.setAttribute("fill", useFill.checked ? fillColor.value : "none");
  el.setAttribute("vector-effect", "non-scaling-stroke");
}

function beginDraw(evt) {
  if (evt.button !== 0) return;
  drawing = true;
  redoStack = [];
  const p = svgPoint(evt);
  start = { x: p.x, y: p.y };
  const t = tool.value;
  if (t === "rect") {
    currentEl = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    currentEl.setAttribute("x", start.x);
    currentEl.setAttribute("y", start.y);
    currentEl.setAttribute("width", 0);
    currentEl.setAttribute("height", 0);
  } else if (t === "circle") {
    currentEl = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    currentEl.setAttribute("cx", start.x);
    currentEl.setAttribute("cy", start.y);
    currentEl.setAttribute("r", 0);
  } else if (t === "line") {
    currentEl = document.createElementNS("http://www.w3.org/2000/svg", "line");
    currentEl.setAttribute("x1", start.x);
    currentEl.setAttribute("y1", start.y);
    currentEl.setAttribute("x2", start.x);
    currentEl.setAttribute("y2", start.y);
    currentEl.setAttribute("fill", "none");
  } else if (t === "free") {
    currentEl = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    currentEl.setAttribute("points", `${start.x},${start.y}`);
    currentEl.setAttribute("fill", "none");
  }
  applyStyle(currentEl);
  layer.appendChild(currentEl);
}

function updateDraw(evt) {
  if (!drawing || !currentEl) return;
  const p = svgPoint(evt);
  const t = tool.value;
  if (t === "rect") {
    const x = Math.min(start.x, p.x);
    const y = Math.min(start.y, p.y);
    const w = Math.abs(p.x - start.x);
    const h = Math.abs(p.y - start.y);
    currentEl.setAttribute("x", x);
    currentEl.setAttribute("y", y);
    currentEl.setAttribute("width", w);
    currentEl.setAttribute("height", h);
  } else if (t === "circle") {
    const dx = p.x - start.x;
    const dy = p.y - start.y;
    const r = Math.sqrt(dx * dx + dy * dy);
    currentEl.setAttribute("r", r);
  } else if (t === "line") {
    currentEl.setAttribute("x2", p.x);
    currentEl.setAttribute("y2", p.y);
  } else if (t === "free") {
    const pts = currentEl.getAttribute("points");
    currentEl.setAttribute("points", pts + ` ${p.x},${p.y}`);
  }
}

function endDraw() {
  if (!drawing) return;
  drawing = false;
  if (currentEl) {
    const bbox = currentEl.getBBox();
    if (bbox.width === 0 && bbox.height === 0) {
      currentEl.remove();
    } else {
      history.push(currentEl);
    }
  }
  currentEl = null;
  start = null;
}

function undo() {
  if (history.length === 0) return;
  const el = history.pop();
  redoStack.push(el);
  el.remove();
}

function redo() {
  if (redoStack.length === 0) return;
  const el = redoStack.pop();
  layer.appendChild(el);
  history.push(el);
}

function clearAll() {
  const children = Array.from(layer.children);
  children.forEach(c => c.remove());
  history = [];
  redoStack = [];
}

function downloadSVG() {
  const clone = svg.cloneNode(true);
  const bbox = layer.getBBox();
  const pad = 16;
  const minX = Math.max(0, bbox.x - pad);
  const minY = Math.max(0, bbox.y - pad);
  const vb = `${minX} ${minY} ${Math.max(1, bbox.width + pad * 2)} ${Math.max(1, bbox.height + pad * 2)}`;
  clone.setAttribute("viewBox", vb);
  const xml = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "drawing.svg";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

svg.addEventListener("mousedown", beginDraw);
svg.addEventListener("mousemove", updateDraw);
window.addEventListener("mouseup", endDraw);
undoBtn.addEventListener("click", undo);
redoBtn.addEventListener("click", redo);
clearBtn.addEventListener("click", clearAll);
downloadBtn.addEventListener("click", downloadSVG);

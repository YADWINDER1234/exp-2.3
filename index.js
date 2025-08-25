const svg = document.getElementById("drawingArea");
let drawing = false;
let currentPath = null;

svg.addEventListener("mousedown", (e) => {
  drawing = true;
  const x = e.offsetX;
  const y = e.offsetY;

  currentPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  currentPath.setAttribute("d", `M${x} ${y}`);  // ✅ fixed
  currentPath.setAttribute("stroke", "blue");
  currentPath.setAttribute("fill", "none");
  currentPath.setAttribute("stroke-width", "2");

  svg.appendChild(currentPath);
});

svg.addEventListener("mousemove", (e) => {
  if (!drawing) return;
  const x = e.offsetX;
  const y = e.offsetY;

  let d = currentPath.getAttribute("d");
  d += ` L${x} ${y}`;
  currentPath.setAttribute("d", d);
});

svg.addEventListener("mouseup", () => {
  drawing = false;
  currentPath = null;
});

svg.addEventListener("mouseleave", () => {
  drawing = false;
  currentPath = null;
});

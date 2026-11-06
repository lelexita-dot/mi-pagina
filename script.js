/* =====================================================
   ROYAL TEAM · script.js
   1) Edita la sección CONFIGURACIÓN con los datos de tu team.
   2) El resto es el código que hace funcionar la página.
   ===================================================== */

/* ============ CONFIGURACIÓN (edita aquí) ============ */

const CONFIG = {
  nombreTeam: "The Glow Team",
  // Número del admin que recibe las reservas: código de país + número,
  // sin +, sin espacios y sin guiones. Ejemplo: "18095551234"
  whatsappAdmin: "528110516151",
  // Link de invitación al grupo de WhatsApp (opcional). Si lo dejas vacío, el botón no aparece.
  linkGrupo: ""
};

// Admins del team. "contacto" es opcional (mismo formato del número de arriba).
const ADMINS = [
  { nombre: "Soul",     cargo: "Owner",              texto: "Crea y cuida el reino. Aprueba los roles y resuelve dudas.", contacto: "528110516151" },
  { nombre: "Yeji",     cargo: "Mano derecha",       texto: "Organiza los eventos y las actividades diarias.",            contacto: "" },
  { nombre: "Jongseob", cargo: "Guardián del orden", texto: "Se encarga de las reglas y de que todos la pasen bien.",     contacto: "" },
  { nombre: "Ningning", cargo: "Bufón",              texto: "Procura mantener un ambiente tranquilo y divertido.",        contacto: "" }
];

// Roles de idols. Cambia los nombres por los que tu team quiera ofrecer.
// estado: "libre" o "ocupado". Si está ocupado, puedes poner "dueno" con el nombre de quien lo tiene.
const ROLES = [
  { idol: "Keeho",    grupo: "P1harmony", estado: "libre" },
  { idol: "Yeonjun",  grupo: "TXT",       estado: "libre" },
  { idol: "Jake",     grupo: "Enhypen",   estado: "libre" },
  { idol: "San",      grupo: "Ateez",     estado: "libre" },
  { idol: "Bangchan", grupo: "Skz",       estado: "libre" },
  { idol: "Chuu",     grupo: "Solista",   estado: "libre" },
  { idol: "Lia",      grupo: "Itzy",      estado: "libre" },
  { idol: "Yuqi",     grupo: "Idle",      estado: "libre" },
  { idol: "Sunghoon", grupo: "Enhypen",   estado: "libre" },
  { idol: "Taehyun",  grupo: "TXT",       estado: "libre" }
];

/* ============ FIN DE LA CONFIGURACIÓN ============ */


/* ---------- Utilidades ---------- */
const $ = (sel) => document.querySelector(sel);

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function mezclar(arr) {
  return arr.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
}
function normalizar(s) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
}
function leerJSON(clave, defecto) {
  try { return JSON.parse(localStorage.getItem(clave)) || defecto; } catch (e) { return defecto; }
}
function guardarJSON(clave, valor) {
  try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { /* sin almacenamiento */ }
}

/* ---------- Portada ---------- */
$("#fecha-edicion").textContent = new Date().toLocaleDateString("es", { month: "long", year: "numeric" });

if (CONFIG.linkGrupo) {
  const b = $("#btn-grupo");
  b.href = CONFIG.linkGrupo;
  b.hidden = false;
}

/* ---------- Admins ---------- */
function renderAdmins() {
  $("#lista-admins").innerHTML = ADMINS.map((a) => `
    <article class="admin-card">
      <div class="avatar">${esc(a.nombre.charAt(0))}</div>
      <h3>${esc(a.nombre)}</h3>
      <span class="admin-cargo">${esc(a.cargo)}</span>
      <p>${esc(a.texto)}</p>
      ${a.contacto ? `<a class="btn btn-primario" href="https://wa.me/${encodeURIComponent(a.contacto)}" target="_blank" rel="noopener">Escribir</a>` : ""}
    </article>`).join("");
}

/* ---------- Roles y reservas ---------- */
const CLAVE_RESERVAS = "royalReservas_v1";
let rolActual = null;

function renderRoles() {
  const filtro = $("#filtro-grupo").value;
  const reservas = leerJSON(CLAVE_RESERVAS, {});
  const lista = ROLES.filter((r) => filtro === "todos" || r.grupo === filtro);
  const libres = ROLES.filter((r) => r.estado !== "ocupado").length;
  $("#contador-roles").textContent = `${libres} de ${ROLES.length} roles disponibles`;

  $("#lista-roles").innerHTML = lista.map((r) => {
    const i = ROLES.indexOf(r);
    if (r.estado === "ocupado") {
      return `<div class="rol ocupado">
        <span class="rol-nombre">${esc(r.idol)}</span>
        <span class="rol-grupo">${esc(r.grupo)}</span>
        <span class="rol-estado">Reservado${r.dueno ? " · " + esc(r.dueno) : ""}</span>
      </div>`;
    }
    const pendiente = reservas[r.idol];
    return `<button type="button" class="rol libre${pendiente ? " pendiente" : ""}" data-i="${i}">
      <span class="rol-nombre">${esc(r.idol)}</span>
      <span class="rol-grupo">${esc(r.grupo)}</span>
      <span class="rol-estado">${pendiente ? "Solicitud enviada" : "Disponible · Reservar"}</span>
    </button>`;
  }).join("");
}

function iniciarFiltros() {
  const grupos = [...new Set(ROLES.map((r) => r.grupo))];
  $("#filtro-grupo").innerHTML = `<option value="todos">Todos los grupos</option>` +
    grupos.map((g) => `<option value="${esc(g)}">${esc(g)}</option>`).join("");
  $("#filtro-grupo").addEventListener("change", renderRoles);
}

function abrirModal(i) {
  rolActual = ROLES[i];
  $("#modal-titulo").textContent = rolActual.idol;
  $("#modal-sub").textContent = rolActual.grupo;
  $("#reserva-nombre").value = "";
  $("#modal").hidden = false;
  $("#reserva-nombre").focus();
}
function cerrarModal() {
  $("#modal").hidden = true;
  rolActual = null;
}

$("#lista-roles").addEventListener("click", (e) => {
  const b = e.target.closest("button.rol");
  if (b) abrirModal(Number(b.dataset.i));
});
$("#modal-cerrar").addEventListener("click", cerrarModal);
$("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") cerrarModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#modal").hidden) cerrarModal(); });

$("#form-reserva").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!rolActual) return;
  const nombre = $("#reserva-nombre").value.trim();
  if (!nombre) return;

  if (!CONFIG.whatsappAdmin) {
    alert("El admin todavía no ha configurado su número de WhatsApp en la página.");
    return;
  }
  const mensaje = `Hola 👑 Quiero reservar el rol de ${rolActual.idol} (${rolActual.grupo}) en ${CONFIG.nombreTeam}. Mi nombre en el team: ${nombre}.`;
  const url = `https://wa.me/${encodeURIComponent(CONFIG.whatsappAdmin)}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank", "noopener");

  const reservas = leerJSON(CLAVE_RESERVAS, {});
  reservas[rolActual.idol] = true;
  guardarJSON(CLAVE_RESERVAS, reservas);
  cerrarModal();
  renderRoles();
});

/* ---------- Arranque ---------- */
renderAdmins();
iniciarFiltros();
renderRoles();
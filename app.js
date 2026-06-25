const CONFIG = {
  firmName: "Estudio Jurídico",
  lawyerName: "Dr. Carlos Rodríguez",
  paymentLabel: "1 JUS ($45.738,02)",
  phoneDisplay: "+54 9 351 390 1916",
  phoneTel: "+5493513901916",
  paymentUrl: ""
};

const STORAGE_KEY = "estudio-juridico-consulta-paga";
const FREE_USED_KEY = "estudio-juridico-free-used";

const paidFromUrl = new URLSearchParams(window.location.search).get("paid") === "1";
const body = document.body;
const payButton = document.querySelector("#payButton");
const callButton = document.querySelector("#callButton");
const paymentDialog = document.querySelector("#paymentDialog");
const confirmPayment = document.querySelector("#confirmPayment");
const resetPayment = document.querySelector("#resetPayment");
const paymentStatus = document.querySelector("#paymentStatus");
const phoneReveal = document.querySelector("#phoneReveal");
const toast = document.querySelector("#toast");
const caseForm = document.querySelector("#caseForm");
const caseArea = document.querySelector("#caseArea");
const caseDescription = document.querySelector("#caseDescription");
const caseSummary = document.querySelector("#caseSummary");
const documentList = document.querySelector("#documentList");
const copySummary = document.querySelector("#copySummary");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const chatMessages = document.querySelector("#chatMessages");
const quickPrompts = document.querySelectorAll("[data-chat-prompt]");

const documentSuggestions = {
  laboral: [
    "Últimos recibos de sueldo o comprobantes de pago.",
    "Telegramas, cartas documento o intimaciones.",
    "Fecha de ingreso, tareas, jornada y datos del empleador."
  ],
  familia: [
    "DNI de las personas involucradas y partidas si corresponde.",
    "Acuerdos previos, resoluciones o expedientes existentes.",
    "Gastos, comprobantes y cronología de los hechos relevantes."
  ],
  civil: [
    "Contrato, presupuesto, factura o intercambio de mensajes.",
    "Datos completos de la otra parte.",
    "Comprobantes de pago, daños o incumplimientos."
  ],
  sucesiones: [
    "Partida de defunción y datos de herederos.",
    "Títulos, informes o datos de bienes registrables.",
    "Partidas que acrediten vínculos familiares."
  ],
  penal: [
    "Citación, denuncia, acta o notificación recibida.",
    "Datos de fiscalía, comisaría o juzgado si figuran.",
    "Nombres de testigos y cronología precisa."
  ],
  general: [
    "Documento recibido o conversación que originó la consulta.",
    "Datos de las partes involucradas.",
    "Fechas importantes y resultado esperado."
  ]
};

let currentChatState = "INIT";

const KNOWLEDGE_BASE = {
  INIT: {
    process: (text) => {
      const lower = text.toLowerCase();
      if (lower.match(/despido|trabajo|sueldo|laboral|art|accidente|renuncia|telegrama|negro/)) {
        currentChatState = "LABORAL_INIT";
        return "Entiendo que es un tema laboral. El derecho laboral en Córdoba es muy estricto con los plazos. ¿Se trata de un despido, un accidente de trabajo (ART) o un reclamo por sueldo/trabajo no registrado?";
      }
      if (lower.match(/familia|alimentos|divorcio|visita|hijo|cuota|violencia/)) {
        currentChatState = "FAMILIA_INIT";
        return "Comprendo, los temas de familia son muy delicados. En los juzgados de familia de Córdoba siempre se prioriza el interés superior de los menores y la protección urgente. ¿Tu consulta es por cuota alimentaria, un divorcio, o régimen de comunicación (visitas)?";
      }
      if (lower.match(/penal|denuncia|preso|detenido|imputado|fiscalia|policia|robo|estafa/)) {
        currentChatState = "PENAL_INIT";
        return "Atención: En materia penal el tiempo es vital. Si hay alguien detenido, la defensa debe actuar rápido en sede policial/judicial. ¿Fuiste víctima de un delito y querés denunciar, o vos o un familiar están imputados/citados por una fiscalía?";
      }
      if (lower.match(/civil|comercial|contrato|deuda|daño|choque|sucesion|herencia|alquiler|inmueble/)) {
        currentChatState = "CIVIL_INIT";
        return "Es un tema civil o comercial. Acá la documentación escrita (contratos, mensajes, facturas) es la clave principal del juicio. ¿Hablamos de un incumplimiento de contrato, una deuda a cobrar, un accidente de tránsito o una sucesión familiar?";
      }
      return "Para poder orientarte con precisión legal, decime en un par de palabras si tu problema está relacionado con trabajo (laboral), familia, un delito (penal) o temas de contratos/deudas/sucesiones (civil).";
    }
  },
  LABORAL_INIT: {
    process: (text) => {
      currentChatState = "LABORAL_DOCS";
      return "En la Provincia de Córdoba, el fuero laboral suele intentar audiencias de conciliación antes del juicio. Es FUNDAMENTAL que no respondas ningún telegrama ni firmes renuncias o recibos sin que lo lea tu abogado. ¿Llegaste a recibir algún telegrama del Correo Argentino o firmaste algún papel últimamente?";
    }
  },
  LABORAL_DOCS: {
    process: (text) => {
      currentChatState = "END";
      return "Perfecto, gracias por el dato. Según la Ley de Contrato de Trabajo, un mínimo error al redactar o contestar un telegrama puede hacerte perder derechos indemnizatorios irrecuperables. Para protegerte y calcular tu liquidación, el Dr. Carlos Rodríguez necesita revisar tu situación a fondo. Te recomiendo que uses tu PRIMERA CONSULTA GRATUITA haciendo clic en el botón principal para contactarnos ahora mismo.";
    }
  },
  FAMILIA_INIT: {
    process: (text) => {
      currentChatState = "FAMILIA_DOCS";
      return "En el fuero de Familia de Córdoba (regido por la Ley 10.305), muchos procesos requieren una etapa previa obligatoria de mediación (Asesoría de Familia). Ya sea por alimentos o divorcios, el primer paso es juntar partidas de nacimiento, DNI y comprobantes de ingresos/gastos. ¿Tenés o podrías conseguir esa documentación básica?";
    }
  },
  FAMILIA_DOCS: {
    process: (text) => {
      currentChatState = "END";
      return "Excelente. Cada familia es un mundo y las plantillas de internet no sirven. Para trazar una estrategia que proteja tu patrimonio y la paz de los tuyos, el Dr. Carlos Rodríguez debe evaluar el panorama completo de forma confidencial. Solicitá ahora tu primera consulta gratuita (hacé clic en el botón 'Usar consulta gratis') para que te asesore de forma personal.";
    }
  },
  PENAL_INIT: {
    process: (text) => {
      currentChatState = "END";
      return "Entiendo la gravedad. En el sistema acusatorio de Córdoba (Código Procesal Penal), cualquier declaración en sede policial o fiscalía sin tu abogado defensor puede ser usada en tu contra. Es URGENTE que NO declares y que el Dr. Carlos Rodríguez tome conocimiento del expediente o la imputación para preparar tu defensa o constituirse como querellante. Hacé clic en 'Usar consulta gratis' AHORA MISMO.";
    }
  },
  CIVIL_INIT: {
    process: (text) => {
      currentChatState = "CIVIL_DOCS";
      return "En el derecho Civil y Comercial, 'el que afirma debe probar'. Todo dependerá de la prueba que tengas (boletos de compraventa, títulos, pagarés, chats de WhatsApp, presupuestos). Si es una sucesión, necesitamos las partidas de defunción y declaratoria de herederos si la hay. ¿Contás con papeles firmados o pruebas sobre tu reclamo?";
    }
  },
  CIVIL_DOCS: {
    process: (text) => {
      currentChatState = "END";
      return "Bien. Ya sea para intimar por carta documento, iniciar una demanda por daños, o abrir una sucesión, el Código Civil y Comercial de la Nación exige pasos formales muy precisos. Un error de forma puede anular tu reclamo. Te sugiero usar tu primera consulta gratis para que el Dr. Carlos Rodríguez analice tus pruebas y te diga si es viable avanzar legalmente. Hacé clic en 'Usar consulta gratis'.";
    }
  },
  END: {
    process: (text) => {
      return "Como te comenté recién, para avanzar con total seguridad jurídica es indispensable que hables directamente con el abogado. Hacé clic en el botón 'Usar consulta gratis' (o en 'Llamar ahora') en el panel principal para comunicarte con el Dr. Carlos Rodríguez y contarle los detalles.";
    }
  }
};

function applyConfig() {
  document.querySelectorAll("[data-firm-name]").forEach((node) => {
    node.textContent = CONFIG.firmName;
  });
  document.querySelectorAll("[data-lawyer-name]").forEach((node) => {
    node.textContent = CONFIG.lawyerName;
  });
  document.querySelectorAll("[data-payment-label]").forEach((node) => {
    node.textContent = CONFIG.paymentLabel;
  });
}

function isPaid() {
  return paidFromUrl || localStorage.getItem(STORAGE_KEY) === "true";
}

function hasUsedFree() {
  return localStorage.getItem(FREE_USED_KEY) === "true";
}

function setFreeState() {
  localStorage.setItem(FREE_USED_KEY, "true");
  
  body.classList.add("is-paid");
  paymentStatus.textContent = "Consulta gratis activa";
  phoneReveal.textContent = "Llamada habilitada (hacé clic en el botón)";
  callButton.href = `tel:${CONFIG.phoneTel}`;
  callButton.classList.remove("is-locked");
  callButton.setAttribute("aria-disabled", "false");
  callButton.removeAttribute("data-locked");
  payButton.style.display = "none";
  buildCaseSummary();
}

function setPaidState(paid) {
  if (paid) {
    localStorage.setItem(STORAGE_KEY, "true");
    body.classList.add("is-paid");
    paymentStatus.textContent = "Pago confirmado";
    phoneReveal.textContent = "Llamada habilitada (hacé clic en el botón)";
    callButton.href = `tel:${CONFIG.phoneTel}`;
    callButton.classList.remove("is-locked");
    callButton.setAttribute("aria-disabled", "false");
    callButton.removeAttribute("data-locked");
    payButton.style.display = "none";
    buildCaseSummary();
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
  body.classList.remove("is-paid");
  
  if (!hasUsedFree()) {
    paymentStatus.textContent = "1° Consulta Gratis";
    payButton.innerHTML = `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Usar consulta gratis`;
  } else {
    paymentStatus.textContent = "Pago pendiente";
    payButton.innerHTML = `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5v-9Z" /><path d="M3 9h18M7 15h4" /></svg> Pagar ${CONFIG.paymentLabel}`;
  }

  payButton.style.display = "inline-flex";
  phoneReveal.textContent = "Número liberado al confirmar";
  callButton.href = "#pago";
  callButton.classList.add("is-locked");
  callButton.setAttribute("aria-disabled", "true");
  callButton.setAttribute("data-locked", "true");
  buildCaseSummary();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2600);
}

function openPayment() {
  if (CONFIG.paymentUrl) {
    window.open(CONFIG.paymentUrl, "_blank", "noopener,noreferrer");
    return;
  }

  if (typeof paymentDialog.showModal === "function") {
    paymentDialog.showModal();
    return;
  }

  setPaidState(true);
  showToast("Pago confirmado para prueba.");
}

function buildCaseSummary() {
  const areaLabel = caseArea.options[caseArea.selectedIndex].textContent;
  const urgency = new FormData(caseForm).get("urgency");
  const selectedDocs = [...caseForm.querySelectorAll('input[type="checkbox"]:checked')].map(
    (node) => node.value
  );
  const description = caseDescription.value.trim() || "Sin relato cargado.";
  const suggestions = documentSuggestions[caseArea.value];

  documentList.innerHTML = suggestions.map((item) => `<li>${item}</li>`).join("");

  caseSummary.value = [
    `Área: ${areaLabel}`,
    `Urgencia: ${urgency}`,
    `Documentación disponible: ${selectedDocs.length ? selectedDocs.join(", ") : "A confirmar"}`,
    "",
    `Relato: ${description}`,
    "",
    `Honorario de consulta telefónica: ${isPaid() ? "Abonado" : (!hasUsedFree() ? "GRATIS (1° Consulta)" : CONFIG.paymentLabel)}`
  ].join("\n");
}

async function copyGeneratedSummary() {
  caseSummary.select();
  caseSummary.setSelectionRange(0, caseSummary.value.length);

  try {
    await navigator.clipboard.writeText(caseSummary.value);
  } catch {
    document.execCommand("copy");
  }

  showToast("Resumen copiado.");
}

function addChatMessage(author, text) {
  const message = document.createElement("div");
  message.className = `chat-message ${author}`;
  const label = author === "bot" ? "Asistente" : "Cliente";
  message.innerHTML = `<strong>${label}</strong><span></span>`;
  message.querySelector("span").textContent = text;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addTypingIndicator(id) {
  const message = document.createElement("div");
  message.className = "chat-message bot typing";
  message.id = id;
  message.innerHTML = `<strong>Asistente</strong><span style="color: var(--muted); font-style: italic;">Escribiendo...</span>`;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

async function handleChatSubmit(text) {
  const query = text.trim();
  if (!query) return;

  addChatMessage("user", query);
  chatInput.value = "";
  chatInput.disabled = true;
  
  const typingId = "typing-" + Date.now();
  addTypingIndicator(typingId);

  // Simular tiempo de pensamiento/escritura humano (1 a 2.5 segundos)
  const delay = Math.floor(Math.random() * 1500) + 1000;
  
  setTimeout(() => {
    removeTypingIndicator(typingId);
    
    // Obtener respuesta de la base de conocimientos según el estado
    const stateLogic = KNOWLEDGE_BASE[currentChatState];
    const reply = stateLogic.process(query);
    
    addChatMessage("bot", reply);
    
    chatInput.disabled = false;
    chatInput.focus();
  }, delay);
}

applyConfig();
setPaidState(isPaid());
buildCaseSummary();
const initialMessage = "Hola, soy el asistente legal inicial. Puedo ordenar consultas rápidas. ¿Sobre qué tema de derecho necesitás orientarte hoy?";
addChatMessage("bot", initialMessage);

function handleMainAction() {
  if (!hasUsedFree()) {
    setFreeState();
    showToast("Primera consulta gratuita habilitada. Podés llamar ahora.");
  } else {
    openPayment();
  }
}

payButton.addEventListener("click", handleMainAction);

confirmPayment.addEventListener("click", () => {
  setPaidState(true);
  paymentDialog.close();
  showToast("Pago confirmado. Llamada habilitada.");
  callButton.focus();
});

resetPayment.addEventListener("click", () => {
  localStorage.removeItem(FREE_USED_KEY);
  setPaidState(false);
  showToast("Prueba reiniciada.");
});

callButton.addEventListener("click", (event) => {
  if (callButton.dataset.locked === "true") {
    event.preventDefault();
    showToast(`Primero confirmá el pago de ${CONFIG.paymentLabel}.`);
  }
});

caseForm.addEventListener("input", buildCaseSummary);
caseForm.addEventListener("change", buildCaseSummary);
copySummary.addEventListener("click", copyGeneratedSummary);

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  handleChatSubmit(chatInput.value);
});

quickPrompts.forEach((button) => {
  button.addEventListener("click", () => {
    handleChatSubmit(button.dataset.chatPrompt);
  });
});

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
const sendVoucherBtn = document.querySelector("#sendVoucherBtn");
const closePaymentModal = document.querySelector("#closePaymentModal");
const closePaymentModal2 = document.querySelector("#closePaymentModal2");
const resetPayment = document.querySelector("#resetPayment");
const paymentStatus = document.querySelector("#paymentStatus");
const phoneReveal = document.querySelector("#phoneReveal");
const toast = document.querySelector("#toast");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const chatMessages = document.querySelector("#chatMessages");
const quickPrompts = document.querySelectorAll("[data-chat-prompt]");


const SERVICES = [
  {
    id: "verbal",
    title: "Consulta Verbal",
    desc: "Orientación sobre situación legal, plazos y opciones posibles.",
    jus: 2,
    pesos: "$91.476,04",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
  },
  {
    id: "escrita",
    title: "Consulta Escrita",
    desc: "Análisis documentado con respuesta formal por escrito.",
    jus: 4,
    pesos: "$182.952,08",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`
  },
  {
    id: "tramite",
    title: "Causas en Trámite",
    desc: "Revisión y asesoramiento sobre expediente judicial en curso.",
    jus: 8,
    pesos: "$365.904,16",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
  },
  {
    id: "fianza",
    title: "Fianza Personal",
    desc: "Garantía personal ante terceros o instituciones financieras.",
    jus: 200,
    pesos: "$9.147.604,00",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
  }
];

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
    if (document.querySelector("#caseSummary")) buildCaseSummary();
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
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2600);
}

let qrGenerated = false;

function openPayment() {
  if (typeof paymentDialog.showModal === "function") {
    paymentDialog.showModal();
    
    // Generar el QR una sola vez si no se generó
    if (!qrGenerated) {
      new QRCode(document.getElementById("qrcode"), {
        text: "CUAL.PRENDIDO.TELAR",
        width: 150,
        height: 150,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
      });
      qrGenerated = true;
    }
    return;
  }
}

function buildCaseSummary() {
  const el = document.querySelector("#caseSummary");
  if (!el) return;
  el.value = "(Sección eliminada)";
}

function initEstimator() {
  const serviceGrid = document.querySelector("#serviceGrid");
  if (!serviceGrid) return;

  const resultJus = document.querySelector("#resultJus");
  const resultPesos = document.querySelector("#resultPesos");
  const resultNote = document.querySelector("#resultNote");
  const estimatorCta = document.querySelector("#estimatorCta");

  SERVICES.forEach((service) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "service-card";
    card.setAttribute("aria-label", service.title);
    card.innerHTML = `
      <span class="service-icon">${service.icon}</span>
      <strong class="service-title">${service.title}</strong>
      <span class="service-jus">${service.jus} JUS</span>
      <span class="service-pesos">desde ${service.pesos}</span>
      <span class="service-desc">${service.desc}</span>
    `;
    card.addEventListener("click", () => {
      serviceGrid.querySelectorAll(".service-card").forEach((c) => {
        c.classList.remove("is-selected");
        c.setAttribute("aria-pressed", "false");
      });
      card.classList.add("is-selected");
      card.setAttribute("aria-pressed", "true");
      resultJus.textContent = `${service.jus} JUS`;
      resultPesos.textContent = `desde ${service.pesos}`;
      resultNote.textContent = service.desc;
      estimatorCta.style.display = "inline-flex";
    });
    serviceGrid.appendChild(card);
  });
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
initEstimator();
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

if (closePaymentModal) {
  closePaymentModal.addEventListener("click", () => {
    paymentDialog.close();
  });
}

if (closePaymentModal2) {
  closePaymentModal2.addEventListener("click", () => {
    paymentDialog.close();
  });
}

sendVoucherBtn.addEventListener("click", () => {
  const wsNumber = CONFIG.phoneTel.replace("+", "");
  const wsText = encodeURIComponent(`Hola, acabo de transferir el honorario para la consulta (${CONFIG.paymentLabel}) al alias CUAL.PRENDIDO.TELAR. Adjunto mi comprobante para habilitar la llamada:`);
  
  // 1. Desbloquear PRIMERO (antes de cualquier otra cosa)
  setPaidState(true);
  
  // 2. Cerrar el diálogo
  paymentDialog.close();
  
  // 3. Abrir WhatsApp y mostrar toast
  window.open(`https://wa.me/${wsNumber}?text=${wsText}`, "_blank");
  showToast("✅ Llamada habilitada. Enviando comprobante por WhatsApp...");
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
    return;
  }

  // Una vez que hace clic en llamar (estando desbloqueado), 
  // esperamos 2 segundos para que se abra el teléfono y bloqueamos de nuevo.
  setTimeout(() => {
    setPaidState(false);
    showToast("Llamada registrada. Para realizar otra consulta, deberás abonar el honorario.");
  }, 2000);
});

caseForm && caseForm.addEventListener("input", buildCaseSummary);
caseForm && caseForm.addEventListener("change", buildCaseSummary);
copySummary && copySummary.addEventListener("click", copyGeneratedSummary);

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  handleChatSubmit(chatInput.value);
});

quickPrompts.forEach((button) => {
  button.addEventListener("click", () => {
    handleChatSubmit(button.dataset.chatPrompt);
  });
});

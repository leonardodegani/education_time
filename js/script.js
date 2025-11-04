/* =======================
   LinguaWiser - script.js
   Substitua o conteúdo atual por este
   ======================= */

/* ========== MENU / SWIPER / POPUPS ========== */
let navbar = document.querySelector('.header .navbar');
let loginForm = document.querySelector('.login-form');

document.querySelector('#menu-btn')?.addEventListener('click', () => {
  navbar.classList.toggle('active');
  if (loginForm) loginForm.classList.remove('active');
});

/* simples swiper init (se estiver usando) */
document.addEventListener("DOMContentLoaded", function () {
  if (typeof Swiper !== 'undefined') {
    new Swiper(".review-slider", {
      spaceBetween: 20,
      centeredSlides: true,
      grabCursor: true,
      autoplay: { delay: 7500, disableOnInteraction: false },
      loop: true,
      breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 991: { slidesPerView: 3 } }
    });
  }
});

function openPopup(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'flex';
}

function closePopup(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

/* ========== CARRINHO (localStorage) ========== */
const STORAGE_KEY = 'lw_cart_v1';

function getCart() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch (e) { return []; }
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  updateCartCount();
}

function addToCart(item) {
  const cart = getCart();
  cart.push(item);
  saveCart(cart);
}

/* atualiza badge do carrinho */
function updateCartCount() {
  const countEl = document.getElementById('cartCount');
  const cart = getCart();
  if (countEl) countEl.textContent = cart.length;
}

/* cria objeto de item a partir do elemento .box */
function createItemObjectFromBox(boxEl) {
  const title = boxEl.getAttribute('data-title') || boxEl.querySelector('h3')?.innerText || 'Item';
  const type = boxEl.getAttribute('data-type') || 'Produto';
  const price = parseFloat(boxEl.getAttribute('data-price') || '0') || 0;
  const original = parseFloat(boxEl.getAttribute('data-original') || price) || price;
  return { title, type, price, original };
}

/* função chamada ao clicar em "Quero esse" em qualquer item */
function selectItemFromElement(btnEl) {
  const box = btnEl.closest('.box');
  if (!box) return;
  const item = createItemObjectFromBox(box);
  addToCart(item);

  // feedback curto
  btnEl.textContent = 'Adicionado ✓';
  btnEl.disabled = true;
  btnEl.style.opacity = '0.85';

  // Avança para próxima etapa
  goToNextStage(box);
}

/* ====== Fluxo por etapas (mostrar próximas seções) ====== */
const STAGES = ['courses', 'accommodation', 'transport', 'lead'];

function goToNextStage(currentBoxOrElement) {
  let currentStageEl = currentBoxOrElement.closest('.stage');
  if (!currentStageEl) {
    currentStageEl = document.querySelector('.stage:not([style*="display:none"])');
  }
  if (!currentStageEl) return;

  const currentStep = currentStageEl.getAttribute('data-step');
  const idx = STAGES.indexOf(currentStep);
  const next = STAGES[idx + 1];
  if (next) showStage(next);
}

/* mostra a stage (e rola até o título/introduction se houver) */
function showStage(name) {
  // mapeamento das sections principais
  const map = {
    courses: 'coursesSection',
    accommodation: 'accommodationSection',
    transport: 'transportSection',
    lead: 'leadSection'
  };

  // mapeamento das intros (onde o <h1> geralmente está)
  const introMap = {
    courses: 'servicesIntro',         // importante: o título "Cursos" está no servicesIntro
    accommodation: 'accommodationIntro',
    transport: 'transportIntro'
  };

  const id = map[name];
  if (!id) return;

  // mostrar intro (se existir)
  const introId = introMap[name];
  let introEl = null;
  if (introId) {
    introEl = document.getElementById(introId);
    if (introEl) introEl.style.display = '';
  }

  // mostrar a section alvo
  const el = document.getElementById(id);
  if (el) el.style.display = '';

  // cálculo do header dinamicamente
  const header = document.querySelector('.header');
  const headerH = header ? header.offsetHeight : 90;

  // espera curta para que o DOM repinte (principalmente quando a section estava display:none)
  setTimeout(() => {
    // procura o título dentro do intro (se existir) ou dentro da própria section
    const root = introEl || el;
    if (!root) return;

    const title = root.querySelector('h1, h2, .heading, .section-title');
    if (title) {
      // posição do título na página
      const y = title.getBoundingClientRect().top + window.pageYOffset - headerH - 12; // 12px de folga extra
      window.scrollTo({ top: y, behavior: 'smooth' });
    } else {
      // fallback: rolar ao topo da section com o mesmo offset
      const y = el.getBoundingClientRect().top + window.pageYOffset - headerH - 12;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, 150);
}
/* ========== "Prosseguir sem..." e Lead form ========== */
document.addEventListener('DOMContentLoaded', function () {
  // Prosseguir sem acomodação
  const skipAccommodationBtn = document.getElementById('skipAccommodationBtn');
  if (skipAccommodationBtn) {
    skipAccommodationBtn.addEventListener('click', function () {
      addToCart({ title: 'Sem acomodação', type: 'Acomodação', price: 0, original: 0 });
      skipAccommodationBtn.textContent = 'Registrado ✓';
      showStage('transport');
    });
  }

  // Prosseguir sem transporte
  const skipTransportBtn = document.getElementById('skipTransportBtn');
  if (skipTransportBtn) {
    skipTransportBtn.addEventListener('click', function () {
      addToCart({ title: 'Sem transporte', type: 'Transporte', price: 0, original: 0 });
      skipTransportBtn.textContent = 'Registrado ✓';
      showStage('lead');
    });
  }

  // Lead form submit
  const leadForm = document.getElementById('leadForm');
  if (leadForm) {
    leadForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const nome = document.getElementById('nome').value.trim();
      const whatsapp = document.getElementById('whatsapp').value.trim();
      const lead = { nome, whatsapp };
      localStorage.setItem('lw_lead', JSON.stringify(lead));
      window.location.href = 'cart.html';
    });
  }

  /* startBtn: usar showStage para rolar até 'courses' (substitua handler antigo se houver) */
const startBtn = document.getElementById('startBtn');
if (startBtn) {
  startBtn.addEventListener('click', function (e) {
    e.preventDefault();
    // esconder seções seguintes (mantém seu fluxo)
    ['accommodationSection', 'transportSection', 'leadSection', 'accommodationIntro', 'transportIntro'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    // mostra e rola até o título de Cursos (servicesIntro)
    showStage('courses');
  });
}

  // ativar load more e atualizar contador
  initLoadMore();
  updateCartCount();
});

/* ========== Carregar mais (mostra 2 por clique) ========== */
function initLoadMore() {
  /* CURSOS */
  const extraCourses = Array.from(document.querySelectorAll('.extra-course'));
  const loadMoreCoursesBtn = document.getElementById('loadMoreCourses');
  let courseIndex = 0;
  extraCourses.forEach(el => { el.style.display = 'none'; el.classList.remove('added'); });

  if (loadMoreCoursesBtn && extraCourses.length > 0) {
    loadMoreCoursesBtn.addEventListener('click', function () {
      const toShow = extraCourses.slice(courseIndex, courseIndex + 2);
      toShow.forEach(el => {
        el.style.display = 'block';
        setTimeout(() => el.classList.add('added'), 20);
      });
      courseIndex += toShow.length;
      if (toShow.length === 0 || courseIndex >= extraCourses.length) loadMoreCoursesBtn.style.display = 'none';
    });
  } else if (loadMoreCoursesBtn) loadMoreCoursesBtn.style.display = 'none';

  /* ACOMODAÇÃO (se usar .extra-accom no HTML) */
  const extraAccom = Array.from(document.querySelectorAll('.extra-accom'));
  const loadMoreAccommodationBtn = document.getElementById('loadMoreAccommodation');
  let accomIndex = 0;
  extraAccom.forEach(el => { el.style.display = 'none'; el.classList.remove('added'); });
  if (loadMoreAccommodationBtn && extraAccom.length > 0) {
    loadMoreAccommodationBtn.addEventListener('click', function () {
      const toShow = extraAccom.slice(accomIndex, accomIndex + 2);
      toShow.forEach(el => { el.style.display = 'block'; setTimeout(() => el.classList.add('added'), 20); });
      accomIndex += toShow.length;
      if (toShow.length === 0 || accomIndex >= extraAccom.length) loadMoreAccommodationBtn.style.display = 'none';
    });
  } else if (loadMoreAccommodationBtn) loadMoreAccommodationBtn.style.display = 'none';

  /* TRANSPORTE (se usar .extra-transport no HTML) */
  const extraTransport = Array.from(document.querySelectorAll('.extra-transport'));
  const loadMoreTransportBtn = document.getElementById('loadMoreTransport');
  let transportIndex = 0;
  extraTransport.forEach(el => { el.style.display = 'none'; el.classList.remove('added'); });
  if (loadMoreTransportBtn && extraTransport.length > 0) {
    loadMoreTransportBtn.addEventListener('click', function () {
      const toShow = extraTransport.slice(transportIndex, transportIndex + 2);
      toShow.forEach(el => { el.style.display = 'block'; setTimeout(() => el.classList.add('added'), 20); });
      transportIndex += toShow.length;
      if (toShow.length === 0 || transportIndex >= extraTransport.length) loadMoreTransportBtn.style.display = 'none';
    });
  } else if (loadMoreTransportBtn) loadMoreTransportBtn.style.display = 'none';
}

/* ================= helper para criar HTML dinâmico (se necessário) ============== */
function formatCurrency(num) {
  return 'R$' + Number(num).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ================= inicialização leve ================ */
(function initialSetup() {
  updateCartCount();
})();


/* ============================================================
   CART PAGE SCRIPT - compatível com várias versões de cart.html
   Substitua/cole no final do seu script.js (substitui blocos antigos)
   ============================================================ */
document.addEventListener("DOMContentLoaded", function () {
  // detecta se estamos na página do carrinho
  const cartPage = document.getElementById("cartPage") || document.querySelector('body[id="cartPage"]');
  if (!cartPage) return;

  // compatibilidade: possíveis ids usados no HTML
  const tbodyEl = document.getElementById("cartList") || document.getElementById("cartItems") || document.getElementById("cartListContainer");
  const tableEl = document.getElementById("cartTable");
  const cartTotalEl = document.getElementById("cartTotal") || document.getElementById("totalPrice");
  const emptyEl = document.getElementById("emptyMsg") || document.getElementById("emptyCartMessage");
  const finalizeBtn = document.getElementById("finalizeBtn") || document.getElementById("finalizeCart");
  const clearBtn = document.getElementById("clearBtn") || document.getElementById("clearCart");
  const cartActions = document.getElementById("cartActions");
  const leadBox = document.getElementById("leadBox") || document.getElementById("leadInfo");
  const leadName = document.getElementById("leadName");
  const leadWhatsapp = document.getElementById("leadWhatsapp");

  // pega o carrinho
  const cart = getCart() || [];
  updateCartCount();

  // mostra dados do lead (se houver)
  const lead = JSON.parse(localStorage.getItem("lw_lead") || "{}");
  if (leadBox) {
    if (lead.nome || lead.whatsapp) {
      // se leadBox for um container genérico (id leadInfo) coloca conteúdo
      if (leadBox.id === "leadInfo") {
        leadBox.style.display = "";
        leadBox.innerHTML = `<div class="lead-info"><h3>Seus dados</h3>
          <p>Nome: ${lead.nome || "Não informado"}</p>
          <p>WhatsApp: ${lead.whatsapp || "Não informado"}</p></div>`;
      } else {
        leadBox.style.display = "";
        if (leadName) leadName.textContent = `Nome: ${lead.nome || "Não informado"}`;
        if (leadWhatsapp) leadWhatsapp.textContent = `WhatsApp: ${lead.whatsapp || "Não informado"}`;
      }
    } else {
      // se não houver lead, mantém escondido
      leadBox.style.display = "none";
    }
  }

  // se carrinho vazio
  if (!cart || cart.length === 0) {
    if (emptyEl) emptyEl.style.display = "";
    if (tableEl) tableEl.style.display = "none";
    if (cartTotalEl) cartTotalEl.style.display = "none";
    if (cartActions) cartActions.style.display = "none";
    return;
  }

  // existe itens: exibe tabela, ações e oculta mensagem vazia
  if (emptyEl) emptyEl.style.display = "none";
  if (tableEl) tableEl.style.display = "";
  if (cartTotalEl) cartTotalEl.style.display = "";
  if (cartActions) cartActions.style.display = "";

  // determina container onde vamos inserir linhas
  const rowsContainer = document.getElementById("cartItems") || document.getElementById("cartList") || document.getElementById("cartList");
  if (!rowsContainer) {
    console.warn("cart page: nenhum container para linhas encontrado (ids esperados: cartItems, cartList).");
    return;
  }

  // limpa
  rowsContainer.innerHTML = "";

  // popula linhas (como tabela)
  let total = 0;
  cart.forEach((item, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <strong>${escapeHtml(item.title || "Item")}</strong><br/>
        <small style="color:#666">${escapeHtml(item.type || "")}</small>
      </td>
      <td class="price">${formatCurrency(item.price || 0)}</td>
      <td style="text-align:center">
        <button class="remove-btn" data-index="${idx}" title="Remover item">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    `;
    rowsContainer.appendChild(tr);
    total += Number(item.price || 0);
  });

  // exibe total (preferindo cartTotalEl se existir)
  if (cartTotalEl) {
    cartTotalEl.style.display = "";
    cartTotalEl.innerHTML = `<strong>Total:</strong> ${formatCurrency(total)}`;
  } else {
    // fallback: se não existir, tenta criar um elemento visível
    const fallback = document.getElementById("cartTotal");
    if (fallback) fallback.innerHTML = `<strong>Total:</strong> ${formatCurrency(total)}`;
  }

  // remover item (delegation)
  rowsContainer.addEventListener("click", (ev) => {
    const btn = ev.target.closest && ev.target.closest(".remove-btn");
    if (!btn) return;
    const idx = Number(btn.getAttribute("data-index"));
    if (Number.isNaN(idx)) return;
    const cur = getCart();
    cur.splice(idx, 1);
    saveCart(cur);
    // recarrega para recalcular índices com facilidade
    location.reload();
  });

  // limpar tudo
  if (clearBtn) {
    clearBtn.style.display = "";
    clearBtn.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    });
  }

 // finalizar -> whatsapp
  if (finalizeBtn) {
    finalizeBtn.style.display = "";
    finalizeBtn.addEventListener("click", () => {
      const leadData = JSON.parse(localStorage.getItem("lw_lead") || "{}");
      const nome = leadData.nome || "Cliente";
      const whatsapp = leadData.whatsapp || "";
      
      // NOVO CONTEÚDO DA MENSAGEM (Com Emojis, Negrito e Quebras de Linha)
      let message = `*INTERCÂMBIO EM MALTA*\n\n`;

      message += `_DADOS DO CLIENTE:_\n`;
      message += `*Nome:* ${nome}\n`;
      message += `*WhatsApp:* ${whatsapp}\n\n`;

      message += `_ITENS SELECIONADOS:_\n`;
      
      // Lista de itens (loop)
      cart.forEach((it) => {
        message += `${it.type || "Item"}: ${it.title || "—"} (${formatCurrency(it.price || 0)})\n`;
      });
      
      message += `\n*TOTAL DO ORÇAMENTO:* *${formatCurrency(total)}*\n`;
      message += `\nOlá! Gostaria de mais informações para o meu intercâmbio...`;
      // FIM DO NOVO CONTEÚDO

      const encoded = encodeURIComponent(message);
      const phone = "5541992188670"; // troque se precisar
      window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
    });
  }

  // util: escape simples para evitar injeção acidental nas strings
  function escapeHtml(str) {
    if (typeof str !== "string") return str;
    return str.replace(/[&<>"'`=\/]/g, function (s) {
      return ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "/": "&#x2F;",
        "`": "&#x60;",
        "=": "&#x3D;"
      })[s];
    });
  }
});


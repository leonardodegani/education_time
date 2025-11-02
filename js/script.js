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
  const map = {
    courses: 'coursesSection',
    accommodation: 'accommodationSection',
    transport: 'transportSection',
    lead: 'leadSection'
  };
  const id = map[name];
  if (!id) return;

  const introMap = { accommodation: 'accommodationIntro', transport: 'transportIntro' };
  const introId = introMap[name];
  let introEl = null;
  if (introId) {
    introEl = document.getElementById(introId);
    if (introEl) introEl.style.display = '';
  }

  const el = document.getElementById(id);
  if (el) {
    el.style.display = '';

    setTimeout(() => {
      const searchRoot = introEl || el;
      const title = searchRoot.querySelector('h1, h2, .section-title');
      if (title) {
        const yOffset = -90; // ajuste aqui para espaçamento do topo (altere conforme quiser)
        const y = title.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  }
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

  // "Comece aqui" botão — esconde seções posteriores e rola para cursos
  const startBtn = document.getElementById('startBtn');
  if (startBtn) {
    startBtn.addEventListener('click', function (e) {
      ['accommodationSection', 'transportSection', 'leadSection', 'accommodationIntro', 'transportIntro'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
      setTimeout(() => {
        document.getElementById('coursesSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
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
   CART PAGE SCRIPT - renderiza os itens no cart.html
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  const cartPage = document.getElementById("cartPage");
  if (!cartPage) return; // executa apenas se estivermos no cart.html

  const cartList = document.getElementById("cartList");
  const totalPriceEl = document.getElementById("totalPrice");
  const emptyMessage = document.getElementById("emptyCartMessage");
  const finalizeBtn = document.getElementById("finalizeBtn");

  const cart = getCart();
  updateCartCount();

  if (cart.length === 0) {
    emptyMessage.style.display = "block";
    cartList.style.display = "none";
    if (finalizeBtn) finalizeBtn.style.display = "none";
    return;
  }

  emptyMessage.style.display = "none";
  cartList.innerHTML = "";

  let total = 0;

  cart.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
      <div class="cart-info">
        <strong>${item.title}</strong><br>
        <small>${item.type}</small>
      </div>
      <div class="cart-actions">
        <span>${formatCurrency(item.price)}</span>
        <button class="remove-btn" data-index="${index}">✕</button>
      </div>
    `;
    cartList.appendChild(li);
    total += item.price;
  });

  totalPriceEl.textContent = formatCurrency(total);

  // botão remover
  cartList.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
      const idx = e.target.getAttribute("data-index");
      const newCart = getCart();
      newCart.splice(idx, 1);
      saveCart(newCart);
      location.reload();
    }
  });

  // botão finalizar → enviar mensagem pro WhatsApp
  finalizeBtn?.addEventListener("click", function () {
    const lead = JSON.parse(localStorage.getItem("lw_lead") || "{}");
    const nome = lead.nome || "Cliente";
    const whatsapp = lead.whatsapp || "";

    let message = `*Novo pedido de intercâmbio:*\n\n👤 *Nome:* ${nome}\n📱 *WhatsApp:* ${whatsapp}\n\n🛒 *Itens selecionados:*\n`;

    cart.forEach((item) => {
      message += `• ${item.type}: ${item.title} - ${formatCurrency(item.price)}\n`;
    });

    message += `\n💰 *Total:* ${formatCurrency(total)}\n\nPor favor, entre em contato para concluir.`;

    const encodedMsg = encodeURIComponent(message);
    const phone = "5541992188670"; // SEU NÚMERO AQUI
    const url = `https://wa.me/${phone}?text=${encodedMsg}`;
    window.open(url, "_blank");
  });
});

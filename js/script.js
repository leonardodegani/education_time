/* ========== Seu JS anterior (menu / swiper / popups) ========== */
let navbar = document.querySelector('.header .navbar');
let loginForm = document.querySelector('.login-form');

document.querySelector('#menu-btn').onclick = () => {
  navbar.classList.toggle('active');
  if (loginForm) loginForm.classList.remove('active');
};

window.onscroll = () => {
  navbar.classList.remove('active');
  if (loginForm) loginForm.classList.remove('active');
};

document.addEventListener("DOMContentLoaded", function () {
  var swiper = new Swiper(".review-slider", {
    spaceBetween: 20,
    centeredSlides: true,
    grabCursor: true,
    autoplay: { delay: 7500, disableOnInteraction: false },
    loop: true,
    breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 991: { slidesPerView: 3 } }
  });
});

function openPopup(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'flex';
}

function closePopup(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

/* ========== NOVO: Fluxo por etapas, carrinho e carregar mais ========== */

/* --- Helpers: Local storage cart --- */
const STORAGE_KEY = 'lw_cart_v1';
function getCart() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch(e){ return []; }
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
  // procura o .box pai
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

/* --- avanço entre seções --- */
const STAGES = ['courses', 'accommodation', 'transport', 'lead'];
function goToNextStage(currentBoxOrElement) {
  // encontra o stage atual (busca o ancestor com data-step)
  let currentStageEl = currentBoxOrElement.closest('.stage');
  // caso não ache, usamos o primeiro stage visível
  if(!currentStageEl) {
    currentStageEl = document.querySelector('.stage:not([style*="display:none"])');
  }
  if (!currentStageEl) return;

  const currentStep = currentStageEl.getAttribute('data-step');
  const idx = STAGES.indexOf(currentStep);
  const next = STAGES[idx + 1];
  if (next) {
    showStage(next);
  }
}

/* mostra a stage pelo nome: 'courses', 'accommodation', 'transport', 'lead' */
function showStage(name) {
  // mapeia para ids das seções
  const map = {
    courses: 'coursesSection',
    accommodation: 'accommodationSection',
    transport: 'transportSection',
    lead: 'leadSection'
  };
  const id = map[name];
  if (!id) return;

  // referências aos intros (se existirem)
  const introMap = {
    accommodation: 'accommodationIntro',
    transport: 'transportIntro'
  };

  // mostra também os blocos de introdução se existirem
  const introId = introMap[name];
  let introEl = null;
  if (introId) {
    introEl = document.getElementById(introId);
    if (introEl) introEl.style.display = '';
  }

  // mostra a seção principal
  const el = document.getElementById(id);
  if (el) {
    el.style.display = '';

    // aguarda um pouco para garantir que o conteúdo esteja renderizado
    setTimeout(() => {
      // decide onde procurar o título: primeiro tenta o intro (se existir), senão a própria seção
      const searchRoot = introEl || el;
      // procura um título dentro do root (h1, h2 ou elemento com classe .section-title)
      const title = searchRoot.querySelector('h1, h2, .section-title');
      if (title) {
        // calcula posição para rolar suavemente até o título
        const yOffset = -120; // ajuste fino: altura da barra fixa (mude se necessário)
        const y = title.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else {
        // fallback: rola até o início da seção
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  }
}





/* "Prosseguir sem acomodação" e "Prosseguir sem transporte" */
document.addEventListener('DOMContentLoaded', function() {
  // skip accommodation
  const skipAccommodationBtn = document.getElementById('skipAccommodationBtn');
  if (skipAccommodationBtn) {
    skipAccommodationBtn.addEventListener('click', function() {
      addToCart({ title: 'Sem acomodação', type: 'Acomodação', price: 0, original: 0 });
      // marca visual (opcional)
      skipAccommodationBtn.textContent = 'Registrado ✓';
      showStage('transport');
    });
  }

  const skipTransportBtn = document.getElementById('skipTransportBtn');
  if (skipTransportBtn) {
    skipTransportBtn.addEventListener('click', function() {
      addToCart({ title: 'Sem transporte', type: 'Transporte', price: 0, original: 0 });
      skipTransportBtn.textContent = 'Registrado ✓';
      showStage('lead');
    });
  }

  // formulário lead submit -> salva lead e redireciona para cart.html
  const leadForm = document.getElementById('leadForm');
  if (leadForm) {
    leadForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const nome = document.getElementById('nome').value.trim();
      const whatsapp = document.getElementById('whatsapp').value.trim();
      const lead = { nome, whatsapp };
      localStorage.setItem('lw_lead', JSON.stringify(lead));
      // ir para página de revisão de carrinho
      window.location.href = 'cart.html';
    });
  }

  // startBtn deve revelar apenas cursos e esconder o restante (garantir fluxo)
  const startBtn = document.getElementById('startBtn');
  if (startBtn) {
    startBtn.addEventListener('click', function(e) {
      // mostrar apenas coursesSection (já visível por padrão)
      // esconder outros
      ['accommodationSection','transportSection','leadSection','accommodationIntro','transportIntro'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
      // rolar para cursos
      setTimeout(()=> {
        document.getElementById('coursesSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    });
  }

  // ativar load more para cada seção
  initLoadMore();
  updateCartCount(); // atualiza badge ao carregar
});

/* ========== Carregar mais (2 por clique) ========== */
function initLoadMore() {
  /* ======== CURSOS ======== */
  const extraCourses = Array.from(document.querySelectorAll('.extra-course'));
  const loadMoreCoursesBtn = document.getElementById('loadMoreCourses');
  let courseIndex = 0;

  // Garante que extras comecem ocultos ao carregar
  extraCourses.forEach(el => {
    el.style.display = 'none';
    el.classList.remove('added');
  });

  if (loadMoreCoursesBtn && extraCourses.length > 0) {
    loadMoreCoursesBtn.addEventListener('click', function () {
      console.log('loadMoreCourses clicked — current index:', courseIndex); // debug
      // Mostrar 2 cursos extras por clique
      const toShow = extraCourses.slice(courseIndex, courseIndex + 2);

      toShow.forEach(el => {
        // usa display compatível com layout (block funciona bem como grid item)
        el.style.display = 'block';
        // pequeno timeout para ativar animação CSS depois que o elemento já está visível
        setTimeout(() => el.classList.add('added'), 20);
      });

      courseIndex += toShow.length; // incrementa pela quantidade realmente mostrada

      // se não mostrou nada (por segurança), esconder o botão
      if (toShow.length === 0 || courseIndex >= extraCourses.length) {
        loadMoreCoursesBtn.style.display = 'none';
      }
    });
  } else {
    // se não houver extras, escondemos o botão
    if (loadMoreCoursesBtn) loadMoreCoursesBtn.style.display = 'none';
  }

  /* ======== ACOMODAÇÃO ======== */
  const extraAccom = Array.from(document.querySelectorAll('.extra-accom'));
  const loadMoreAccommodationBtn = document.getElementById('loadMoreAccommodation');
  let accomIndex = 0;

  extraAccom.forEach(el => {
    el.style.display = 'none';
    el.classList.remove('added');
  });

  if (loadMoreAccommodationBtn && extraAccom.length > 0) {
    loadMoreAccommodationBtn.addEventListener('click', function () {
      const toShow = extraAccom.slice(accomIndex, accomIndex + 2);
      toShow.forEach(el => {
        el.style.display = 'block';
        setTimeout(() => el.classList.add('added'), 20);
      });
      accomIndex += toShow.length;
      if (toShow.length === 0 || accomIndex >= extraAccom.length) loadMoreAccommodationBtn.style.display = 'none';
    });
  } else if (loadMoreAccommodationBtn) {
    loadMoreAccommodationBtn.style.display = 'none';
  }

  /* ======== TRANSPORTE ======== */
  const extraTransport = Array.from(document.querySelectorAll('.extra-transport'));
  const loadMoreTransportBtn = document.getElementById('loadMoreTransport');
  let transportIndex = 0;

  extraTransport.forEach(el => {
    el.style.display = 'none';
    el.classList.remove('added');
  });

  if (loadMoreTransportBtn && extraTransport.length > 0) {
    loadMoreTransportBtn.addEventListener('click', function () {
      const toShow = extraTransport.slice(transportIndex, transportIndex + 2);
      toShow.forEach(el => {
        el.style.display = 'block';
        setTimeout(() => el.classList.add('added'), 20);
      });
      transportIndex += toShow.length;
      if (toShow.length === 0 || transportIndex >= extraTransport.length) loadMoreTransportBtn.style.display = 'none';
    });
  } else if (loadMoreTransportBtn) {
    loadMoreTransportBtn.style.display = 'none';
  }
}



/* cria HTML strings para os extras (uso simples) */
function formatCurrency(num){
  return 'R$' + Number(num).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function buildCourseHTML(d){
  return `
  <div class="box course-item" data-title="${d.title}" data-type="${d.type}" data-price="${d.price}" data-original="${d.original}">
    <div class="image shine"><img src="${d.img}" alt="${d.title}" /></div>
    <div class="content">
      <a class="btn" onclick="openPopup('popup1')">Detalhes</a>
      <a class="btn btn-quero" onclick="selectItemFromElement(this)">Quero esse</a>
      <h3>${d.title}</h3>
      <p>${d.desc || ''}</p>
      <div class="price">
        <span class="old-price">${formatCurrency(d.original)}</span>
        <span class="new-price">${formatCurrency(d.price)}</span>
        <span class="discount">-${Math.round(((d.original-d.price)/d.original)*100)}%</span>
      </div>
    </div>
  </div>`;
}
function buildAccomHTML(d){
  return `
  <div class="box accom-item" data-title="${d.title}" data-type="${d.type}" data-price="${d.price}" data-original="${d.original}">
    <div class="image shine"><img src="${d.img}" alt="${d.title}" /></div>
    <div class="content">
      <a class="btn" onclick="openPopup('popup2')">Detalhes</a>
      <a class="btn btn-quero" onclick="selectItemFromElement(this)">Quero esse</a>
      <h3>${d.title}</h3>
      <p>Valor por semana</p>
      <div class="price">
        <span class="old-price">${formatCurrency(d.original)}</span>
        <span class="new-price">${formatCurrency(d.price)}</span>
        <span class="discount">-${Math.round(((d.original-d.price)/d.original)*100)}%</span>
      </div>
    </div>
  </div>`;
}
function buildTransportHTML(d){
  return `
  <div class="box transport-item" data-title="${d.title}" data-type="${d.type}" data-price="${d.price}" data-original="${d.original}">
    <div class="image shine"><img src="${d.img}" alt="${d.title}" /></div>
    <div class="content">
      <a class="btn" onclick="openPopup('popup3')">Saiba mais</a>
      <a class="btn btn-quero" onclick="selectItemFromElement(this)">Quero esse</a>
      <h3>${d.title}</h3>
      <p>Praticidade e conforto</p>
      <div class="price">
        <span class="old-price">${formatCurrency(d.original)}</span>
        <span class="new-price">${formatCurrency(d.price)}</span>
        <span class="discount">-${Math.round(((d.original-d.price)/d.original)*100)}%</span>
      </div>
    </div>
  </div>`;
}

/* reattach handlers (for safety) */
function reattachQueroHandlers(container) {
  // nada específico necessário porque usamos onclick inline, mas podemos também attachar aqui se necessário
}

/* inicia: ao carregar, esconder seções seguintes e só mostrar cursos */
(function initialSetup() {
  // hide accommodation / transport / lead initially (already set inline)
  updateCartCount();
})();

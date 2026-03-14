/* ==========================================================================
   LinguaWiser - Script Principal Otimizado e Corrigido
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
    initUI();
    initAppFlow();
    initCart();
});

/* --- 1. UI & MENU --- */
function initUI() {
    const navbar = document.querySelector('.header .navbar');
    const menuBtn = document.querySelector('#menu-btn');

    if (menuBtn && navbar) {
        menuBtn.addEventListener('click', () => {
            navbar.classList.toggle('active');
        });
    }

    // Swiper Slider
    if (typeof Swiper !== 'undefined' && document.querySelector('.review-slider')) {
        new Swiper(".review-slider", {
            spaceBetween: 20,
            centeredSlides: true,
            grabCursor: true,
            autoplay: { delay: 7500, disableOnInteraction: false },
            loop: true,
            breakpoints: { 
                0: { slidesPerView: 1 }, 
                768: { slidesPerView: 2 }, 
                991: { slidesPerView: 3 } 
            }
        });
    }
}

/* --- 2. POP-UPS (ESCOPO GLOBAL) --- */
window.openPopup = function (id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'flex';
};

window.closePopup = function (id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
};

window.changeImage = function (button, direction) {
    const gallery = button.closest('.popup-gallery');
    if (!gallery) return;
    const images = gallery.querySelectorAll('img');
    
    if (!images.length) return;

    let currentIndex = Array.from(images).findIndex(img => img.classList.contains('active'));
    if (currentIndex === -1) currentIndex = 0; // Fallback se não houver active

    images[currentIndex].classList.remove('active');
    currentIndex = (currentIndex + direction + images.length) % images.length;
    images[currentIndex].classList.add('active');
};


/* --- 3. FLUXO DO APP (MONTE SEU INTERCÂMBIO) --- */
const APP_STAGES = ['courses', 'accommodation', 'transport', 'lead'];

function initAppFlow() {
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', function (e) {
            e.preventDefault();
            // Limpa dados anteriores para um novo orçamento
            localStorage.removeItem('lw_cart_v1');
            localStorage.removeItem('lw_selected_school');
            updateCartCount();

            ['accommodationSection', 'transportSection', 'leadSection', 'accommodationIntro', 'transportIntro'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });
            showStage('courses');
        });
    }

    setupSkipButton('skipAccommodationBtn', 'Sem acomodação', 'Acomodação', 'transport');
    setupSkipButton('skipTransportBtn', 'Sem transporte', 'Transporte', 'lead');

    setupLoadMore('.extra-course', 'loadMoreCourses', false);
    setupLoadMore('.extra-accom', 'loadMoreAccommodation', true);
    setupLoadMore('.extra-trans', 'loadMoreTransport', true);

    const leadForm = document.getElementById('leadForm');
    if (leadForm) {
        leadForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const nome = document.getElementById('nome').value.trim();
            const whatsapp = document.getElementById('whatsapp').value.trim();
            
            localStorage.setItem('lw_lead', JSON.stringify({ nome, whatsapp }));
            window.location.href = 'cart.html';
        });
    }
}

function showStage(name) {
    const map = {
        courses: 'coursesSection',
        accommodation: 'accommodationSection',
        transport: 'transportSection',
        lead: 'leadSection'
    };
    const introMap = {
        courses: 'servicesIntro',
        accommodation: 'accommodationIntro',
        transport: 'transportIntro'
    };

    const sectionId = map[name];
    if (!sectionId) return;

    // Mostra Intro e Seção
    const introEl = document.getElementById(introMap[name]);
    if (introEl) introEl.style.display = 'block';

    const sectionEl = document.getElementById(sectionId);
    if (sectionEl) sectionEl.style.display = 'block';

    if (name === 'accommodation' || name === 'transport') {
        filterBoxesBySchool(sectionId);
    }

    // Scroll suave ajustado
    setTimeout(() => {
        const headerH = document.querySelector('.header')?.offsetHeight || 90;
        const targetEl = introEl && introEl.offsetParent !== null ? introEl : sectionEl;
        
        if (targetEl) {
            const y = targetEl.getBoundingClientRect().top + window.pageYOffset - headerH - 20;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }, 100);
}

function filterBoxesBySchool(sectionId) {
    const selectedSchool = localStorage.getItem('lw_selected_school');
    const section = document.getElementById(sectionId);
    if (!selectedSchool || !section) return;

    section.querySelectorAll('.box').forEach(box => {
        const school = box.getAttribute('data-school');
        // Se a box tem escola definida, filtra. Se não tem (ex: item geral), mostra.
        if (school && school !== selectedSchool) {
            box.style.display = 'none';
        } else {
            box.style.display = '';
        }
    });
}

function setupSkipButton(btnId, title, type, nextStage) {
    const btn = document.getElementById(btnId);
    if (btn) {
        btn.addEventListener('click', function () {
            addToCart({ title, type, price: 0, original: 0 });
            btn.textContent = 'Registrado ✓';
            showStage(nextStage);
        });
    }
}

function setupLoadMore(itemClass, btnId, filterBySchool) {
    const extraItems = Array.from(document.querySelectorAll(itemClass));
    const btn = document.getElementById(btnId);
    let index = 0;

    extraItems.forEach(el => { el.style.display = 'none'; el.classList.remove('added'); });

    if (btn && extraItems.length > 0) {
        btn.addEventListener('click', function () {
            let toShow = extraItems.slice(index, index + 2);
            let countDisplayed = 0;

            toShow.forEach(el => {
                const school = el.getAttribute('data-school');
                const selectedSchool = localStorage.getItem('lw_selected_school');
                
                if (filterBySchool && school && school !== selectedSchool) return;

                el.style.display = 'block';
                setTimeout(() => el.classList.add('added'), 20);
                countDisplayed++;
            });
            
            index += toShow.length;
            if (index >= extraItems.length) btn.style.display = 'none';
        });
    } else if (btn) {
        btn.style.display = 'none';
    }
}

/* --- 4. CARRINHO DE COMPRAS --- */
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

function updateCartCount() {
    const countEl = document.getElementById('cartCount');
    if (countEl) countEl.textContent = getCart().length;
}

window.selectItemFromElement = function(btnEl) {
    const box = btnEl.closest('.box');
    if (!box) return;

    const item = {
        title: box.getAttribute('data-title') || box.querySelector('h3')?.innerText || 'Item',
        type: box.getAttribute('data-type') || 'Produto',
        price: parseFloat(box.getAttribute('data-price') || '0'),
        original: parseFloat(box.getAttribute('data-original') || box.getAttribute('data-price') || '0')
    };
    
    addToCart(item);

    const stage = box.closest('.stage');
    if (stage && stage.getAttribute('id') === 'coursesSection') {
        const school = box.getAttribute('data-school');
        if (school) localStorage.setItem('lw_selected_school', school);
    }

    btnEl.textContent = 'Adicionado';
    btnEl.disabled = true;
    btnEl.style.opacity = '0.85';

    // Lógica para pular para o próximo estágio automaticamente
    if (stage) {
        const currentId = stage.getAttribute('id');
        let next = '';
        if (currentId === 'coursesSection') next = 'accommodation';
        else if (currentId === 'accommodationSection') next = 'transport';
        else if (currentId === 'transportSection') next = 'lead';

        if (next) showStage(next);
    }
};

function initCart() {
    updateCartCount();
}
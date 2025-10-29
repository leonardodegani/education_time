


let navbar = document.querySelector('.header .navbar');
let loginForm = document.querySelector('.login-form');

document.querySelector('#menu-btn').onclick = () => {
    navbar.classList.toggle('active');
    loginForm.classList.remove('active');
};

document.querySelector('#account-btn').onclick = () => {
    loginForm.classList.toggle('active');
    navbar.classList.remove('active');
};

window.onscroll = () => {
    navbar.classList.remove('active');
    loginForm.classList.remove('active');
};


document.addEventListener("DOMContentLoaded", function () {
    var swiper = new Swiper(".review-slider", {
      spaceBetween: 20,
      centeredSlides: true,
      grabCursor: true,
      autoplay: {
        delay: 7500,
        disableOnInteraction: false,
      },
      loop: true,
      breakpoints: {
        0: {
          slidesPerView: 1,
        },
        768: {
          slidesPerView: 2,
        },
        991: {
          slidesPerView: 3,
        },
      },
    });
  });

 
  function openPopup(id) {
    document.getElementById(id).style.display = 'flex';
  }
  
  function closePopup(id) {
    document.getElementById(id).style.display = 'none';
  }


  
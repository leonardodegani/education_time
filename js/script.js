let loginForm = document.querySelector('.login-form');

document.querySelector('#account-btn').onclick = () =>{
    loginForm.classList.toggle('active');
}

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

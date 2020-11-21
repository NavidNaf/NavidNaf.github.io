const menubar = document.querySelector('.fa-bars');
const nav = document.querySelector('.navigation');

menubar.addEventListener('click', () => {
    nav.classList.toggle("open")
});
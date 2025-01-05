document.querySelector('.scroll-down').addEventListener('click', function (event) {
    event.preventDefault();
    document.querySelector('#features').scrollIntoView({
        behavior: 'smooth'
    });
}); 
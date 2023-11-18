
function toggleModoOscuro() {
    const body = document.body;
    const modoOscuroButton = document.getElementById('modo-oscuro');
    

    body.classList.toggle('modo-oscuro');
    modoOscuroButton.classList.toggle('modo-oscuro-activo');


    const modoOscuroActivo = body.classList.contains('modo-oscuro');


    if (modoOscuroActivo) {
        modoOscuroButton.textContent = 'Modo Claro';
    } else {
        modoOscuroButton.textContent = 'Modo Oscuro';
    }

    localStorage.setItem('modoOscuro', modoOscuroActivo);
}


const modoOscuroButton = document.getElementById('modo-oscuro');
modoOscuroButton.addEventListener('click', toggleModoOscuro);


const modoOscuroGuardado = localStorage.getItem('modoOscuro');
if (modoOscuroGuardado === 'true') {
    toggleModoOscuro();
}

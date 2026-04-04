(function () {
    function getFavoritos() {
        return JSON.parse(localStorage.getItem('th_favoritos') || '[]');
    }

    function setFavoritos(favs) {
        localStorage.setItem('th_favoritos', JSON.stringify(favs));
    }

    function getEventoData(btn) {
        const card = btn.closest('.evento-card');
        const nome  = card.querySelector('.evento-nome')?.textContent?.trim() || '';
        const local = card.querySelector('.evento-local')?.textContent?.trim() || '';
        const data  = card.querySelector('.evento-data')?.textContent?.trim() || '';
        const imgEl = card.querySelector('.evento-img');
        const bg    = imgEl?.style?.background || imgEl?.style?.backgroundColor || '#d8d8d8';
        const link  = card.querySelector('.evento-btn')?.getAttribute('href') || 'ingresso.html';
        return { nome, local, data, bg, link };
    }

    function isFavorito(nome) {
        return getFavoritos().some(function (f) { return f.nome === nome; });
    }

    function toggleFavorito(btn) {
        var evento = getEventoData(btn);
        var favs   = getFavoritos();
        var idx    = favs.findIndex(function (f) { return f.nome === evento.nome; });
        if (idx === -1) {
            favs.push(evento);
            btn.classList.add('ativo');
        } else {
            favs.splice(idx, 1);
            btn.classList.remove('ativo');
        }
        setFavoritos(favs);
    }

    function initFavBtns() {
        document.querySelectorAll('.evento-fav').forEach(function (btn) {
            var evento = getEventoData(btn);
            if (isFavorito(evento.nome)) {
                btn.classList.add('ativo');
            }
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorito(this);
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFavBtns);
    } else {
        initFavBtns();
    }
})();

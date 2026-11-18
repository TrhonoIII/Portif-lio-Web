function openNav() {
    document.getElementById("sidebar").style.width = "300px";
    document.getElementById("conteudo-principal").style.marginLeft = "300px";
}

function closeNav() {
    document.getElementById("sidebar").style.width = "0";
    document.getElementById("conteudo-principal").style.marginLeft = "0";
}

// === JOGOS: abre o jogo numa janela dentro da página ===
// Cada jogo roda num iframe. Assim as variáveis e o teclado de um jogo não
// se misturam com os da página nem com os dos outros jogos. O iframe é
// criado ao abrir e apagado ao fechar, o que encerra o jogo e a música.
const janelaDoJogo = (function () {
    const modal = document.getElementById('modal-jogo');
    if (!modal) return null;

    const palco = document.getElementById('modal-jogo-palco');
    const titulo = document.getElementById('modal-jogo-titulo');
    const teclas = document.getElementById('modal-jogo-teclas');
    const linkAba = document.getElementById('modal-jogo-aba');
    const btnFechar = modal.querySelector('.fechar-modal-jogo');
    let quemAbriu = null;

    // item: um .carrossel-item com data-jogo, data-site, data-proporcao e data-title
    function abre(item) {
        quemAbriu = document.activeElement;

        titulo.textContent = item.dataset.title;
        const teclasDoItem = item.querySelector('.carrossel-teclas');
        teclas.innerHTML = teclasDoItem ? teclasDoItem.innerHTML : '';
        linkAba.href = item.dataset.site;
        palco.style.setProperty('--proporcao', item.dataset.proporcao);

        const iframe = document.createElement('iframe');
        iframe.title = item.dataset.title;
        iframe.setAttribute('allow', 'autoplay; fullscreen');
        iframe.setAttribute('allowfullscreen', '');
        iframe.src = item.dataset.jogo;
        palco.appendChild(iframe);

        modal.classList.add('aberto');
        document.body.style.overflow = 'hidden';   // a página de trás não rola

        // Com o foco no jogo, o teclado vai direto para ele. Foca já (o
        // evento load pode demorar: a Abelha cria imagens o tempo todo) e
        // de novo quando a página do jogo termina de carregar.
        focaJogo(iframe);
        iframe.addEventListener('load', () => focaJogo(iframe));
    }

    function focaJogo(iframe) {
        if (!iframe.isConnected) return;
        iframe.focus();
        try { iframe.contentWindow.focus(); } catch (e) { /* sem acesso: o clique resolve */ }
    }

    function fecha() {
        if (!modal.classList.contains('aberto')) return;
        palco.innerHTML = '';
        modal.classList.remove('aberto');
        document.body.style.overflow = '';
        if (quemAbriu && quemAbriu.focus) quemAbriu.focus({ preventScroll: true });
    }

    btnFechar.addEventListener('click', fecha);
    // clicar no fundo escuro fecha
    modal.addEventListener('click', event => {
        if (event.target === modal) fecha();
    });

    return { abre, fecha };
})();

// === MODAL DE PROJETOS: imagem, título e descrição ===
const janelaDoProjeto = (function () {
    const modal = document.getElementById("modal-projeto");
    if (!modal) return null;

    const modalImg = document.getElementById("modal-img");
    const modalTitulo = document.getElementById("modal-titulo");
    const modalDescricao = document.getElementById("modal-descricao");
    const btnFechar = modal.querySelector(".fechar-modal");

    function abre(item) {
        const img = item.querySelector('img');
        modalImg.src = img.src;
        modalImg.alt = img.alt;
        modalTitulo.textContent = item.dataset.title;
        modalDescricao.textContent = item.dataset.desc;
        modal.style.display = "block";
    }

    function fecha() {
        modal.style.display = "none";
    }

    // Fechar ao clicar no "X" ou fora do conteúdo (no fundo escuro)
    btnFechar.addEventListener('click', fecha);
    modal.addEventListener('click', event => {
        if (event.target === modal) fecha();
    });

    return { abre, fecha };
})();

// Esc fecha a janela que estiver aberta (dentro de um jogo, o Esc é do jogo)
document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (janelaDoJogo) janelaDoJogo.fecha();
    if (janelaDoProjeto) janelaDoProjeto.fecha();
});

// === CARROSSEL ===
(function () {
    const VISIBLE = 3;
    const items = document.querySelectorAll('.carrossel-item');
    const track = document.querySelector('.carrossel-track');
    const total = items.length;

    if (!track || total === 0) return;

    // Cada item é clicável e também abre com Enter ou Espaço pelo teclado
    items.forEach(item => {
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        const acao = item.dataset.jogo ? 'Jogar ' : 'Ver detalhes de ';
        item.setAttribute('aria-label', acao + item.dataset.title);
    });

    // Uma bolinha por item; clicar numa bolinha leva até aquele item
    const dotsBox = document.querySelector('.carrossel-dots');
    const dots = [];
    if (dotsBox) {
        dotsBox.innerHTML = '';
        for (let i = 0; i < total; i++) {
            const dot = document.createElement('span');
            dot.className = 'dot';
            dot.addEventListener('click', () => {
                const alvo = VISIBLE + i;
                // sem movimento não há transitionend: não trava o carrossel
                if (transitioning || alvo === current) return;
                transitioning = true;
                current = alvo;
                goTo(current, true);
            });
            dotsBox.appendChild(dot);
            dots.push(dot);
        }
    }

    // Clona itens no início e no fim para loop infinito. As cópias ficam
    // fora do Tab e dos leitores de tela, para não aparecerem repetidas.
    const clonesBefore = Array.from(items).slice(-VISIBLE).map(el => el.cloneNode(true));
    const clonesAfter  = Array.from(items).slice(0, VISIBLE).map(el => el.cloneNode(true));
    [...clonesBefore, ...clonesAfter].forEach(c => {
        c.setAttribute('aria-hidden', 'true');
        c.setAttribute('tabindex', '-1');
    });
    clonesBefore.forEach(c => track.insertBefore(c, track.firstChild));
    clonesAfter.forEach(c => track.appendChild(c));

    const allItems = track.querySelectorAll('.carrossel-item');
    const itemWidth = () => allItems[0].offsetWidth + parseInt(getComputedStyle(allItems[0]).marginRight || 0);

    let current = VISIBLE; // começa após os clones do início
    let transitioning = false;

    function goTo(index, animated) {
        track.style.transition = animated ? 'transform 0.45s cubic-bezier(0.4,0,0.2,1)' : 'none';
        track.style.transform = `translateX(-${index * itemWidth()}px)`;
    }

    // acende a bolinha do item que está na primeira posição visível
    function updateDots() {
        const realIndex = ((current - VISIBLE) % total + total) % total;
        dots.forEach((d, i) => d.classList.toggle('ativo', i === realIndex));
    }

    // Posição inicial sem animação
    goTo(current, false);
    updateDots();

    function step(dir) {
        if (transitioning) return;
        transitioning = true;
        current += dir;
        goTo(current, true);
    }

    track.addEventListener('transitionend', () => {
        if (current >= total + VISIBLE) {
            current = VISIBLE + (current - (total + VISIBLE));
            goTo(current, false);
        } else if (current < VISIBLE) {
            current = total + VISIBLE - (VISIBLE - current);
            goTo(current, false);
        }
        updateDots();
        transitioning = false;
    });

    document.querySelector('.carrossel-prev').addEventListener('click', () => step(-1));
    document.querySelector('.carrossel-next').addEventListener('click', () => step(1));

    // Recalcula ao redimensionar
    window.addEventListener('resize', () => goTo(current, false));

    // Clique num item (original ou cópia): jogo abre o jogo, projeto abre a descrição
    function abreItem(item) {
        if (item.dataset.jogo) {
            if (janelaDoJogo) janelaDoJogo.abre(item);
        } else if (janelaDoProjeto) {
            janelaDoProjeto.abre(item);
        }
    }

    track.addEventListener('click', event => {
        const item = event.target.closest('.carrossel-item');
        if (item) abreItem(item);
    });

    track.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        const item = event.target.closest('.carrossel-item');
        if (!item) return;
        event.preventDefault();
        abreItem(item);
    });

    // Ao chegar num item escondido com Tab, o navegador tentaria rolar a
    // área do carrossel sozinho e bagunçaria a posição. Em vez disso, o
    // carrossel anda até o item.
    const viewport = track.parentElement;
    viewport.addEventListener('scroll', () => { viewport.scrollLeft = 0; });
    track.addEventListener('focusin', event => {
        const item = event.target.closest('.carrossel-item');
        const indice = Array.prototype.indexOf.call(allItems, item);
        if (indice < 0 || (indice >= current && indice < current + VISIBLE)) return;
        if (transitioning) return;
        transitioning = true;
        current = indice;
        goTo(current, true);
    });
})();

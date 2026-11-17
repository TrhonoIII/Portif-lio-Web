function openNav() {
    document.getElementById("sidebar").style.width = "300px";
    document.getElementById("conteudo-principal").style.marginLeft = "300px";
}

function closeNav() {
    document.getElementById("sidebar").style.width = "0";
    document.getElementById("conteudo-principal").style.marginLeft = "0";
}

// === CARROSSEL ===
(function () {
    const VISIBLE = 3;
    const items = document.querySelectorAll('.carrossel-item');
    const track = document.querySelector('.carrossel-track');
    const total = items.length;

    if (!track || total === 0) return;

    // Uma bolinha por projeto; clicar numa bolinha leva até aquele projeto
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

    // Clona itens no início e no fim para loop infinito
    const clonesBefore = Array.from(items).slice(-VISIBLE).map(el => el.cloneNode(true));
    const clonesAfter  = Array.from(items).slice(0, VISIBLE).map(el => el.cloneNode(true));
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

    // acende a bolinha do projeto que está na primeira posição visível
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
        const realTotal = total + VISIBLE * 2;
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

    // === CONTROLE DO MODAL DE PROJETOS ===
(function () {
    const modal = document.getElementById("modal-projeto");
    const modalImg = document.getElementById("modal-img");
    const modalTitulo = document.getElementById("modal-titulo");
    const modalDescricao = document.getElementById("modal-descricao");
    const btnFechar = document.querySelector(".fechar-modal");

    // Precisamos de um pequeno delay para garantir que o carrossel já clonou os itens
    setTimeout(() => {
        const itensCarrossel = document.querySelectorAll('.carrossel-item');

        itensCarrossel.forEach(item => {
            item.addEventListener('click', function() {
                // Captura a imagem clicada dentro deste item
                const imgClicada = this.querySelector('img');
                
                // Pega os dados configurados no HTML
                const titulo = this.getAttribute('data-title');
                const descricao = this.getAttribute('data-desc');

                // Injeta os dados no Modal
                modalImg.src = imgClicada.src;
                modalTitulo.textContent = titulo;
                modalDescricao.textContent = descricao;

                // Mostra o Modal
                modal.style.display = "block";
            });
        });
    }, 100);

    // Fechar ao clicar no "X"
    btnFechar.onclick = function() {
        modal.style.display = "none";
    }

    // Fechar ao clicar fora do conteúdo do Modal (no fundo escuro)
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
})();
})();

// === JOGOS: abre o jogo numa janela dentro da página ===
// Cada jogo roda num iframe. Assim as variáveis e o teclado de um jogo não
// se misturam com os da página nem com os dos outros jogos. O iframe é
// criado ao abrir e apagado ao fechar, o que encerra o jogo e a música.
(function () {
    const modal = document.getElementById('modal-jogo');
    if (!modal) return;

    const palco = document.getElementById('modal-jogo-palco');
    const titulo = document.getElementById('modal-jogo-titulo');
    const teclas = document.getElementById('modal-jogo-teclas');
    const linkAba = document.getElementById('modal-jogo-aba');
    const btnFechar = modal.querySelector('.fechar-modal-jogo');
    let quemAbriu = null;

    function abre(cartao) {
        quemAbriu = document.activeElement;

        titulo.textContent = cartao.dataset.titulo;
        teclas.innerHTML = cartao.querySelector('.cartao-jogo-teclas').innerHTML;
        linkAba.href = cartao.dataset.site;
        palco.style.setProperty('--proporcao', cartao.dataset.proporcao);

        const iframe = document.createElement('iframe');
        iframe.title = cartao.dataset.titulo;
        iframe.setAttribute('allow', 'autoplay; fullscreen');
        iframe.setAttribute('allowfullscreen', '');
        iframe.src = cartao.dataset.src;
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

    document.querySelectorAll('.abre-jogo').forEach(botao => {
        botao.addEventListener('click', () => abre(botao.closest('.cartao-jogo')));
    });
    btnFechar.addEventListener('click', fecha);
    // clicar no fundo escuro fecha
    modal.addEventListener('click', event => {
        if (event.target === modal) fecha();
    });
    // Esc fecha quando o foco está na página (dentro do jogo, o Esc é do jogo)
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') fecha();
    });
})();

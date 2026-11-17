// --- 1. CONFIGURAÇÃO INICIAL E ACESSO AO DOM ---
var tela = document.querySelector('canvas');
var pincel = tela.getContext('2d');

// --- 2. OBJETOS E VARIÁVEIS DE ESTADO ---
var jogador1 = {
    px: 80,
    py: 260,
    tx: 30,
    ty: 200,
    dir: 0 
};

var jogador2 = {
    px: 1170, // Posicionado no lado direito
    py: 260,
    tx: 30,
    ty: 200,
    dir: 0
};

var bolinha = {
    px: 1280 / 2 - 15,
    py: 720 / 2 - 15,
    tx: 30,
    ty: 30,
    dir: 8,   // Direção no eixo X
    diry: 2   // Direção no eixo Y
};

var pts1 = 0;
var pts2 = 0;
var maxPontos = 3;

// Variáveis de controle de fluxo de telas
var estadoJogo = "INICIO"; // Pode ser "INICIO", "JOGANDO" ou "GAMEOVER"

 //CONTROLE DE EVENTOS DO TECLADO
document.addEventListener("keydown", function (e) {
    // Tecla W (Jogador 1 sobe)
    if (e.keyCode === 87) {
        jogador1.dir = -8;
    }
    // Tecla S (Jogador 1 desce)
    else if (e.keyCode === 83) {
        jogador1.dir = 8;
    }
    // Seta para Cima (Jogador 2 sobe)
    else if (e.keyCode === 38) {
        jogador2.dir = -8;
    }
    // Seta para Baixo (Jogador 2 desce)
    else if (e.keyCode === 40) {
        jogador2.dir = 8;
    }
    // Tecla Espaço (Inicia o jogo ou reinicia a partida)
    else if (e.keyCode === 32) {
        if (estadoJogo === "INICIO") {
            estadoJogo = "JOGANDO";
        } else if (estadoJogo === "GAMEOVER") {
            ReiniciarPartida();
        }
    }
});

document.addEventListener("keyup", function (e) {
    // Para o movimento quando as teclas são soltas
    if (e.keyCode === 87 || e.keyCode === 83) {
        jogador1.dir = 0;
    }
    if (e.keyCode === 38 || e.keyCode === 40) {
        jogador2.dir = 0;
    }
});

//  FUNÇÕES DE DESENHO 
function Desenha() {
    pincel.fillStyle = "#8b8b8b";
    
    // Desenha os jogadores e a bolinha
    pincel.fillRect(jogador1.px, jogador1.py, jogador1.tx, jogador1.ty);
    pincel.fillRect(jogador2.px, jogador2.py, jogador2.tx, jogador2.ty);
    pincel.fillRect(bolinha.px, bolinha.py, bolinha.tx, bolinha.ty);
    
    // Desenha a pontuação
    pincel.fillStyle = "#ffffff";
    pincel.font = "20px Arial";
    pincel.fillText("Score 1: " + pts1, 200, 50);
    pincel.fillText("Score 2: " + pts2, 1000, 50);
}

function TelaInicial() {
    pincel.fillStyle = "#ffffff";
    pincel.font = "60px Arial";
    pincel.fillText("PONG", 550, 300);
    pincel.font = "30px Arial";
    pincel.fillText("Pressione ESPAÇO para iniciar", 440, 400);
}

function DrawWin() {
    pincel.fillStyle = "#ffffff";
    pincel.font = "60px Arial";
    pincel.fillText("GAME OVER", 460, 300);
    
    pincel.font = "30px Arial";
    if (pts1 >= maxPontos) {
        pincel.fillText("Jogador 1 Venceu!", 520, 380);
        pincel.fillText("Jogador 2 Derrotado.", 500, 420);
    } else {
        pincel.fillText("Jogador 2 Venceu!", 520, 380);
        pincel.fillText("Jogador 1 Derrotado.", 500, 420);
    }
    
    pincel.font = "20px Arial";
    pincel.fillText("Score Final 1: " + pts1, 300, 500);
    pincel.fillText("Score Final 2: " + pts2, 850, 500);
    pincel.fillText("Pressione ESPAÇO para jogar novamente", 460, 600);
}

//  LÓGICA DE MOVIMENTAÇÃO E COLISÃO 
function Move_player1() {
    if (jogador1.py < 0) {
        jogador1.py = 0;
    } else if (jogador1.py > 520) {
        jogador1.py = 520;
    }
    jogador1.py += jogador1.dir;
}

function Move_player2() {
    if (jogador2.py < 0) {
        jogador2.py = 0;
    } else if (jogador2.py > 520) {
        jogador2.py = 520;
    }
    jogador2.py += jogador2.dir;
}

function Move_Ball() {
    bolinha.px += bolinha.dir;
    bolinha.py += bolinha.diry;

    // Colisão com teto e chão
    if (bolinha.py < 0) {
        bolinha.diry *= -1;
    } else if (bolinha.py > 690) {
        bolinha.diry *= -1;
    }

    // Ponto para o Jogador 2 (passou da esquerda)
    if (bolinha.px < -100) {
        bolinha.px = 625;
        bolinha.py = 345;
        bolinha.dir *= -1;
        pts2 += 1;
    }
    // Ponto para o Jogador 1 (passou da direita)
    else if (bolinha.px > 1380) {
        bolinha.px = 625;
        bolinha.py = 345;
        bolinha.dir *= -1;
        pts1 += 1;
    }
}

function Colision_ball() {
    // Colisão com Jogador 1
    if (bolinha.py + bolinha.ty >= jogador1.py && 
        bolinha.py <= jogador1.py + jogador1.ty && 
        bolinha.px <= jogador1.px + jogador1.tx && 
        bolinha.px + bolinha.tx >= jogador1.px) {
        bolinha.dir *= -1;
    }

    // Colisão com Jogador 2
    if (bolinha.py + bolinha.ty >= jogador2.py && 
        bolinha.py <= jogador2.py + jogador2.ty && 
        bolinha.px + bolinha.tx >= jogador2.px && 
        bolinha.px <= jogador2.px + jogador2.tx) {
        bolinha.dir *= -1;
    }
}

//  REGRAS DE PARTIDA
function GameOver() {
    if (pts1 >= maxPontos || pts2 >= maxPontos) {
        estadoJogo = "GAMEOVER";
    }
}

function ReiniciarPartida() {
    pts1 = 0;
    pts2 = 0;
    bolinha.px = 625;
    bolinha.py = 345;
    jogador1.py = 260;
    jogador2.py = 260;
    estadoJogo = "JOGANDO";
}

//  LOOP PRINCIPAL DO JOGO
function Main() {
    // Limpa o canvas a cada frame
    pincel.clearRect(0, 0, 1280, 720);

    if (estadoJogo === "INICIO") {
        TelaInicial();
    } else if (estadoJogo === "JOGANDO") {
        Desenha();
        Move_Ball();
        Colision_ball();
        Move_player1();
        Move_player2();
        GameOver();
    } else if (estadoJogo === "GAMEOVER") {
        DrawWin();
    }
}


setInterval(Main, 20);
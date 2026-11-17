var pincel = document.getElementById("canvas").getContext("2d");

var bg = new Bg(0, 0, 900, 720, "img/bg.png");
var bg2 = new Bg(0, -720, 900, 720, "img/bg.png");
var flor = new Flor(0, 0, 50, 50, "img/flower1.png");
var abelha = new Abelha(400, 600, 100, 100, "img/bee1.png");
var aranha = new Aranha(100, 100, 100, 100, "img/spider1.png");
var placar = new Text();

var telaStart = new Obj(0, 0, 900, 720, "img/start.png");
var telaGameOver = new Obj(0, 0, 900, 720, "img/gameover.png");
var telaWin = new Obj(0, 0, 900, 720, "img/youwin.png");

var somMenu = new AudioObj("audio/menuSound.mp3", 0.6);
var somFase = new AudioObj("audio/NFlSong.mp3", 0.4);
var somColeta = new AudioObj("audio/collect.mp3", 0.5);
var somColisao = new AudioObj("audio/collisionSound.mp3", 0.5);
var somGameOverVoz = new AudioObj("audio/gameOverVoice.mp3", 0.7);
var somGameOverBg = new AudioObj("audio/gameOverSong.mp3", 0.5);
var somWin = new AudioObj("audio/win.mp3", 0.6); 

var estadoJogo = "START";
var menuTocador = false;

var flores_coletadas = 0;
var meta_flores = 15;
var tempo_restante = 60;
var frame_counter = 0;

function resetGame() {
    abelha.lifes = 3;
    flores_coletadas = 0;
    tempo_restante = 60;
    frame_counter = 0;
    abelha.x = 400;
    abelha.y = 600;
    abelha.dir = 0;
    aranha.mudaPosicao();
    flor.mudaPosicao();
    
    somGameOverBg.stop();
    somGameOverVoz.stop();
    somWin.stop();
    somFase.stop();
}

window.addEventListener("click", function() {
    if (estadoJogo === "START" && !menuTocador) {
        somMenu.loop();
        menuTocador = true;
    }
});

document.addEventListener("keydown", function(event) {
    if (estadoJogo === "START") {
        if (!menuTocador && event.key !== "Enter") {
            somMenu.loop();
            menuTocador = true;
        }
        if (event.key === "Enter") {
            somMenu.stop();
            resetGame();
            somFase.loop();
            estadoJogo = "PLAYING";
        }
    } else if (estadoJogo === "PLAYING") {
        if (event.key === "d" || event.key === "ArrowRight") {
            abelha.dir = 5;
        }
        if (event.key === "a" || event.key === "ArrowLeft") {
            abelha.dir = -5;
        }
    } else if (estadoJogo === "GAMEOVER" || estadoJogo === "WIN") {
        if (event.key === "Enter") {
            resetGame();
            somMenu.loop();
            estadoJogo = "START";
        }
    }
});

document.addEventListener("keyup", function(event) {
    if (event.key === "d" || event.key === "ArrowRight" || event.key === "a" || event.key === "ArrowLeft") {
        abelha.dir = 0;
    }
});

function collides() {
    if (abelha.collide(aranha)) {
        aranha.mudaPosicao();
        abelha.lifes -= 1;
        somColisao.play();
    }
    
    if (abelha.collide(flor)) {
        flor.mudaPosicao();
        flores_coletadas += 1;
        somColeta.play();
    }
}

function gerenciarTempo() {
    if (estadoJogo === "PLAYING") {
        frame_counter++;
        if (frame_counter >= 100) {
            tempo_restante--;
            frame_counter = 0;
        }
    }
}

function gameover() {
    if (flores_coletadas >= meta_flores) {
        if (estadoJogo !== "WIN") {
            somFase.stop();
            somWin.play();
            estadoJogo = "WIN";
        }
    } else if (abelha.lifes <= 0 || tempo_restante <= 0) {
        if (estadoJogo !== "GAMEOVER") {
            somFase.stop();
            somGameOverVoz.play();
            somGameOverBg.play(); 
            estadoJogo = "GAMEOVER";
        }
    }
}

function update() {
    if (estadoJogo === "PLAYING") {
        bg.move(6, 720, 0);
        bg2.move(6, 0, -720);
        
        abelha.move();
        abelha.animation("bee");
        
        aranha.move();
        aranha.animation("spider");
        
        flor.move();
        
        gerenciarTempo();
        collides();
        gameover();
    }
}

function draw() {
    if (estadoJogo === "START") {
        telaStart.desenha();
    } else if (estadoJogo === "PLAYING") {
        bg.desenha();
        bg2.desenha();
        aranha.desenha();
        abelha.desenha();
        flor.desenha();
        
        placar.draw("Vidas: " + abelha.lifes, 20, 30);
        placar.draw("Flores: " + flores_coletadas + " / " + meta_flores, 20, 60);
        placar.draw("Tempo: " + tempo_restante + "s", 750, 30);
    } else if (estadoJogo === "GAMEOVER") {
        telaGameOver.desenha();
    } else if (estadoJogo === "WIN") {
        telaWin.desenha();
    }
}

function main() {
    pincel.clearRect(0, 0, 900, 720);
    update();
    draw();
}

setInterval(main, 10);
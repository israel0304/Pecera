let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let graph = document.getElementById("box");
let boton3 = document.getElementById("point");
let cajaPeces = document.getElementById("npeces");
let cajaTemperatura = document.getElementById("temp");
let textSaturacion = document.getElementById("sat");
let tempValSpan = document.getElementById("tempVal");
let npecesValSpan = document.getElementById("npecesVal");
let tpecesValSpan = document.getElementById("tpecesVal");
let btnReset = document.getElementById('reset');
let cajaSize = document.getElementById('tpeces');
let playBtn = document.getElementById('playTemp');
let tempInterval = null;
let isPlaying = false;

let image = new Image();
let imgPecera = new Image();
let imgPanel = new Image();
let imgBomba = new Image();
imgPanel.src = './img/panel_solar.png';
imgBomba.src = './img/bomba_agua.png';
let imgBombaIssue = new Image();
imgBombaIssue.src = './img/bomba_agua_issue.png';
let contenedorCanvas = document.getElementById('contenedorCanvas');

function redimensionarCanvas() {
    canvas.width = 1600;
    canvas.height = 800;
}
redimensionarCanvas();

window.addEventListener('resize', function () {
    redimensionarCanvas();
    sincronizarAlturaGrafica();
});

// event listeers
boton3.addEventListener('click', crearPunto);
cajaPeces.addEventListener('input', pecesDinamicos);
cajaTemperatura.addEventListener('input', tempDinamica);
cajaTemperatura.addEventListener('keydown', pressIntro);
cajaSize.addEventListener('input', pecesDinamicos);
btnReset.addEventListener('click', reiniciar);
playBtn.addEventListener('click', toggleTempPlay);



// clases

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        this.x = this.x + v.x;
        this.y = this.y + v.y;
    }

    res(v) {
        this.x = this.x - v.x;
        this.y = this.y - v.y;
    }

    mul(n) {
        this.x = this.x * n;
        this.y = this.y * n;
    }

    div(n) {
        this.x = this.x / n;
        this.y = this.y / n;
    }


    mag() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
    }
    norm() {
        let m = this.mag();
        if (m > 0) {
            this.div(m);
        }
    }
    limit(h) {
        if (this.mag() > h) {
            this.norm();
            this.mul(h);
        }
    }

    static add(v1, v2) {
        let v3 = new Vector(v1.x + v2.x, v1.y + v2.y);
        return v3;
    }

    static res(v1, v2) {
        let v3 = new Vector(v1.x - v2.x, v1.y - v2.y);
        return v3;
    }
}


class Pez {
    constructor(t) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.image = image;
        this.image.src = './img/pez-neon_todos.png';
        this.size = Number(t) + 7;
        this.dWidth = (canvas.width * this.size) / 100
        this.dHeight = this.dWidth / 2;
        this.sWidth = 540;
        this.sHeight = 290;
        this.sy = 0
        this.imageDirection = 'izquierda';
        this.vivir = true;
        this.salud = 'sano'
        // Area de nado
        this.paddingDer = canvas.width - ((canvas.width * 5) / 100) - this.dWidth;
        this.paddingIzq = (canvas.width * 5) / 100;
        this.paddingArr = (canvas.height * 11) / 100;
        this.paddingAba = canvas.height - ((canvas.height * 11) / 100) - this.dHeight;

        // Valores de nado 
        this.posicion = new Vector(this.validarPosicionX(), this.validarPosicionY());
        this.velocidad = new Vector(0, 0);
        this.velocidad.limit(0.4);
        this.aceleracion = new Vector(0.01, 0.01);
        this.dir = new Vector(signo() * Math.random() * canvas.width / 2, signo() * Math.random() * canvas.height / 2);

    }

    aparecer() {
        this.enfermar();
        // Dirección del pez
        if (this.aceleracion.x < 0) {
            this.imageDirection = 'izquierda';
        } else if (this.aceleracion.x > 0) {
            this.imageDirection = 'derecha';
        }

        // Direccion de imagen Pez
        // ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

        if (this.imageDirection === 'derecha' & this.vivir === true) {
            this.ctx.drawImage(this.image, 0, this.sy, this.sWidth, this.sHeight, this.posicion.x, this.posicion.y, this.dWidth, this.dHeight);
        } else if (this.imageDirection === 'derecha' & this.vivir === false) {
            this.ctx.drawImage(this.image, this.sWidth * 2, 0, this.sWidth, this.sHeight, this.posicion.x, this.posicion.y, this.dWidth, this.dHeight);
        }

        if (this.imageDirection === 'izquierda' & this.vivir === true) {
            this.ctx.drawImage(this.image, this.sWidth, this.sy, this.sWidth, this.sHeight, this.posicion.x, this.posicion.y, this.dWidth, this.dHeight);
        } else if (this.imageDirection === 'izquierda' & this.vivir === false) {
            this.ctx.drawImage(this.image, this.sWidth * 3, 0, this.sWidth, this.sHeight, this.posicion.x, this.posicion.y, this.dWidth, this.dHeight);
        }
    }


    nadar() {
        this.aceleracion = this.dir;
        this.velocidad.add(this.aceleracion);
        this.velocidad.limit(0.5);
        this.posicion.add(this.velocidad);
        this.chocar();
    }


    chocar() {

        if (this.posicion.x > this.paddingDer || this.posicion.x < this.paddingIzq) {
            this.velocidad.x = -this.velocidad.x;
            this.aceleracion.x = -this.aceleracion.x;
        }
        if (this.posicion.y > this.paddingAba || this.posicion.y < this.paddingArr) {
            this.velocidad.y = -this.velocidad.y;
            this.aceleracion.y = -this.aceleracion.y;
        }

    }

    enfermar() {
        if (this.salud === 'enfermo') {
            this.sy = 290
            this.dWidth = aleatorio((canvas.width * this.size) / 100, (canvas.width * this.size * (18 / 20)) / 100);
            this.dHeight = this.dWidth / 2;
        } else {
            this.sy = 0
            this.dWidth = (canvas.width * this.size) / 100
            this.dHeight = this.dWidth / 2;
        }
    }

    morir() {
        this.vivir = false;
        let pMuerto = new Vector(this.posicion.x, this.paddingArr);//cambia direccion de vector en posicion.y a -1
        this.dir = Vector.res(pMuerto, this.posicion);
        this.dir.norm();
        this.dir.mul(1);
        this.nadar();

    }

    validarPosicionX() {
        let valx = aleatorio(this.paddingIzq, this.paddingDer);
        return valx;
    }

    validarPosicionY() {
        let valy = aleatorio(this.paddingArr, this.paddingAba);
        return valy;
    }

}

class Burbuja {
    constructor() {
        this.canvas = canvas;
        this.radius = aleatorio((canvas.width * 0.3) / 100, (canvas.height * 2) / 100);
        // Area de burbujas
        this.paddingDer = canvas.width - ((canvas.width * 5) / 100) - this.radius;
        this.paddingIzq = (canvas.width * 5) / 100;
        this.paddingArr = (canvas.height * 12) / 100;
        this.paddingAba = canvas.height - ((canvas.height * 11) / 100) - this.radius;
        //Posición burbuja
        this.x = aleatorio(this.paddingIzq, this.paddingDer);
        this.y = aleatorio(this.paddingArr, this.paddingAba);
        this.speedX = aleatorio(-4, 4);
        this.speedY = aleatorio(1, 1);

    }
    reset = () => {
        if (this.y < this.paddingArr) {
            this.y = this.paddingAba;
            this.x = aleatorio(0, canvas.width);
        }
        if (this.x > this.paddingDer) {
            this.x = this.paddingIzq;
        }
        if (this.x < this.paddingIzq) {
            this.x = this.paddingDer;
        }
    };
    move = () => {
        this.y -= this.speedY;
        this.speedX += 0.01;
        this.x += Math.cos(this.speedX);
    };
    draw = () => {
        this.move();
        this.reset();
        ctx.fillStyle = "#51d1f6";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(this.x - 2, this.y - 3, this.radius / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    };
}


class Pecera {
    constructor(temp) {
        this.image = imgPecera;
        this.image.src = './img/pecera.png';
        this.texto = textSaturacion
        this.ctx = ctx;
        this.temperatura = temp;
        this.saturacion = this.calSaturacion(this.temperatura);
    }

    aparecer() {
        this.saturacion = this.calSaturacion(this.temperatura);
        this.texto.innerHTML = this.saturacion;
        this.ctx.drawImage(this.image, 0, 0, canvas.width, canvas.height);
    }

    calSaturacion(t) {
        this.sat = -0.0001 * (Math.pow(t, 3)) + 0.01 * (Math.pow(t, 2)) - 0.39 * (t) + 14.57
        return parseFloat(this.sat.toFixed(2));
    }

}

class Grafica {
    constructor(id, pecera, paramJSX) {
        this.id = id
        this.place = document.getElementById(this.id);
        this.pecera = pecera;
        this.board = JXG.JSXGraph.initBoard(this.id, paramJSX);
    }

    graficarPunto() {
        this.pointColor = this.pecera.temperatura >= 22 & this.pecera.temperatura <= 28 ? '#5dc1b9' : '#fd7b7b';
        this.board.create(
            'point',
            [this.pecera.temperatura, this.pecera.saturacion],
            {
                name: '',
                strokecolor: this.pointColor,
                fillColor: this.pointColor,
                fixed: true
            }
        );
    }

}

///  Funciones
cajaPeces.value = 1;
cajaTemperatura.value = 23;
cajaSize.value = 1

tempValSpan.textContent = cajaTemperatura.value;
npecesValSpan.textContent = cajaPeces.value;
tpecesValSpan.textContent = cajaSize.value;


;
let pecera = new Pecera(cajaTemperatura.value);
let peces = generar(Pez, cajaPeces.value, cajaSize.value);
let burbujas = generar(Burbuja, validarBurbujasIniciales(cajaTemperatura.value));




function pecesDinamicos(e) {
    e.preventDefault();
    if (cajaPeces.value < 0) {
        alert('Los peces no pueden menores a 0');
        cajaPeces.value = 0;
    }
    if (cajaSize.value > 7) {
        alert('Los peces no pueden ser mayores a 7 cm');
        cajaSize.value = 7;
    }
    if (cajaSize.value < 0) {
        alert('Los peces no pueden ser menores a 0 cm');
        cajaSize.value = 0;
    }
    npecesValSpan.textContent = cajaPeces.value;
    tpecesValSpan.textContent = cajaSize.value;
    let nuevop = generar(Pez, cajaPeces.value, cajaSize.value);
    peces = nuevop;
}

function tempDinamica(e) {
    if (isPlaying && e && e.type === 'input' && e.isTrusted) {
        clearInterval(tempInterval);
        isPlaying = false;
        playBtn.textContent = '▶';
        playBtn.classList.remove('btn-danger');
        playBtn.classList.add('btn-success');
    }
    pecera.temperatura = cajaTemperatura.value;
    pecera.calSaturacion(pecera.temperatura);
    burbujasDinamicas();
    resucitarPez();
    tempValSpan.textContent = cajaTemperatura.value;
}

function burbujasDinamicas() {
    let nuevasBurbujas = Math.floor(pecera.saturacion);
    if (pecera.temperatura < 22) {
        burbujas = generar(Burbuja, nuevasBurbujas * 50);
    } else if (pecera.temperatura > 28) {
        burbujas = generar(Burbuja, nuevasBurbujas - 5);
    } else {
        burbujas = generar(Burbuja, nuevasBurbujas + 50)
    }
}

function validarBurbujasIniciales(b) {
    if (b < 22) {
        return Math.floor(pecera.saturacion) * 50
    } else if (b > 28) {
        return Math.floor(pecera.saturacion) - 5
    } else {
        return Math.floor(pecera.saturacion) + 50
    }
}

function resucitarPez() {
    for (let i = 0; i < peces.length; i++) {
        peces[i].vivir = true;
        peces[i].dir = new Vector(signo() * Math.random() * canvas.width / 2, signo() * Math.random() * canvas.height / 2);
    }
}

function generar(obj, n, param) {
    let p = [];
    for (i = 0; i < n; i++) {
        p[i] = new obj(param);
    }
    return p;
}

function aleatorio(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function signo() {
    let s = aleatorio(0, 2) == 0 ? -1 : 1;
    return s;
}

function alerta() {
    alert("¡Precaución!\nTodos Los peces van a morir");
    for (i = 0; i < peces.length; i++) {
        peces[i].vivir = false;
        peces[i].salud = 'sano';
    }
}
function enfermar() {
    if (peces[0].vivir === true)
        for (i = 0; i < peces.length; i++) {
            peces[i].salud = 'enfermo';
        } else {
        alert('Los peces ya estan muertos, ¡no pueden enfermar!');
    }

}

function actualizar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (escenarioActual === 1) {
        pecera.aparecer();

        for (i = 0; i < burbujas.length; i++) {
            burbujas[i].draw();
        }

        for (i = 0; i < peces.length; i++) {
            peces[i].aparecer();

            if (pecera.temperatura < 22) {
                peces[i].salud = 'enfermo';
                peces[i].nadar();
            } else {
                peces[i].salud = 'sano';
                peces[i].nadar();
            }

            if (pecera.temperatura > 28) {
                peces[i].nadar();
                peces[i].morir();
            } else {
                peces[i].nadar();
            }
        }
    } else {
        actualizarEscenario2();
    }

    requestAnimationFrame(actualizar);
}

requestAnimationFrame(actualizar);

function reiniciar() {
    clearInterval(tempInterval);
    isPlaying = false;
    window.location.reload();
}



function toggleTempPlay() {
    if (isPlaying) {
        clearInterval(tempInterval);
        isPlaying = false;
        playBtn.textContent = '▶';
        playBtn.classList.remove('btn-danger');
        playBtn.classList.add('btn-success');
    } else {
        isPlaying = true;
        playBtn.textContent = '⏸';
        playBtn.classList.remove('btn-success');
        playBtn.classList.add('btn-danger');
        tempInterval = setInterval(() => {
            if (cajaTemperatura.value >= 50) {
                toggleTempPlay();
                return;
            }
            cajaTemperatura.value = parseInt(cajaTemperatura.value) + 1;
            tempDinamica({ type: 'input' });
        }, 500);
    }
}



//////////JSXGraph

let grafica = new Grafica('box', pecera,
    {
        boundingbox: [-5, 40, 55, -5],
        axis: true,
        showCopyright: false,
    }
);

function crearGrafica() {
    var checkbox = grafica.board.create('checkbox', [40, 35, 'Mostrar gráfico'], { fixed: true })
    grafica.board.create('functiongraph', [
        function (x) {
            if (checkbox.Value()) {
                return -0.0001 * (Math.pow(x, 3)) + 0.01 * (Math.pow(x, 2)) - 0.39 * (x) + 14.57
            }
        }
    ], { strokecolor: '#3673c5', strokeWidth: 2 });
}

function crearPunto() {
    grafica.graficarPunto();
}

function pressIntro(e) {
    if (e.keyCode === 13) {
        crearPunto();
    }
}
crearGrafica();
setTimeout(sincronizarAlturaGrafica, 100);

// ============================================
// ESCENARIO 2: Sistema Sustentable
// ============================================

let escenarioActual = 1;

// DOM refs
let voltSlider = document.getElementById('voltaje');
let voltVal = document.getElementById('voltVal');
let corrVal = document.getElementById('corrVal');
let potVal = document.getElementById('potVal');
let odVal = document.getElementById('odVal');
let btnPointOD = document.getElementById('point-od');
let btnResetEsc2 = document.getElementById('reset-esc2');
let esc1Btn = document.getElementById('esc1-btn');
let esc2Btn = document.getElementById('esc2-btn');
let esc1Controls = document.getElementById('esc1-controls');
let esc2Controls = document.getElementById('esc2-controls');
let box = document.getElementById('box');
let box2 = document.getElementById('box2');
let contenedorGrafica = document.getElementById('contenedorGrafica');

let R = 5;

function getCorriente(V) {
    return V / R;
}

class ParticulaAgua {
    constructor(pumpX, pumpY, voltaje) {
        let factor = 0.3 + 0.7 * (voltaje / 50);
        this.radius = aleatorio(3, 6) * factor;
        this.x = pumpX + aleatorio(-15, 15);
        this.y = pumpY;
        this.speedY = aleatorio(1, 3) * factor;
        this.phase = Math.random() * Math.PI * 2;
    }

    move() {
        this.y -= this.speedY;
        this.phase += 0.03;
        this.x += Math.sin(this.phase) * 0.4;
    }

    draw() {
        ctx.fillStyle = 'rgba(81, 209, 246, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }

    get vivo() {
        return this.y > canvas.height * 0.5;
    }
}

// Escenario 2 state
let particulasEsc2 = [];
let pumpBroken = false;

function sincronizarAlturaGrafica() {
    if (contenedorGrafica.style.display !== 'none') {
        let h = contenedorCanvas.clientHeight;
        box.style.height = h + 'px';
        if (grafica && grafica.board) {
            grafica.board.resizeContainer(contenedorGrafica.clientWidth, h);
        }
    }
}

function cambiarEscenario(n) {
    escenarioActual = n;
    if (n === 1) {
        esc1Btn.className = 'btn btn-primary btn-sm';
        esc2Btn.className = 'btn btn-secondary btn-sm';
        esc1Controls.style.display = '';
        esc2Controls.style.display = 'none';
        contenedorCanvas.className = 'col-6';
        contenedorGrafica.style.display = '';
        box.style.display = '';
        sincronizarAlturaGrafica();
    } else {
        esc1Btn.className = 'btn btn-secondary btn-sm';
        esc2Btn.className = 'btn btn-primary btn-sm';
        esc1Controls.style.display = 'none';
        esc2Controls.style.display = '';
        contenedorCanvas.className = 'col-12';
        contenedorGrafica.style.display = 'none';
        pumpBroken = false;
        actualizarDisplayEsc2();
    }
}

function actualizarDisplayEsc2() {
    let V = Number(voltSlider.value);
    let I = getCorriente(V);
    voltVal.textContent = V;
    corrVal.textContent = I.toFixed(2);
}

function actualizarEscenario2() {
    let w = canvas.width;
    let h = canvas.height;
    let V = Number(voltSlider.value);
    let I = getCorriente(V);

    // Pump state tracking
    pumpBroken = (V >= 50);

    // Sky - darker when low V, brighter when high V
    let brightness = 0.3 + 0.7 * (V / 50);
    let skyR = Math.floor(135 * brightness);
    let skyG = Math.floor(206 * brightness);
    let skyB = Math.floor(235 * brightness);
    let skyColor = `rgb(${skyR}, ${skyG}, ${skyB})`;
    let skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.5);
    skyGrad.addColorStop(0, skyColor);
    skyGrad.addColorStop(1, `rgb(${Math.floor(184 * brightness)}, ${Math.floor(224 * brightness)}, ${Math.floor(247 * brightness)})`);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.5);

    // Sun - glow and size based on V
    let sunX = w * 0.12, sunY = h * 0.15;
    let sunR = w * 0.015 + (w * 0.02) * (V / 50);
    let glowR = sunR * (1.5 + 1.5 * (V / 50));
    let alpha = 0.15 + 0.35 * (V / 50);
    ctx.fillStyle = `rgba(255, 215, 0, ${alpha * 0.3})`;
    ctx.beginPath();
    ctx.arc(sunX, sunY, glowR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 243, 176, ${alpha * 0.5})`;
    ctx.beginPath();
    ctx.arc(sunX, sunY, glowR * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();
    
    // Ground / shore (right side)
    ctx.fillStyle = '#8B7355';
    ctx.beginPath();
    ctx.moveTo(w * 0.6, h * 0.5);
    ctx.lineTo(w, h * 0.5);
    ctx.lineTo(w, h);
    ctx.lineTo(w * 0.55, h);
    ctx.closePath();
    ctx.fill();

    // Pond water
    let waterGrad = ctx.createLinearGradient(0, h * 0.5, 0, h);
    waterGrad.addColorStop(0, '#4A90D9');
    waterGrad.addColorStop(0.5, '#3173B3');
    waterGrad.addColorStop(1, '#1A4D8C');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, h * 0.5, w * 0.6, h * 0.5);

    // Water surface
    ctx.strokeStyle = '#A0D4FF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < w * 0.6; x += 3) {
        ctx.lineTo(x, h * 0.5 + Math.sin(x * 0.02 + Date.now() * 0.001) * 3);
    }
    ctx.stroke();

   

    // Pump vars
    let pumpX = w * 0.50, pumpY = h * 0.72;
    let pumpW = w * 0.30, pumpH = pumpW * (311 / 803);

    // Solar panel image
    let px = w * 0.55, py = h * 0.23;
    let pw = w * 0.50, ph = pw * (302 / 827);
    if (imgPanel.complete && imgPanel.naturalWidth > 0) {
        ctx.drawImage(imgPanel, px, py, pw, ph);
    } else {
        ctx.fillStyle = '#2C3E50';
        ctx.fillRect(px, py, pw, ph);
    }
    // White info box below panel
    let fontScale = w / canvas.clientWidth;
    let isSmall = canvas.clientWidth < 600;
    let fs1 = Math.max((isSmall ? 13 : 18) * fontScale, isSmall ? 13 : 18);
    let fs2 = Math.max((isSmall ? 11 : 15) * fontScale, isSmall ? 11 : 15);
    let fs3 = Math.max((isSmall ? 12 : 16) * fontScale, isSmall ? 12 : 16);
    let lh1 = fs1 * 1.6;
    let lh2 = fs2 * 1.6;
    let lh3 = fs3 * 1.6;
    let padBox = fs1 * 0.8;
    let boxX = px + w * 0.08;
    let boxW = pw - w * 0.16;
    let boxY = py + ph + h * 0.02;
    let line1Y = boxY + padBox + lh1;
    let line2Y = line1Y + lh2;
    let line3Y = line2Y + lh3;
    let line4Y = line3Y + lh3;
    let boxH = line4Y + lh3 * 0.5 + padBox - boxY;

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 8);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#222';
    ctx.font = `bold ${Math.round(fs1)}px Arial`;
    ctx.fillText(`V = ${V} V  |  I = ${I.toFixed(2)} A`, px + pw / 2, line1Y);
    ctx.fillStyle = '#666';
    ctx.font = `${Math.round(fs2)}px Arial`;
    ctx.fillText(`R = ${R} Ω`, px + pw / 2, line2Y);
    let statusText, statusColor;
    if (I < 2) {
        statusText = 'Corriente baja - Baja oxigenacion';
        statusColor = '#E74C3C';
    } else if (I <= 8) {
        statusText = 'Rango optimo - Funcionando correctamente';
        statusColor = '#2ECC71';
    } else {
        statusText = 'Corriente alta - Sobrecalentamiento';
        statusColor = '#E67E22';
    }
    ctx.fillStyle = statusColor;
    ctx.font = `bold ${Math.round(fs3)}px Arial`;
    let statusParts = statusText.split(' - ');
    if (statusParts.length === 2) {
        ctx.fillText(statusParts[0], px + pw / 2, line3Y);
        ctx.fillText('-' + statusParts[1], px + pw / 2, line4Y);
    } else {
        ctx.fillText(statusText, px + pw / 2, line3Y);
    }

    // Wire from panel to pump
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 10;
    ctx.setLineDash([40, 10]);
    ctx.beginPath();
    ctx.moveTo(px + pw * 0.5, py + ph * 0.9);
    ctx.lineTo(pumpX+50, py + ph * 0.9);
    ctx.lineTo(pumpX+50, pumpY + pumpH * 0.4);
    ctx.stroke();
    ctx.setLineDash([]);

    // Red glow when overheated
    if (I > 8 && !pumpBroken) {
        ctx.save();
        let pulse = 0.45 + Math.sin(Date.now() * 0.004) * 0.2;
        let grad = ctx.createRadialGradient(pumpX, pumpY + pumpH * 0.5, 0, pumpX, pumpY + pumpH * 0.5, pumpW * 0.35);
        grad.addColorStop(0, `rgba(255, 0, 0, ${pulse})`);
        grad.addColorStop(0.5, `rgba(255, 0, 0, ${pulse * 0.6})`);
        grad.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pumpX, pumpY + pumpH * 0.5, pumpW * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Pump vibration (only when overheated and not broken)
    let vibX = 0, vibY = 0;
    if (I > 8 && !pumpBroken) {
        let t = Date.now() * 0.02;
        vibX = Math.sin(t * 1.3) * 3;
        vibY = Math.cos(t * 1.7) * 3;
    }

    // Pump image
    if (pumpBroken) {
        if (imgBombaIssue.complete && imgBombaIssue.naturalWidth > 0) {
            ctx.drawImage(imgBombaIssue, pumpX - pumpW / 2, pumpY, pumpW, pumpH);
        } else {
            ctx.fillStyle = '#555';
            ctx.fillRect(pumpX - pumpW / 2, pumpY, pumpW, pumpH);
        }
    } else if (imgBomba.complete && imgBomba.naturalWidth > 0) {
        ctx.drawImage(imgBomba, pumpX - pumpW / 2 + vibX, pumpY + vibY, pumpW, pumpH);
    } else {
        ctx.fillStyle = '#95A5A6';
        ctx.fillRect(pumpX - pumpW / 2 + vibX, pumpY + vibY, pumpW, pumpH);
    }

    // Bubbles (only if V > 0 and pump not broken)
    if (V > 0 && !pumpBroken) {
        let bubbleY = pumpY + pumpH * 0.3;
        particulasEsc2.push(new ParticulaAgua(pumpX, bubbleY, V));
        particulasEsc2.push(new ParticulaAgua(pumpX, bubbleY, V));
    }
    for (let i = particulasEsc2.length - 1; i >= 0; i--) {
        particulasEsc2[i].move();
        particulasEsc2[i].draw();
        if (!particulasEsc2[i].vivo) {
            particulasEsc2.splice(i, 1);
        }
    }

}

// Event listeners for escenario 2
esc1Btn.addEventListener('click', function () { cambiarEscenario(1); });
esc2Btn.addEventListener('click', function () { cambiarEscenario(2); });

voltSlider.addEventListener('input', function () {
    actualizarDisplayEsc2();
});

btnResetEsc2.addEventListener('click', function () {
    window.location.reload();
});
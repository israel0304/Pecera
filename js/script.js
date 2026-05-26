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
let escenarioActual = 2;
let box = document.getElementById('box');
let grafica = null;

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
    sincronizarAlturaGrafica5();
    sincronizarAlturaGrafica7();
});

// event listeers
boton3.addEventListener('click', crearPunto);
cajaPeces.addEventListener('input', pecesDinamicos);
cajaTemperatura.addEventListener('input', tempDinamica);
cajaTemperatura.addEventListener('keydown', pressIntro);
cajaSize.addEventListener('input', pecesDinamicos);
btnReset.addEventListener('click', function () {
    if (escenarioActual === 3) reiniciar3();
    else reiniciar();
});
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
        this.velMax = 0.5;

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
        this.velocidad.limit(this.velMax);
        this.posicion.add(this.velocidad);
        this.chocar();
    }


    chocar() {

        if (this.posicion.x > this.paddingDer) {
            this.velocidad.x = -this.velocidad.x;
            this.aceleracion.x = -this.aceleracion.x;
            this.posicion.x = this.paddingDer;
        }
        if (this.posicion.x < this.paddingIzq) {
            this.velocidad.x = -this.velocidad.x;
            this.aceleracion.x = -this.aceleracion.x;
            this.posicion.x = this.paddingIzq;
        }
        if (this.posicion.y > this.paddingAba) {
            this.velocidad.y = -this.velocidad.y;
            this.aceleracion.y = -this.aceleracion.y;
            this.posicion.y = this.paddingAba;
        }
        if (this.posicion.y < this.paddingArr) {
            this.velocidad.y = -this.velocidad.y;
            this.aceleracion.y = -this.aceleracion.y;
            this.posicion.y = this.paddingArr;
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
        this.puntos = [];
    }

    graficarPunto() {
        this.pointColor = this.pecera.temperatura >= 22 & this.pecera.temperatura <= 28 ? '#5dc1b9' : '#fd7b7b';
        let p = this.board.create(
            'point',
            [this.pecera.temperatura, this.pecera.saturacion],
            {
                name: '',
                strokecolor: this.pointColor,
                fillColor: this.pointColor,
                fixed: true
            }
        );
        let label = this.board.create('text',
            [
                function () { return p.X() + 0.3; },
                function () { return p.Y() + 1.5; },
                '(' + this.pecera.temperatura + ', ' + this.pecera.saturacion + ')'
            ],
            { visible: false, fontSize: 12, fixed: true, cssClass: '' }
        );
        let labelTimeout = null;
        p.on('over', function () {
            label.setAttribute({ visible: true });
            if (labelTimeout) { clearTimeout(labelTimeout); labelTimeout = null; }
        });
        p.on('out', function () {
            if (!labelTimeout) {
                label.setAttribute({ visible: false });
            }
        });
        p.on('down', function () {
            label.setAttribute({ visible: true });
            if (labelTimeout) clearTimeout(labelTimeout);
            labelTimeout = setTimeout(function () {
                label.setAttribute({ visible: false });
                labelTimeout = null;
            }, 2000);
        });
        this.puntos.push(p);
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
    if (escenarioActual === 3 && checkLA.checked) litrosDinamicos();
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
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(zoomScale, zoomScale);
    if (escenarioActual === 1 || escenarioActual === 3) {
        pecera.aparecer();
        for (i = 0; i < burbujas.length; i++) {
            burbujas[i].draw();
        }
        for (i = 0; i < peces.length; i++) {
            let pez = peces[i];
            pez.velMax = 0.5;
            if (cursorX !== null) {
                let dx = pez.posicion.x - cursorX;
                let dy = pez.posicion.y - cursorY;
                if (dx * dx + dy * dy < 40000) {
                    let away = new Vector(dx, dy);
                    away.norm();
                    away.mul(5);
                    pez.dir = away;
                    pez.velMax = 4;
                }
            }
            pez.aparecer();
            if (pecera.temperatura < 22) {
                pez.salud = 'enfermo';
                pez.nadar();
            } else {
                pez.salud = 'sano';
                pez.nadar();
            }
            if (pecera.temperatura > 28) {
                pez.nadar();
                pez.morir();
            } else {
                pez.nadar();
            }
        }
    } else if (escenarioActual === 2 || escenarioActual === 4 || escenarioActual === 5) {
        actualizarEscenario2();
    }
    ctx.restore();

    if (escenarioActual === 6 && threeRenderer) {
        threeControls.update();
        animarOlas();
        animarPeces3D();
        threeRenderer.render(threeScene, threeCamera);
    }

    requestAnimationFrame(actualizar);
}

requestAnimationFrame(actualizar);

function reiniciar() {
    clearInterval(tempInterval);
    isPlaying = false;
    playBtn.textContent = '▶';
    playBtn.classList.remove('btn-danger');
    playBtn.classList.add('btn-success');

    cajaTemperatura.value = 23;
    tempValSpan.textContent = 23;
    pecera.temperatura = 23;
    pecera.calSaturacion(23);

    cajaPeces.value = 1;
    npecesValSpan.textContent = 1;

    cajaSize.value = 1;
    tpecesValSpan.textContent = 1;

    peces = generar(Pez, 1, 1);
    burbujas = generar(Burbuja, validarBurbujasIniciales(23));

    grafica.puntos.forEach(function (p) { grafica.board.removeObject(p); });
    grafica.puntos = [];
    restablecerZoom();
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

grafica = new Grafica('box', pecera,
    {
        boundingbox: [-5, 40, 55, -5],
        axis: true,
        showCopyright: false,
    }
);

function crearGrafica() {
    var checkbox = grafica.board.create('checkbox', [40, 35, 'Mostrar gráfico'], { fixed: true })
    grafica.curvaSO = grafica.board.create('functiongraph', [
        function (x) {
            if (checkbox.Value()) {
                return -0.0001 * (Math.pow(x, 3)) + 0.01 * (Math.pow(x, 2)) - 0.39 * (x) + 14.57
            }
        }
    ], { strokecolor: '#3673c5', strokeWidth: 2 });
    grafica.curvaLA = grafica.board.create('functiongraph', [
        function (x) {
            if (checkbox.Value()) {
                return Number(cajaSize.value) * 3 * x;
            }
        }
    ], { strokecolor: '#E67E22', strokeWidth: 2, visible: false });
    grafica.puntosLA = [];
}

function crearPunto() {
    grafica.graficarPunto();
}

function crearPuntoLA() {
    let cantidad = Number(cajaPeces.value);
    let tamano = Number(cajaSize.value);
    let LA = cantidad * tamano * 3;
    let p = grafica.board.create('point', [cantidad, LA], {
        name: '',
        strokecolor: '#E67E22',
        fillColor: '#E67E22',
        fixed: true,
        visible: false
    });
    let label = grafica.board.create('text',
        [
            function () { return p.X() + 0.3; },
            function () { return p.Y() + 1.5; },
            '(' + cantidad + ', ' + LA + ')'
        ],
        { visible: false, fontSize: 12, fixed: true, cssClass: '' }
    );
    let labelTimeout = null;
    p.on('over', function () {
        label.setAttribute({ visible: true });
        if (labelTimeout) { clearTimeout(labelTimeout); labelTimeout = null; }
    });
    p.on('out', function () {
        if (!labelTimeout) {
            label.setAttribute({ visible: false });
        }
    });
    p.on('down', function () {
        label.setAttribute({ visible: true });
        if (labelTimeout) clearTimeout(labelTimeout);
        labelTimeout = setTimeout(function () {
            label.setAttribute({ visible: false });
            labelTimeout = null;
        }, 2000);
    });
    grafica.puntosLA.push(p);
    if (checkLA.checked) p.setAttribute({ visible: true });
}

function checklitros_fn() {
    if (checkLA.checked) {
        dataLA.style.display = '';
        boton3.style.display = 'none';
        botonLA.style.display = '';
        botonLA.disabled = false;
        grafica.curvaSO.setAttribute({ visible: false });
        grafica.curvaLA.setAttribute({ visible: true });
        grafica.puntos.forEach(function (p) { p.setAttribute({ visible: false }); });
        grafica.puntosLA.forEach(function (p) { p.setAttribute({ visible: true }); });
        litrosDinamicos();
    } else {
        dataLA.style.display = 'none';
        boton3.style.display = '';
        botonLA.style.display = 'none';
        botonLA.disabled = true;
        grafica.curvaSO.setAttribute({ visible: true });
        grafica.curvaLA.setAttribute({ visible: false });
        grafica.puntos.forEach(function (p) { p.setAttribute({ visible: true }); });
        grafica.puntosLA.forEach(function (p) { p.setAttribute({ visible: false }); });
    }
}

function litrosDinamicos() {
    textoLA.textContent = Number(cajaPeces.value) * Number(cajaSize.value) * 3;
}

function reiniciar3() {
    clearInterval(tempInterval);
    isPlaying = false;
    playBtn.textContent = '▶';
    playBtn.classList.remove('btn-danger');
    playBtn.classList.add('btn-success');

    cajaTemperatura.value = 23;
    tempValSpan.textContent = 23;
    pecera.temperatura = 23;
    pecera.calSaturacion(23);

    cajaPeces.value = 1;
    npecesValSpan.textContent = 1;

    cajaSize.value = 1;
    tpecesValSpan.textContent = 1;

    peces = generar(Pez, 1, 1);
    burbujas = generar(Burbuja, validarBurbujasIniciales(23));

    grafica.puntos.forEach(function (p) { grafica.board.removeObject(p); });
    grafica.puntos = [];
    grafica.puntosLA.forEach(function (p) { grafica.board.removeObject(p); });
    grafica.puntosLA = [];

    if (checkLA.checked) checkLA.checked = false;
    dataLA.style.display = 'none';
    boton3.disabled = false;
    botonLA.disabled = true;
    if (grafica.curvaSO && grafica.curvaLA) {
        grafica.curvaSO.setAttribute({ visible: true });
        grafica.curvaLA.setAttribute({ visible: false });
    }
    grafica.puntos.forEach(function (p) { p.setAttribute({ visible: true }); });
    grafica.puntosLA.forEach(function (p) { p.setAttribute({ visible: false }); });
    restablecerZoom();
}

function pressIntro(e) {
    if (e.keyCode === 13) {
        if (escenarioActual === 3 && checkLA.checked) crearPuntoLA();
        else crearPunto();
    }
}
crearGrafica();
setTimeout(sincronizarAlturaGrafica, 100);

// ============================================
// ESCENARIO 2: Sistema Sustentable
// ============================================

// DOM refs
let voltSlider = document.getElementById('voltaje');
let voltVal = document.getElementById('voltVal');
let corrVal = document.getElementById('corrVal');
let potVal = document.getElementById('potVal');
let odVal = document.getElementById('odVal');
let btnPointOD = document.getElementById('point-od');
let btnResetEsc2 = document.getElementById('reset-esc2');
let esc1Btn = document.getElementById('esc1-btn');
let esc3Btn = document.getElementById('esc3-btn');
let esc4Btn = document.getElementById('esc4-btn');
let esc2Btn = document.getElementById('esc2-btn');
let esc1Controls = document.getElementById('esc1-controls');
let esc2Controls = document.getElementById('esc2-controls');
let checkLA = document.getElementById('checkLA');
let dataLA = document.getElementById('dataLA');
let textoLA = document.getElementById('LA');
let botonLA = document.getElementById('pointLA');
let laSection = document.getElementById('la-section');

let R = 5;

function getCorriente(V) {
    if (escenarioActual === 5) {
        let m = Number(mSlider.value);
        return m * V;
    }
    return V / R;
}

class ParticulaAgua {
    constructor(pumpX, pumpY, voltaje) {
        let factor = 0.3 + 0.7 * (voltaje / 12);
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
        return this.y > canvas.height * 0.55;
    }
}

// Escenario 2 state
let particulasEsc2 = [];
let pumpBroken = false;
let pecesEstanque = [];
let cursorX = null, cursorY = null;

// Escenario 4 state
let board4 = null;
let curve4 = null;
let glider4 = null;
let label4 = null;

let board5 = null;
let curve5 = null;
let glider5 = null;
let label5 = null;
let mSlider = document.getElementById('mSlider');
let mVal = document.getElementById('mVal');
let esc5Btn = document.getElementById('esc5-btn');
let esc7Btn = document.getElementById('esc7-btn');
let bandaAzul = null;
let bandaVerde = null;
let bandaAmarilla = null;
let bandaVerdeFuerte = null;
let bandaRoja = null;
let franjasUnlocked = false;

function sincronizarAlturaGrafica() {
    if (escenarioActual === 1 || escenarioActual === 3) {
        let h = contenedorCanvas.clientHeight;
        box.style.height = h + 'px';
        if (grafica && grafica.board) {
            grafica.board.resizeContainer(box.clientWidth, h);
        }
    }
}

function initBoard4() {
    if (board4) return;
    let box4 = document.getElementById('box4');
    board4 = JXG.JSXGraph.initBoard('box4', {
        boundingbox: [-2, 15, 15, -2],
        axis: false,
        showCopyright: false,
        showNavigation: true,
        zoom: { wheel: true, min: 0.5, max: 5 },
    });
    board4.create('axis', [[-5, 0], [55, 0]], {
        strokeColor: '#333',
        strokeWidth: 1,
        ticks: {
            majorHeight: 20,
            drawLabels: true,
            insertTicks: false,
            ticksDistance: 2,
            minorTicks: 0
        }
    });
    board4.create('axis', [[0, -2], [0, 20]], {
        strokeColor: '#333',
        strokeWidth: 1,
        ticks: {
            majorHeight: 20,
            drawLabels: true,
            insertTicks: false,
            ticksDistance: 2,
            minorTicks: 0
        }
    });
    board4.create('grid', [{
        ticksDistance: 2,
        drawLabels: false,
        minorTicks: 0,
        majorHeight: -1
    }]);
    curve4 = board4.create('functiongraph', [
        function (x) { return 0.3 * x; }
    ], { strokecolor: '#E74C3C', strokeWidth: 2 });
    let V = Number(voltSlider.value);
    glider4 = board4.create('glider', [V, 0.3 * V, curve4], {
        name: '',
        strokecolor: '#2ECC71',
        fillColor: '#2ECC71',
        size: 6
    });
    label4 = board4.create('text',
        [
            function () { return glider4.X() + 0.4; },
            function () { return glider4.Y() + 0.8; },
            function () { return 'U (' + glider4.X().toFixed(2) + ', ' + glider4.Y().toFixed(2) + ')'; }
        ],
        { visible: true, fontSize: 10, fixed: true }
    );
    glider4.on('drag', function () {
        let V = parseFloat(glider4.X().toFixed(2));
        voltSlider.value = V;
        actualizarDisplayEsc2();
    });
}

function sincronizarAlturaGrafica4() {
    if (escenarioActual === 4 && board4) {
        let h = contenedorCanvas.clientHeight;
        let box4 = document.getElementById('box4');
        box4.style.height = h + 'px';
        board4.resizeContainer(box4.clientWidth, h);
    }
}

function sincronizarAlturaGrafica5() {
    if (escenarioActual === 5 && board5) {
        let h = contenedorCanvas.clientHeight;
        let box5 = document.getElementById('box5');
        box5.style.height = h + 'px';
        board5.resizeContainer(box5.clientWidth, h);
    }
}

function getEsc7Factor(dim) {
    if (dim === 'ancho') return FIXED_LARGO * FIXED_ALTO / 1000;
    if (dim === 'alto') return FIXED_LARGO * FIXED_ANCHO / 1000;
    if (dim === 'largo') return FIXED_ANCHO * FIXED_ALTO / 1000;
    return 0;
}

function sincronizarAlturaGrafica7() {
    if (escenarioActual === 7 && board7) {
        let h = contenedorCanvas.clientHeight;
        let box7 = document.getElementById('box7');
        box7.style.height = h + 'px';
        board7.resizeContainer(box7.clientWidth, h);
    }
}

function initBoard7() {
    if (board7) return;
    board7 = JXG.JSXGraph.initBoard('box7', {
        boundingbox: [-2, 15, 15, -2],
        axis: false,
        showCopyright: false,
        showNavigation: true,
        zoom: { wheel: true, min: 0.5, max: 5 },
    });
    board7.create('axis', [[-5, 0], [55, 0]], {
        strokeColor: '#333',
        strokeWidth: 1,
        ticks: { majorHeight: 20, drawLabels: true, insertTicks: false, ticksDistance: 2, minorTicks: 0 }
    });
    board7.create('axis', [[0, -2], [0, 20]], {
        strokeColor: '#333',
        strokeWidth: 1,
        ticks: { majorHeight: 20, drawLabels: true, insertTicks: false, ticksDistance: 2, minorTicks: 0 }
    });


    // Reference line through (v1, c1) and (v2, c2)
    ref7Pt1 = board7.create('point', [0, 0], { fixed: true, visible: false });
    ref7Pt2 = board7.create('point', [1, 0.3], { fixed: true, visible: false });
    refLine7 = board7.create('line', [ref7Pt1, ref7Pt2], {
        strokeColor: '#888', strokeWidth: 2
    });

    // Points (both visible)
    p1_7 = board7.create('point', [0, 0], { fixed: true, visible: true, strokecolor: '#E74C3C', fillColor: '#E74C3C', size: 3, label: {visible: false} });
    p2_7 = board7.create('point', [0, 0], { fixed: true, visible: true, strokecolor: '#E74C3C', fillColor: '#E74C3C', size: 3, label: {visible: false} });
    p4_7 = board7.create('point', [0, 0], { fixed: true, visible: true, strokecolor: '#E74C3C', fillColor: '#E74C3C', size: 3, label: {visible: false} });

    // Horizontal segment from (v1, c1) to (v2, c1)
    segHoriz7 = board7.create('segment', [p1_7, p4_7], {
        strokeColor: '#2980B9', strokeWidth: 3
    });

    // Vertical segment from (v2, c1) to (v2, c2)
    vert7 = board7.create('segment', [p4_7, p2_7], {
        strokeColor: '#E74C3C', strokeWidth: 2.5
    });

    // Labels (hidden by default, shown on correct answer)
    labelDeltaVal = board7.create('text', [0, 0, ''], { visible: false, fontSize: 13, strokeColor: '#2980B9', highlight: false, fixed: true });
    labelDeltaCap = board7.create('text', [0, 0, ''], { visible: false, fontSize: 13, strokeColor: '#E74C3C', highlight: false, fixed: true });

    // Fish point + horizontal line (hidden by default)
    fishPoint7 = board7.create('point', [0, 0], {
        fixed: true, visible: false,
        strokecolor: '#FF8C00', fillColor: '#FF8C00', size: 4
    });
    fishLineH7p1 = board7.create('point', [0, 0], { fixed: true, visible: false });
    fishLineH7p2 = board7.create('point', [0, 0], { fixed: true, visible: false });
    fishLineH7 = board7.create('line', [fishLineH7p1, fishLineH7p2], {
        strokeColor: '#2980B9', strokeWidth: 1.5, dash: 1, visible: false
    });
}

function actualizarGraficaEsc7(v1, v2, c1, c2) {
    if (!board7) return;
    if (p1_7) p1_7.setPosition(JXG.COORDS_BY_USER, [v1, c1]);
    if (p2_7) p2_7.setPosition(JXG.COORDS_BY_USER, [v2, c2]);
    if (p4_7) p4_7.setPosition(JXG.COORDS_BY_USER, [v2, c1]);
    if (ref7Pt1) ref7Pt1.setPosition(JXG.COORDS_BY_USER, [v1, c1]);
    if (ref7Pt2) ref7Pt2.setPosition(JXG.COORDS_BY_USER, [v2, c2]);
    board7.update();
}

function actualizarEsc7() {
    let v1 = Number(esc7Val1.value);
    let v2 = Number(esc7Val2.value);
    let factor = getEsc7Factor(esc7DimActual);
    let c1 = v1 * factor;
    let c2 = v2 * factor;
    esc7Cap1.textContent = c1.toFixed(3);
    esc7Cap2.textContent = c2.toFixed(3);

    if (labelDeltaVal) labelDeltaVal.setAttribute({visible: false});
    if (labelDeltaCap) labelDeltaCap.setAttribute({visible: false});

    actualizarGraficaEsc7(v1, v2, c1, c2);

    if (fishPoint7 && fishPoint7.getAttribute && fishPoint7.getAttribute('visible')) {
        verificarFish7();
    }
}

function verificarFish7() {
    let on = esc7IncluirPeces.checked;
    document.getElementById('esc7FishSection').style.display = on ? '' : 'none';
    if (!on) {
        if (fishPoint7) fishPoint7.setAttribute({visible: false});
        if (fishLineH7) fishLineH7.setAttribute({visible: false});
        return;
    }
    let count = Number(esc7FishCount.value) || 0;
    let size = Number(esc7FishSize.value) || 0;
    let LA = count * size * 3;
    esc7FishLA.textContent = LA.toFixed(2);
    if (LA > 0 && fishPoint7) {
        let v1 = Number(esc7Val1.value) || 0;
        let v2 = Number(esc7Val2.value) || 0;
        if (v1 !== 0 && v2 !== 0 && v1 !== v2) {
            let factor = getEsc7Factor(esc7DimActual);
            let c1 = v1 * factor, c2 = v2 * factor;
            let pend = (c2 - c1) / (v2 - v1);
            let x = v1 + (LA - c1) / pend;
            fishPoint7.setPosition(JXG.COORDS_BY_USER, [x, LA]);
            fishPoint7.setAttribute({visible: true});
            fishPoint7.setLabel('(' + x.toFixed(3) + ', ' + LA.toFixed(3) + ')');
            if (fishLineH7p1 && fishLineH7p2 && fishLineH7) {
                fishLineH7p1.setPosition(JXG.COORDS_BY_USER, [0, LA]);
                fishLineH7p2.setPosition(JXG.COORDS_BY_USER, [15, LA]);
                fishLineH7.setAttribute({visible: true});
            }
            board7.update();
        }
    } else {
        if (fishPoint7) fishPoint7.setAttribute({visible: false});
        if (fishLineH7) fishLineH7.setAttribute({visible: false});
    }
}

function verificarEsc7(tipo) {
    let v1 = Number(esc7Val1.value);
    let v2 = Number(esc7Val2.value);
    let factor = getEsc7Factor(esc7DimActual);
    let c1 = v1 * factor;
    let c2 = v2 * factor;

    let realDeltaVal = v2 - v1;
    let realDeltaCap = c2 - c1;
    let userDeltaVal = Number(esc7DeltaVal.value);
    let userDeltaCap = Number(esc7DeltaCap.value);
    let tolerance = 0.01;

    let correctVal = !isNaN(userDeltaVal) && Math.abs(userDeltaVal - realDeltaVal) < tolerance;
    let correctCap = !isNaN(userDeltaCap) && Math.abs(userDeltaCap - realDeltaCap) < tolerance;

    if (tipo === 'val' && correctVal) {
        let dimLabel = esc7DimActual.charAt(0).toUpperCase() + esc7DimActual.slice(1);
        if (labelDeltaVal) {
            labelDeltaVal.setPosition(JXG.COORDS_BY_USER, [(v1 + v2) / 2, c1 - 0.8]);
            labelDeltaVal.setText('Δ ' + dimLabel + ' = ' + realDeltaVal.toFixed(3));
            labelDeltaVal.setAttribute({visible: true});
        }
        let modal = new bootstrap.Modal(document.getElementById('esc7CorrectoModal'));
        modal.show();
    }
    if (tipo === 'cap' && correctCap) {
        if (labelDeltaCap) {
            labelDeltaCap.setPosition(JXG.COORDS_BY_USER, [v2 + 0.2, (c1 + c2) / 2]);
            labelDeltaCap.setText('Δ Capacidad = ' + realDeltaCap.toFixed(3));
            labelDeltaCap.setAttribute({visible: true});
        }
        let modal = new bootstrap.Modal(document.getElementById('esc7CorrectoModal'));
        modal.show();
    }
}

function initBoard5() {
    if (board5) return;
    let box5 = document.getElementById('box5');
    board5 = JXG.JSXGraph.initBoard('box5', {
        boundingbox: [-2, 15, 15, -2],
        axis: false,
        showCopyright: false,
        showNavigation: true,
        zoom: { wheel: true, min: 0.5, max: 5 },
    });
    board5.create('axis', [[-5, 0], [55, 0]], {
        strokeColor: '#333',
        strokeWidth: 1,
        ticks: {
            majorHeight: 20,
            drawLabels: true,
            insertTicks: false,
            ticksDistance: 2,
            minorTicks: 0
        }
    });
    board5.create('axis', [[0, -2], [0, 20]], {
        strokeColor: '#333',
        strokeWidth: 1,
        ticks: {
            majorHeight: 20,
            drawLabels: true,
            insertTicks: false,
            ticksDistance: 2,
            minorTicks: 0
        }
    });
    board5.create('grid', [{
        ticksDistance: 2,
        drawLabels: false,
        minorTicks: 0,
        majorHeight: -1
    }]);
}

function crearBanda(x1, x2, color, opacity) {
    return board5.create('curve', [
        [x1, x2, x2, x1],
        [-20, -20, 20, 20]
    ], {
        fillColor: color, fillOpacity: opacity || 0.3,
        strokeColor: color, strokeWidth: 1,
        closedCurve: true, layer: 1
    });
}

function toggleFranjas(show) {
    if (!board5) return;
    if (bandaAzul) { board5.removeObject(bandaAzul); bandaAzul = null; }
    if (bandaVerde) { board5.removeObject(bandaVerde); bandaVerde = null; }
    if (bandaAmarilla) { board5.removeObject(bandaAmarilla); bandaAmarilla = null; }
    if (bandaVerdeFuerte) { board5.removeObject(bandaVerdeFuerte); bandaVerdeFuerte = null; }
    if (bandaRoja) { board5.removeObject(bandaRoja); bandaRoja = null; }
    if (show) {
        bandaAzul = crearBanda(2, 4, '#3498DB');
        bandaVerde = crearBanda(4, 6, '#2ECC71');
        bandaAmarilla = crearBanda(6, 8, '#F1C40F');
        bandaRoja = crearBanda(8, 10, '#E74C3C');
        bandaVerdeFuerte = board5.create('curve', [
            [-5, 55, 55, -5],
            [1, 1, 2, 2]
        ], {
            fillColor: '#27AE60', fillOpacity: 0.35,
            strokeColor: '#27AE60', strokeWidth: 1,
            closedCurve: true, layer: 1
        });
    }
    board5.update();
}

function recrearCurva5(m) {
    if (!board5) return;
    if (curve5) { board5.removeObject(curve5); curve5 = null; }
    if (glider5) { board5.removeObject(glider5); glider5 = null; }
    if (label5) { board5.removeObject(label5); label5 = null; }
    curve5 = board5.create('functiongraph', [
        function (x) { return m * x; }
    ], { strokecolor: '#E74C3C', strokeWidth: 2 });
    let V = Number(voltSlider.value);
    glider5 = board5.create('glider', [V, m * V, curve5], {
        name: '',
        strokecolor: '#2ECC71',
        fillColor: '#2ECC71',
        size: 6
    });
    label5 = board5.create('text',
        [
            function () { return glider5.X() + 0.4; },
            function () { return glider5.Y() + 0.8; },
            function () { return 'U (' + glider5.X().toFixed(2) + ', ' + glider5.Y().toFixed(2) + ')'; }
        ],
        { visible: true, fontSize: 10, fixed: true }
    );
    glider5.on('drag', function () {
        let V = parseFloat(glider5.X().toFixed(2));
        voltSlider.value = V;
        actualizarDisplayEsc2();
    });
    board5.update();
}

const ESCENARIOS = {
    1: {
        btn: { 'esc1-btn': 'primary', 'esc3-btn': 'secondary', 'esc2-btn': 'secondary', 'esc4-btn': 'secondary', 'esc5-btn': 'secondary', 'esc6-btn': 'secondary', 'esc7-btn': 'secondary' },
        mostrar: ['canvas', 'esc1-controls', 'box'],
        ocultar: ['esc2-controls', 'box4', 'box5', 'box7', 'esc7-controls', 'three-container', 'esc6-overlay', 'esc6-tabla-section', 'esc6-cap-dinamica-section', 'contenedorCollapses'],
        canvasClass: 'col-12 col-sm-6',
        graficaClass: 'col-12 col-sm-6 d-flex flex-column',
        codigo: 'litros',
        alEntrar: function () {
            laSection.style.display = 'none';
            if (checkLA.checked) checkLA.checked = false;
            dataLA.style.display = 'none';
            botonLA.disabled = true;
            boton3.disabled = false;
            if (grafica.curvaSO) grafica.curvaSO.setAttribute({ visible: true });
            if (grafica.curvaLA) grafica.curvaLA.setAttribute({ visible: false });
            grafica.puntosLA.forEach(function (p) { p.setAttribute({ visible: false }); });
            grafica.puntos.forEach(function (p) { p.setAttribute({ visible: true }); });
            sincronizarAlturaGrafica();
        }
    },
    2: {
        btn: { 'esc1-btn': 'secondary', 'esc3-btn': 'secondary', 'esc2-btn': 'primary', 'esc4-btn': 'secondary', 'esc5-btn': 'secondary', 'esc6-btn': 'secondary', 'esc7-btn': 'secondary' },
        mostrar: ['canvas', 'esc2-controls'],
        ocultar: ['esc1-controls', 'box', 'box4', 'box5', 'box7', 'esc7-controls', 'three-container', 'esc6-overlay', 'esc6-tabla-section', 'esc6-cap-dinamica-section', 'contenedorCollapses'],
        canvasClass: 'col-12 col-sm-6 offset-sm-0 col-lg-10 offset-lg-1',
        graficaClass: 'd-none',
        codigo: 'grafica',
        alEntrar: function () {
            laSection.style.display = 'none';
            if (checkLA.checked) checkLA.checked = false;
            dataLA.style.display = 'none';
            botonLA.disabled = true;
            boton3.disabled = false;
            pumpBroken = false;
            document.getElementById('esc5-m-section').style.display = 'none';
            actualizarDisplayEsc2();
            initPecesEstanque();
        }
    },
    3: {
        btn: { 'esc1-btn': 'secondary', 'esc3-btn': 'primary', 'esc2-btn': 'secondary', 'esc4-btn': 'secondary', 'esc5-btn': 'secondary', 'esc6-btn': 'secondary', 'esc7-btn': 'secondary' },
        mostrar: ['canvas', 'esc1-controls', 'box'],
        ocultar: ['esc2-controls', 'box4', 'box5', 'box7', 'esc7-controls', 'three-container', 'esc6-overlay', 'esc6-tabla-section', 'esc6-cap-dinamica-section', 'contenedorCollapses'],
        canvasClass: 'col-12 col-sm-6',
        graficaClass: 'col-12 col-sm-6 d-flex flex-column',
        codigo: 'capacidad',
        alEntrar: function () {
            laSection.style.display = '';
            if (checkLA.checked) checkLA.checked = false;
            dataLA.style.display = 'none';
            botonLA.disabled = true;
            boton3.disabled = false;
            if (grafica.curvaSO) grafica.curvaSO.setAttribute({ visible: true });
            if (grafica.curvaLA) grafica.curvaLA.setAttribute({ visible: false });
            grafica.puntosLA.forEach(function (p) { p.setAttribute({ visible: false }); });
            grafica.puntos.forEach(function (p) { p.setAttribute({ visible: true }); });
            sincronizarAlturaGrafica();
        }
    },
    4: {
        btn: { 'esc1-btn': 'secondary', 'esc3-btn': 'secondary', 'esc2-btn': 'secondary', 'esc4-btn': 'primary', 'esc5-btn': 'secondary', 'esc6-btn': 'secondary', 'esc7-btn': 'secondary' },
        mostrar: ['canvas', 'esc2-controls', 'box4'],
        ocultar: ['esc1-controls', 'box', 'box5', 'box7', 'esc7-controls', 'three-container', 'esc6-overlay', 'esc6-tabla-section', 'esc6-cap-dinamica-section', 'contenedorCollapses'],
        canvasClass: 'col-12 col-sm-6',
        graficaClass: 'col-12 col-sm-6 d-flex flex-column',
        codigo: 'pendiente',
        alEntrar: function () {
            laSection.style.display = 'none';
            if (checkLA.checked) checkLA.checked = false;
            dataLA.style.display = 'none';
            botonLA.disabled = true;
            boton3.disabled = false;
            pumpBroken = false;
            document.getElementById('esc5-m-section').style.display = 'none';
            initBoard4();
            let V = Number(voltSlider.value);
            if (glider4) {
                glider4.setPosition(JXG.COORDS_BY_USER, [V, 0.3 * V]);
                board4.update();
            }
            actualizarDisplayEsc2();
            initPecesEstanque();
            sincronizarAlturaGrafica4();
        }
    },
    5: {
        btn: { 'esc1-btn': 'secondary', 'esc3-btn': 'secondary', 'esc2-btn': 'secondary', 'esc4-btn': 'secondary', 'esc5-btn': 'primary', 'esc6-btn': 'secondary', 'esc7-btn': 'secondary' },
        mostrar: ['canvas', 'esc2-controls', 'box5'],
        ocultar: ['esc1-controls', 'box', 'box4', 'box7', 'esc7-controls', 'three-container', 'esc6-overlay', 'esc6-tabla-section', 'esc6-cap-dinamica-section', 'contenedorCollapses'],
        canvasClass: 'col-12 col-sm-6',
        graficaClass: 'col-12 col-sm-6 d-flex flex-column',
        codigo: 'incremento',
        alEntrar: function () {
            laSection.style.display = 'none';
            if (checkLA.checked) checkLA.checked = false;
            dataLA.style.display = 'none';
            botonLA.disabled = true;
            boton3.disabled = false;
            pumpBroken = false;
            document.getElementById('esc5-m-section').style.display = '';
            initBoard5();
            recrearCurva5(Number(mSlider.value));
            let V = Number(voltSlider.value);
            if (glider5) {
                glider5.setPosition(JXG.COORDS_BY_USER, [V, Number(mSlider.value) * V]);
                board5.update();
            }
            if (franjasUnlocked) {
                document.getElementById('checkFranjas').disabled = false;
            }
            if (document.getElementById('checkFranjas').checked) {
                toggleFranjas(true);
            }
            actualizarDisplayEsc2();
            initPecesEstanque();
            sincronizarAlturaGrafica5();
        }
    },
    6: {
        btn: { 'esc1-btn': 'secondary', 'esc3-btn': 'secondary', 'esc2-btn': 'secondary', 'esc4-btn': 'secondary', 'esc5-btn': 'secondary', 'esc6-btn': 'primary', 'esc7-btn': 'secondary' },
        mostrar: ['esc6-overlay', 'three-container', 'esc6-tabla-section', 'esc6-cap-dinamica-section', 'contenedorCollapses'],
        ocultar: ['esc1-controls', 'esc2-controls', 'canvas', 'box', 'box4', 'box5', 'box7', 'esc7-controls'],
        canvasClass: 'col-12 col-sm-6 col-md-7',
        graficaClass: 'd-none',
        codigo: 'estanque',
        alEntrar: function () {
            laSection.style.display = 'none';
            if (checkLA.checked) checkLA.checked = false;
            dataLA.style.display = 'none';
            botonLA.disabled = true;
            boton3.disabled = false;
            if (!threeRenderer) initEscena3D();
            threeContainer.style.height = Math.max(300, window.innerHeight * 0.55) + 'px';
            redimensionarThree();
            actualizarInfoEsc6();
            iniciarPeces3D();
            initTablaDimVar();
            initTablaCapDina();
        }
    },
    7: {
        btn: { 'esc1-btn': 'secondary', 'esc3-btn': 'secondary', 'esc2-btn': 'secondary', 'esc4-btn': 'secondary', 'esc5-btn': 'secondary', 'esc6-btn': 'secondary', 'esc7-btn': 'primary' },
        mostrar: ['esc7-controls', 'box7'],
        ocultar: ['esc1-controls', 'esc2-controls', 'box', 'box4', 'box5', 'three-container', 'esc6-overlay', 'esc6-tabla-section', 'esc6-cap-dinamica-section', 'contenedorCollapses', 'canvas'],
        canvasClass: 'col-12 col-sm-6',
        graficaClass: 'col-12 col-sm-6 d-flex flex-column',
        codigo: 'incremento',
        alEntrar: function () {
            laSection.style.display = 'none';
            if (checkLA.checked) checkLA.checked = false;
            dataLA.style.display = 'none';
            botonLA.disabled = true;
            boton3.disabled = false;
            initBoard7();
            actualizarEsc7();
            sincronizarAlturaGrafica7();
        }
    }
};

function limpiarGrafica() {
    if (!grafica || !grafica.board) return;
    grafica.puntos.forEach(function (p) { grafica.board.removeObject(p); });
    grafica.puntos = [];
    if (grafica.puntosLA) {
        grafica.puntosLA.forEach(function (p) { grafica.board.removeObject(p); });
        grafica.puntosLA = [];
    }
}

function cambiarEscenario(n) {
    limpiarGrafica();
    escenarioActual = n;
    let cfg = ESCENARIOS[n];
    if (!cfg) return;

    for (let [id, clase] of Object.entries(cfg.btn)) {
        document.getElementById(id).className = `btn btn-${clase} btn-sm`;
    }
    cfg.mostrar.forEach(id => document.getElementById(id).style.display = '');
    cfg.ocultar.forEach(id => document.getElementById(id).style.display = 'none');

    contenedorCanvas.className = cfg.canvasClass;
    contenedorGrafica.className = cfg.graficaClass;
    if (!cfg.graficaClass.includes('d-none')) {
        contenedorGrafica.style.display = 'flex';
    }

    // Cleanup esc6 Three.js
    if (n !== 6 && threeRenderer) {
        threeContainer.style.display = 'none';
        limpiarPeces3D();
    }

    document.getElementById('btnAtras').disabled = n === getOrden()[0];

    restablecerZoom();
    cfg.alEntrar();
}

function actualizarDisplayEsc2() {
    let V = Number(voltSlider.value);
    let I = getCorriente(V);
    voltVal.textContent = V.toFixed(2);
    corrVal.textContent = I.toFixed(2);
}

function initPecesEstanque() {
    pecesEstanque = [];
    let n = Math.floor(aleatorio(15, 25));
    for (let i = 0; i < n; i++) {
        let pez = new Pez(0);
        pez.size = 4;
        pez.dWidth = (canvas.width * pez.size) / 100;
        pez.dHeight = pez.dWidth / 2;
        pez.paddingIzq = canvas.width * 0.15 + 5;
        pez.paddingDer = canvas.width * 0.60 - pez.dWidth - 5;
        pez.paddingArr = canvas.height * 0.6 + 5;
        pez.paddingAba = canvas.height - pez.dHeight - 5;
        pez.posicion = new Vector(
            aleatorio(pez.paddingIzq, pez.paddingDer + pez.dWidth),
            aleatorio(pez.paddingArr, pez.paddingAba + pez.dHeight)
        );
        pecesEstanque.push(pez);
    }
}

function actualizarEscenario2() {
    let w = canvas.width;
    let h = canvas.height;
    let V = Number(voltSlider.value);
    let I = getCorriente(V);

    // Pump state tracking
    if (escenarioActual === 5) {
        pumpBroken = (V > 10 || I >= 4);
    } else {
        pumpBroken = (V > 10);
    }

    // Sky - darker when low V, brighter when high V
    let brightness = 0.3 + 0.7 * (V / 12);
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
    
    // Pond water
    let waterGrad = ctx.createLinearGradient(0, h * 0.40, 0, h);
    waterGrad.addColorStop(0, '#69d94a');
    waterGrad.addColorStop(0.5, '#31b338');
    waterGrad.addColorStop(1, '#358c1a');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, h * 0.40, w, h * 0.5);

    // Water surface
    ctx.strokeStyle = '#A0D4FF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = w * 0.15; x < w * 0.6; x += 3) {
        ctx.lineTo(x, h * 0.55 + Math.sin(x * 0.02 + Date.now() * 0.001) * 3);
    }
    ctx.stroke();

    ctx.beginPath();
    for (let x = w * 0.15; x < w * 0.6; x += 3) {
        ctx.lineTo(x, h * 0.6 + Math.sin(x * 0.02 + Date.now() * 0.001) * 3);
    }
    ctx.stroke();

    // Trapecio decorativo base
    ctx.fillStyle = '#655139';
    ctx.strokeStyle = 'rgba(184, 109, 97, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.17, h * 0.95);
    ctx.lineTo(w * 0.57, h * 0.95);
    ctx.lineTo(w * 0.60, h);
    ctx.lineTo(w * 0.15, h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Romboide pared izquierda
    ctx.fillStyle = '#655139';
    ctx.strokeStyle = '#655139';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.15, h * 0.5);
    ctx.lineTo(w * 0.17, h * 0.45);
    ctx.lineTo(w * 0.17, h*0.95);
    ctx.lineTo(w * 0.15, h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

     // Romboide pared derecha
    ctx.fillStyle = '#655139';
    ctx.strokeStyle = '#655139';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.6, h * 0.5);
    ctx.lineTo(w * 0.57, h * 0.45);
    ctx.lineTo(w * 0.57, h*0.95);
    ctx.lineTo(w * 0.6, h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

     // Pared trasera
    ctx.fillStyle = '#8B7355';
    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.17, h * 0.45);
    ctx.lineTo(w * 0.57, h * 0.45);
    ctx.lineTo(w * 0.57, h * 0.95);
    ctx.lineTo(w * 0.17, h * 0.95);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();


    // Agua frontal
    ctx.fillStyle = 'rgba(67, 144, 207, 0.6)';
    ctx.strokeStyle = 'rgba(160, 212, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.15, h * 0.6);
    ctx.lineTo(w * 0.60, h * 0.6);
    ctx.lineTo(w * 0.60, h);
    ctx.lineTo(w * 0.15, h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    //trapecio decorativo sobre el agua (reflejo)
  ctx.fillStyle = 'rgba(67, 144, 207, 0.8)';
    ctx.strokeStyle = 'rgba(160, 212, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.17, h * 0.55);
    ctx.lineTo(w * 0.57, h * 0.55);
    ctx.lineTo(w * 0.60, h* 0.6);
    ctx.lineTo(w * 0.15, h* 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Pump position (used by fish flee logic and pump drawing)
    let pumpX = w * 0.50, pumpY = h * 0.72;

    // Peces decorativos en el agua frontal
    for (let pez of pecesEstanque) {
        pez.velMax = 0.5;
        let fleeing = false;
        if (cursorX !== null) {
            let dx = pez.posicion.x - cursorX;
            let dy = pez.posicion.y - cursorY;
            if (dx * dx + dy * dy < 40000) {
                let away = new Vector(dx, dy);
                away.norm();
                away.mul(5);
                pez.dir = away;
                pez.velMax = 4;
                fleeing = true;
            }
        }
        if (!fleeing && (V > 6 || I > 2) && !pumpBroken) {
            let pumpPos = new Vector(pumpX, pumpY);
            let away = Vector.res(pez.posicion, pumpPos);
            away.norm();
            away.mul(3);
            pez.dir = away;
            fleeing = true;
        }
        if (!fleeing && Math.random() < 0.008) {
            pez.dir = new Vector(signo() * Math.random() * 3, signo() * Math.random() * 2);
            pez.dir.norm();
        }
        pez.nadar();
        pez.aparecer();
    }

    // Ground / shore (left side)
    ctx.fillStyle = '#8B7355';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.5);
    ctx.lineTo(w * 0.15, h * 0.5);
    ctx.lineTo(w * 0.15, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Ground / shore (right side)
    ctx.fillStyle = '#8B7355';
    ctx.beginPath();
    ctx.moveTo(w * 0.6, h * 0.5);
    ctx.lineTo(w, h * 0.5);
    ctx.lineTo(w, h);
    ctx.lineTo(w * 0.6, h);
    ctx.closePath();
    ctx.fill();

    // Pump vars
    let pumpW = w * 0.30, pumpH = pumpW * (311 / 803);

    // Solar panel image
    let px = w * 0.55, py = h * 0.13;
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
    let fs3 = Math.max((isSmall ? 12 : 16) * fontScale, isSmall ? 12 : 16);
    let lh1 = fs1 * 1;
    let lh3 = fs3 * 1.2;
    let padBox = fs1 * 0.8;
    let boxX = px + w * 0.08;
    let boxW = pw - w * 0.16;
    let boxY = py + ph + h * 0.02;
    let line1Y = boxY + padBox + lh1;
    let line3Y = line1Y + lh3 - 3;
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
    let statusText, statusColor;
    if (pumpBroken) {
        statusText = 'Corriente alta - Bomba descompuesta';
        statusColor = '#E74C3C';
    } else {
        let isOverheat, isOptimal;
        if (escenarioActual === 5) {
            isOverheat = (V > 6 || I > 2);
            isOptimal = (V >= 4 && V <= 6 && I >= 1 && I <= 2);
        } else {
            isOverheat = (V > 6);
            isOptimal = (V >= 4 && V <= 6);
        }
        if (isOverheat) {
            statusText = 'Corriente alta - Sobrecalentamiento';
            statusColor = '#E67E22';
        } else if (isOptimal) {
            statusText = 'Rango optimo - Funcionando bien';
            statusColor = '#2ECC71';
        } else {
            statusText = 'Corriente baja - Baja oxigenacion';
            statusColor = '#E74C3C';
        }
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
    let overheat = (escenarioActual === 5) ? (V > 6 || I > 2) : (V > 6);
    if (overheat && !pumpBroken) {
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
    if (overheat && !pumpBroken) {
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
        let oneBubble;
        if (escenarioActual === 5) {
            let isOptimal = (V >= 4 && V <= 6 && I >= 1 && I <= 2);
            oneBubble = !overheat && !isOptimal;
        } else {
            oneBubble = (V < 4);
        }
        if (oneBubble) {
            particulasEsc2.push(new ParticulaAgua(pumpX, bubbleY, V));
        } else {
            particulasEsc2.push(new ParticulaAgua(pumpX, bubbleY, V));
            particulasEsc2.push(new ParticulaAgua(pumpX, bubbleY, V));
        }
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
esc1Btn.addEventListener('click', function () { navegarA(1); });
esc3Btn.addEventListener('click', function () { navegarA(3); });
esc2Btn.addEventListener('click', function () { navegarA(2); });
esc4Btn.addEventListener('click', function () { navegarA(4); });
esc5Btn.addEventListener('click', function () { navegarA(5); });
esc7Btn.addEventListener('click', function () { navegarA(7); });
checkLA.addEventListener('change', checklitros_fn);
botonLA.addEventListener('click', crearPuntoLA);

voltSlider.addEventListener('input', function () {
    actualizarDisplayEsc2();
    if (escenarioActual === 4 && glider4) {
        let V = Number(voltSlider.value);
        glider4.setPosition(JXG.COORDS_BY_USER, [V, 0.3 * V]);
        board4.update();
    }
    if (escenarioActual === 5 && glider5) {
        let V = Number(voltSlider.value);
        let m = Number(mSlider.value);
        glider5.setPosition(JXG.COORDS_BY_USER, [V, m * V]);
        board5.update();
    }
});

btnResetEsc2.addEventListener('click', function () {
    voltSlider.value = 5;
    particulasEsc2 = [];
    pumpBroken = false;
    pecesEstanque = [];
    initPecesEstanque();
    actualizarDisplayEsc2();
    if (escenarioActual === 4 && glider4) {
        glider4.setPosition(JXG.COORDS_BY_USER, [5, 1.5]);
        board4.update();
    }
    if (escenarioActual === 5 && glider5) {
        mSlider.value = '0.3';
        mVal.textContent = '0.3';
        recrearCurva5(0.3);
        glider5.setPosition(JXG.COORDS_BY_USER, [5, 1.5]);
        board5.update();
    }
    restablecerZoom();
});

mSlider.addEventListener('input', function () {
    let m = Number(mSlider.value);
    mVal.textContent = m.toFixed(1);
    if (escenarioActual === 5) {
        actualizarDisplayEsc2();
        recrearCurva5(m);
        let V = Number(voltSlider.value);
        if (glider5) {
            glider5.setPosition(JXG.COORDS_BY_USER, [V, m * V]);
            board5.update();
        }
    }
});

document.getElementById('confirmarFranjasCode').addEventListener('click', function () {
    let code = document.getElementById('franjasModalInput').value.trim().toLowerCase();
    if (normalizarCodigo(code) === normalizarCodigo('franjas')) {
        franjasUnlocked = true;
        document.getElementById('checkFranjas').disabled = false;
        document.getElementById('checkFranjas').checked = true;
        document.getElementById('franjasModalError').style.display = 'none';
        document.getElementById('franjasModalInput').value = '';
        bootstrap.Modal.getInstance(document.getElementById('franjasCodeModal')).hide();
        toggleFranjas(true);
    } else {
        document.getElementById('franjasModalError').style.display = 'block';
    }
});
document.getElementById('franjasModalInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('confirmarFranjasCode').click();
});
document.getElementById('checkFranjas').addEventListener('click', function (e) {
    if (!franjasUnlocked) {
        e.preventDefault();
        document.getElementById('franjasModalError').style.display = 'none';
        document.getElementById('franjasModalInput').value = '';
        new bootstrap.Modal(document.getElementById('franjasCodeModal')).show();
    }
});

document.getElementById('checkFranjas').addEventListener('change', function () {
    toggleFranjas(this.checked);
});

function getOrden() {
    return [1, 3, 6, 2, 4, 5, 7];
}

function getSiguiente(n) {
    let o = getOrden();
    return o[(o.indexOf(n) + 1) % o.length];
}

function getAnterior(n) {
    let o = getOrden();
    return o[(o.indexOf(n) - 1 + o.length) % o.length];
}

function normalizarCodigo(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

let escenariosDesbloqueados = new Set();

function navegar(dir) {
    let cfg = ESCENARIOS[escenarioActual];
    if (!cfg) return;
    if (dir === -1 && escenarioActual === getOrden()[0]) return;
    let destino = dir === 1 ? getSiguiente(escenarioActual) : getAnterior(escenarioActual);

    if (escenariosDesbloqueados.has(destino)) {
        cambiarEscenario(destino);
        return;
    }

    let ant = getAnterior(destino);
    let cfgAnt = ESCENARIOS[ant];
    if (!cfgAnt || !cfgAnt.codigo) {
        cambiarEscenario(destino);
        return;
    }

    pendingDestino = destino;
    document.getElementById('codigoInput').value = '';
    document.getElementById('codigoError').style.display = 'none';
    new bootstrap.Modal(document.getElementById('codigoModal')).show();
}

async function obtenerCodigos() {
    let map = {};
    for (let [n, cfg] of Object.entries(ESCENARIOS)) {
        if (cfg.codigo) map[n + 'a' + getSiguiente(Number(n))] = cfg.codigo;
    }
    return map;
}

let pendingDestino = null;

function navegarA(destino) {
    if (escenariosDesbloqueados.has(destino)) {
        cambiarEscenario(destino);
        return;
    }

    let ant = getAnterior(destino);
    let cfgAnt = ESCENARIOS[ant];
    if (!cfgAnt || !cfgAnt.codigo) {
        cambiarEscenario(destino);
        return;
    }

    pendingDestino = destino;
    document.getElementById('codigoInput').value = '';
    document.getElementById('codigoError').style.display = 'none';
    new bootstrap.Modal(document.getElementById('codigoModal')).show();
}

document.getElementById('btnContinuar').addEventListener('click', function () { navegar(1); });
document.getElementById('btnAtras').addEventListener('click', function () { navegar(-1); });

document.getElementById('confirmarCodigo').addEventListener('click', async function () {
    let codigo = document.getElementById('codigoInput').value.trim();
    let codigos = await obtenerCodigos();
    let destino = pendingDestino !== null ? pendingDestino : getSiguiente(escenarioActual);
    let ant = getAnterior(destino);
    let dir = ant + 'a' + destino;
    if (normalizarCodigo(codigo) === normalizarCodigo(codigos[dir])) {
        escenariosDesbloqueados.add(destino);
        bootstrap.Modal.getInstance(document.getElementById('codigoModal')).hide();
        cambiarEscenario(destino);
        pendingDestino = null;
    } else {
        document.getElementById('codigoError').style.display = 'block';
    }
});

document.getElementById('codigoInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('confirmarCodigo').click();
});

document.getElementById('codigoInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('confirmarCodigo').click();
});

let zoomScale = 1, panX = 0, panY = 0;
const ZOOM_MIN = 0.3, ZOOM_MAX = 5;

function screenToBuffer(clientX, clientY) {
    let rect = canvas.getBoundingClientRect();
    let rawX = (clientX - rect.left) * (canvas.width / rect.width);
    let rawY = (clientY - rect.top) * (canvas.height / rect.height);
    return { x: (rawX - panX) / zoomScale, y: (rawY - panY) / zoomScale };
}

canvas.addEventListener('wheel', function (e) {
    e.preventDefault();
    let rect = canvas.getBoundingClientRect();
    let mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    let my = (e.clientY - rect.top) * (canvas.height / rect.height);
    let delta = -e.deltaY * 0.001;
    let newScale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoomScale * (1 + delta)));
    panX = mx - (mx - panX) * (newScale / zoomScale);
    panY = my - (my - panY) * (newScale / zoomScale);
    zoomScale = newScale;
});

function restablecerZoom() {
    zoomScale = 1;
    panX = 0;
    panY = 0;
    lastTouchDist = null;
    lastTouchMidX = lastTouchMidY = null;
    lastMouseX = lastMouseY = null;
    isMouseDown = false;
}

let lastTouchDist = null, lastTouchMidX = null, lastTouchMidY = null;
let isMouseDown = false, lastMouseX = null, lastMouseY = null;

canvas.addEventListener('mousedown', function (e) {
    if (e.button === 0) {
        isMouseDown = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    }
});
canvas.addEventListener('mouseup', function () {
    isMouseDown = false;
    lastMouseX = lastMouseY = null;
});
canvas.addEventListener('mousemove', function (e) {
    if (isMouseDown) {
        let rect = canvas.getBoundingClientRect();
        let scale = canvas.width / rect.width;
        let dx = (e.clientX - lastMouseX) * scale / zoomScale;
        let dy = (e.clientY - lastMouseY) * scale / zoomScale;
        panX += dx;
        panY += dy;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        cursorX = cursorY = null;
        return;
    }
    let p = screenToBuffer(e.clientX, e.clientY);
    cursorX = p.x; cursorY = p.y;
});
canvas.addEventListener('mouseenter', function (e) {
    let p = screenToBuffer(e.clientX, e.clientY);
    cursorX = p.x; cursorY = p.y;
});
canvas.addEventListener('mouseleave', function () {
    isMouseDown = false;
    lastMouseX = lastMouseY = null;
    cursorX = cursorY = null;
});
canvas.addEventListener('touchmove', function (e) {
    e.preventDefault();
    if (e.touches.length === 2) {
        let dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        let rect = canvas.getBoundingClientRect();
        let midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        let midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        let scale = canvas.width / rect.width;
        if (lastTouchMidX !== null && lastTouchMidY !== null) {
            panX += (midX - lastTouchMidX) * scale / zoomScale;
            panY += (midY - lastTouchMidY) * scale / zoomScale;
        }
        lastTouchMidX = midX;
        lastTouchMidY = midY;
        if (lastTouchDist !== null) {
            let newScale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoomScale * (dist / lastTouchDist)));
            let cx = (midX - rect.left) * scale;
            let cy = (midY - rect.top) * scale;
            panX = cx - (cx - panX) * (newScale / zoomScale);
            panY = cy - (cy - panY) * (newScale / zoomScale);
            zoomScale = newScale;
        }
        lastTouchDist = dist;
        return;
    }
    let p = screenToBuffer(e.touches[0].clientX, e.touches[0].clientY);
    cursorX = p.x; cursorY = p.y;
}, { passive: false });
canvas.addEventListener('touchstart', function (e) {
    if (e.touches.length === 2) {
        lastTouchDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        lastTouchMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        lastTouchMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        return;
    }
    let p = screenToBuffer(e.touches[0].clientX, e.touches[0].clientY);
    cursorX = p.x; cursorY = p.y;
}, { passive: true });
canvas.addEventListener('touchend', function () {
    lastTouchDist = null;
    lastTouchMidX = lastTouchMidY = null;
    cursorX = cursorY = null;
});

// ============================================
// ESCENARIO 6: Dimensiones 3D (Three.js)
// ============================================

let largoSlider = document.getElementById('largo');
let anchoSlider = document.getElementById('ancho');
let altoSlider = document.getElementById('alto');
let largoVal = document.getElementById('largoVal');
let anchoVal = document.getElementById('anchoVal');
let altoVal = document.getElementById('altoVal');
let capValInfo = document.getElementById('capValInfo');
let btnResetEsc6 = document.getElementById('reset-esc6');
let esc6Btn = document.getElementById('esc6-btn');

// Escenario 7 variables
const FIXED_LARGO = 19;
const FIXED_ANCHO = 18;
const FIXED_ALTO = 21;
let esc7DimActual = 'ancho';
let esc7Val1 = document.getElementById('esc7Val1');
let esc7Val2 = document.getElementById('esc7Val2');
let esc7Cap1 = document.getElementById('esc7Cap1');
let esc7Cap2 = document.getElementById('esc7Cap2');
let esc7DeltaVal = document.getElementById('esc7DeltaVal');
let esc7DeltaCap = document.getElementById('esc7DeltaCap');
let esc7BtnVal = document.getElementById('esc7BtnVal');
let esc7BtnCap = document.getElementById('esc7BtnCap');
let esc7BtnReset = document.getElementById('esc7BtnReset');
let esc7IncluirPeces = document.getElementById('esc7IncluirPeces');
let esc7FishCount = document.getElementById('esc7FishCount');
let esc7FishSize = document.getElementById('esc7FishSize');
let esc7FishLA = document.getElementById('esc7FishLA');
let board7 = null;
let p1_7 = null, p2_7 = null, p4_7 = null;
let ref7Pt1 = null, ref7Pt2 = null;
let segHoriz7 = null, vert7 = null, refLine7 = null;
let labelDeltaVal = null, labelDeltaCap = null;
let fishPoint7 = null, fishLineH7 = null, fishLineH7p1 = null, fishLineH7p2 = null;

function actualizarInfoEsc6() {
    let L = Number(largoSlider.value);
    let W = Number(anchoSlider.value);
    let H = Number(altoSlider.value);
    capValInfo.textContent = (L * W * H / 1000).toFixed(3) + ' L';
}

// Dimensión variable table
let dimTabActual = 'ancho';
let dimTabInputs = [];
let dimTabSpans = [];
let dimTabChecks = [];
let highlightGroups = [];

function initTablaDimVar() {
    let tbody = document.getElementById('tbodyDim');
    if (!tbody || dimTabInputs.length > 0) return;
    for (let i = 0; i < 2; i++) {
        agregarFilaDimVar();
    }
}

function agregarFilaDimVar() {
    let tbody = document.getElementById('tbodyDim');
    let tr = document.createElement('tr');
    let td0 = document.createElement('td');
    td0.className = 'text-center';
    let chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.className = 'form-check-input m-0';
    td0.appendChild(chk);
    let td1 = document.createElement('td');
    let inp = document.createElement('input');
    inp.type = 'number';
    inp.className = 'form-control form-control-sm';
    inp.placeholder = '';
    td1.appendChild(inp);
    let td2 = document.createElement('td');
    let span = document.createElement('span');
    span.className = 'cap-val';
    span.textContent = '—';
    td2.appendChild(span);
    let td3 = document.createElement('td');
    let btnDel = document.createElement('button');
    btnDel.className = 'btn btn-sm btn-outline-danger py-0 px-1';
    btnDel.textContent = '✕';
    btnDel.addEventListener('click', function () {
        let idx = dimTabInputs.indexOf(inp);
        if (idx > -1) { dimTabInputs.splice(idx, 1); dimTabSpans.splice(idx, 1); dimTabChecks.splice(idx, 1); }
        tr.remove();
        actualizarHighlights();
    });
    td3.appendChild(btnDel);
    tr.appendChild(td0);
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tbody.appendChild(tr);
    dimTabInputs.push(inp);
    dimTabSpans.push(span);
    dimTabChecks.push(chk);
    inp.addEventListener('input', function () {
        let val = Number(this.value);
        if (isNaN(val) || val <= 0) return;

        let slider, spanEl;
        if (dimTabActual === 'ancho') { slider = anchoSlider; spanEl = anchoVal; }
        else if (dimTabActual === 'alto') { slider = altoSlider; spanEl = altoVal; }
        else { slider = largoSlider; spanEl = largoVal; }

        let min = Number(slider.min), max = Number(slider.max);
        val = Math.max(min, Math.min(max, val));
        this.value = val;

        slider.value = val;
        spanEl.textContent = val;
        actualizarInfoEsc6();
        if (escenarioActual === 6) { construirTanque3D(); iniciarPeces3D(); }
        actualizarTablaDimVar();
        actualizarHighlights();
    });
    chk.addEventListener('change', function () {
        actualizarHighlights();
    });
}

document.getElementById('btnAddFila').addEventListener('click', function () {
    agregarFilaDimVar();
    actualizarTablaDimVar();
});

document.getElementById('btnAddFilaCapDina').addEventListener('click', function () {
    agregarFilaCapDina();
    actualizarTablaCapDina();
    actualizarHighlightsCapDina();
});

let capDinaTabs = document.querySelectorAll('#capDinaTabs .nav-link');
capDinaTabs.forEach(function (btn) {
    btn.addEventListener('click', function () {
        capDinaTabs.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        capDinaActual = this.getAttribute('data-tab');
        var name = capDinaActual.charAt(0).toUpperCase() + capDinaActual.slice(1);
        document.getElementById('thCDVal1').textContent = name + '\u2081';
        document.getElementById('thCDVal2').textContent = name + '\u2082';
        bloquearSlidersPorTab(capDinaActual);
        actualizarTablaCapDina();
        actualizarHighlightsCapDina();
    });
});

function actualizarTablaDimVar() {
    let L = Number(largoSlider.value);
    let W = Number(anchoSlider.value);
    let H = Number(altoSlider.value);
    let fixed = { ancho: L * H, alto: L * W, largo: W * H };
    let mult = fixed[dimTabActual] || 0;
    for (let i = 0; i < dimTabInputs.length; i++) {
        let val = Number(dimTabInputs[i].value);
        dimTabSpans[i].textContent = isNaN(val) || val <= 0 ? '—' : (val * mult / 1000).toFixed(3) + ' L';
    }
}

function bloquearSlidersPorTab(tab) {
    tab = tab || dimTabActual;
    if (tab !== 'largo') { largoSlider.value = Number(largoSlider.max); largoVal.textContent = largoSlider.max; largoSlider.disabled = true; }
    if (tab !== 'ancho') { anchoSlider.value = Number(anchoSlider.max); anchoVal.textContent = anchoSlider.max; anchoSlider.disabled = true; }
    if (tab !== 'alto') { altoSlider.value = Number(altoSlider.max); altoVal.textContent = altoSlider.max; altoSlider.disabled = true; }
    if (tab === 'largo') { largoSlider.disabled = false; }
    if (tab === 'ancho') { anchoSlider.disabled = false; }
    if (tab === 'alto') { altoSlider.disabled = false; }
    actualizarInfoEsc6();
    if (escenarioActual === 6) { construirTanque3D(); iniciarPeces3D(); }
}

document.addEventListener('DOMContentLoaded', function () {
    let tabs = document.querySelectorAll('#dimTabs .nav-link');
    tabs.forEach(function (btn) {
        btn.addEventListener('click', function () {
            tabs.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            dimTabActual = this.getAttribute('data-tab');
            document.getElementById('thCabecera').textContent = dimTabActual.charAt(0).toUpperCase() + dimTabActual.slice(1);
            bloquearSlidersPorTab();
            actualizarTablaDimVar();
            actualizarHighlights();
        });
    });

    let collapseEl = document.getElementById('esc6-tabla-collapse');
    collapseEl.addEventListener('shown.bs.collapse', function () {
        bloquearSlidersPorTab();
    });
    collapseEl.addEventListener('hidden.bs.collapse', function () {
        largoSlider.disabled = false;
        anchoSlider.disabled = false;
        altoSlider.disabled = false;
    });

    let collapseCapDinaEl = document.getElementById('esc6-cap-dinamica-collapse');
    collapseCapDinaEl.addEventListener('shown.bs.collapse', function () {
        bloquearSlidersPorTab(capDinaActual);
    });
    collapseCapDinaEl.addEventListener('hidden.bs.collapse', function () {
        largoSlider.disabled = false;
        anchoSlider.disabled = false;
        altoSlider.disabled = false;
    });
});

var HIGHLIGHT_COLORS = [0xffdd44, 0x44ddff, 0x44ff88, 0xff66aa, 0xcc88ff, 0xff8844];

function actualizarHighlights() {
    highlightGroups.forEach(function (g) { threeScene.remove(g); });
    highlightGroups = [];

    let L = getDimL(), W = getDimW(), H = getDimH();
    if (!L || !W || !H) return;

    for (let i = 0; i < dimTabChecks.length; i++) {
        if (!dimTabChecks[i].checked) continue;
        let val = Number(dimTabInputs[i].value);
        if (isNaN(val) || val <= 0) continue;

        let boxGeo, pos;
        if (dimTabActual === 'largo') {
            let w = Math.min(val, L);
            boxGeo = new THREE.BoxGeometry(w, H, W);
            pos = new THREE.Vector3(-L / 2 + w / 2, H / 2, 0);
        } else if (dimTabActual === 'ancho') {
            let w = Math.min(val, W);
            boxGeo = new THREE.BoxGeometry(L, H, w);
            pos = new THREE.Vector3(0, H / 2, -W / 2 + w / 2);
        } else {
            let h = Math.min(val, H);
            boxGeo = new THREE.BoxGeometry(L, h, W);
            pos = new THREE.Vector3(0, h / 2, 0);
        }

        let color = HIGHLIGHT_COLORS[i % HIGHLIGHT_COLORS.length];

        let mat = new THREE.MeshPhongMaterial({ color: color, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false });
        let mesh = new THREE.Mesh(boxGeo, mat);
        mesh.position.copy(pos);
        let edges = new THREE.LineSegments(new THREE.EdgesGeometry(boxGeo), new THREE.LineDashedMaterial({ color: color, dashSize: 0.3, gapSize: 0.2 }));
        edges.computeLineDistances();
        edges.position.copy(pos);

        let g = new THREE.Group();
        g.add(mesh);
        g.add(edges);
        threeScene.add(g);
        highlightGroups.push(g);
    }
}

var CAPDINA_COLORS = [[0x44aaff, 0xff6644], [0x66dd88, 0xcc44ff], [0xffcc44, 0x44ffcc], [0xff66aa, 0x66aaff]];
var capDinaHighlightGroups = [];

function actualizarHighlightsCapDina() {
    capDinaHighlightGroups.forEach(function (g) { threeScene.remove(g); });
    capDinaHighlightGroups = [];

    let L = getDimL(), W = getDimW(), H = getDimH();
    if (!L || !W || !H) return;

    for (let i = 0; i < capDinaVal1.length; i++) {
        if (!capDinaChecks[i].checked) continue;
        let v1 = Number(capDinaVal1[i].value);
        let v2 = Number(capDinaVal2[i].value);
        if (isNaN(v1) || v1 <= 0 || isNaN(v2) || v2 <= 0) continue;

        var cols = CAPDINA_COLORS[i % CAPDINA_COLORS.length];

        function makeHighlight(val, color) {
            var clamped = Math.min(val, (capDinaActual === 'largo') ? L : (capDinaActual === 'ancho') ? W : H);
            var boxGeo, pos;
            if (capDinaActual === 'largo') {
                boxGeo = new THREE.BoxGeometry(clamped, H, W);
                pos = new THREE.Vector3(-L / 2 + clamped / 2, H / 2, 0);
            } else if (capDinaActual === 'ancho') {
                boxGeo = new THREE.BoxGeometry(L, H, clamped);
                pos = new THREE.Vector3(0, H / 2, -W / 2 + clamped / 2);
            } else {
                boxGeo = new THREE.BoxGeometry(L, clamped, W);
                pos = new THREE.Vector3(0, clamped / 2, 0);
            }
            var mat = new THREE.MeshPhongMaterial({ color: color, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false });
            var mesh = new THREE.Mesh(boxGeo, mat);
            mesh.position.copy(pos);
            var edges = new THREE.LineSegments(new THREE.EdgesGeometry(boxGeo), new THREE.LineDashedMaterial({ color: color, dashSize: 0.3, gapSize: 0.2 }));
            edges.computeLineDistances();
            edges.position.copy(pos);
            var g = new THREE.Group();
            g.add(mesh);
            g.add(edges);
            threeScene.add(g);
            capDinaHighlightGroups.push(g);
        }

        makeHighlight(v1, cols[0]);
        makeHighlight(v2, cols[1]);
    }
}

// Capacidad Dinámica table
let capDinaActual = 'ancho';
let capDinaVal1 = [];
let capDinaVal2 = [];
let capDinaCap1 = [];
let capDinaCap2 = [];
let capDinaDiff = [];
let capDinaChecks = [];

function initTablaCapDina() {
    let tbody = document.getElementById('tbodyCapDina');
    if (!tbody || capDinaVal1.length > 0) return;
    for (let i = 0; i < 2; i++) {
        agregarFilaCapDina();
    }
}

function agregarFilaCapDina() {
    let tbody = document.getElementById('tbodyCapDina');
    let tr = document.createElement('tr');

    let td0 = document.createElement('td');
    td0.className = 'text-center';
    let chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.className = 'form-check-input m-0';
    td0.appendChild(chk);

    let tdVal1 = document.createElement('td');
    let inp1 = document.createElement('input');
    inp1.type = 'number';
    inp1.className = 'form-control form-control-sm';
    inp1.placeholder = '';
    tdVal1.appendChild(inp1);

    let tdVal2 = document.createElement('td');
    let inp2 = document.createElement('input');
    inp2.type = 'number';
    inp2.className = 'form-control form-control-sm';
    inp2.placeholder = '';
    tdVal2.appendChild(inp2);

    let tdCap1 = document.createElement('td');
    let span1 = document.createElement('span');
    span1.textContent = '—';
    tdCap1.appendChild(span1);

    let tdCap2 = document.createElement('td');
    let span2 = document.createElement('span');
    span2.textContent = '—';
    tdCap2.appendChild(span2);

    let tdDiff = document.createElement('td');
    let spanDiff = document.createElement('span');
    spanDiff.textContent = '—';
    tdDiff.appendChild(spanDiff);

    let tdDel = document.createElement('td');
    let btnDel = document.createElement('button');
    btnDel.className = 'btn btn-sm btn-outline-danger py-0 px-1';
    btnDel.textContent = '✕';
    btnDel.addEventListener('click', function () {
        let idx = capDinaVal1.indexOf(inp1);
        if (idx > -1) {
            capDinaVal1.splice(idx, 1);
            capDinaVal2.splice(idx, 1);
            capDinaCap1.splice(idx, 1);
            capDinaCap2.splice(idx, 1);
            capDinaDiff.splice(idx, 1);
            capDinaChecks.splice(idx, 1);
        }
        tr.remove();
        actualizarHighlightsCapDina();
    });
    tdDel.appendChild(btnDel);

    tr.appendChild(td0);
    tr.appendChild(tdVal1);
    tr.appendChild(tdVal2);
    tr.appendChild(tdCap1);
    tr.appendChild(tdCap2);
    tr.appendChild(tdDiff);
    tr.appendChild(tdDel);
    tbody.appendChild(tr);

    capDinaVal1.push(inp1);
    capDinaVal2.push(inp2);
    capDinaCap1.push(span1);
    capDinaCap2.push(span2);
    capDinaDiff.push(spanDiff);
    capDinaChecks.push(chk);

    function onInput() {
        let maxVal = 0;
        for (let j = 0; j < capDinaVal1.length; j++) {
            let a = Number(capDinaVal1[j].value);
            let b = Number(capDinaVal2[j].value);
            if (!isNaN(a) && a > maxVal) maxVal = a;
            if (!isNaN(b) && b > maxVal) maxVal = b;
        }
        if (maxVal > 0) {
            let slider, spanEl;
            if (capDinaActual === 'ancho') { slider = anchoSlider; spanEl = anchoVal; }
            else if (capDinaActual === 'alto') { slider = altoSlider; spanEl = altoVal; }
            else { slider = largoSlider; spanEl = largoVal; }
            let min = Number(slider.min), max = Number(slider.max);
            maxVal = Math.max(min, Math.min(max, maxVal));
            slider.value = maxVal;
            spanEl.textContent = maxVal;
            actualizarInfoEsc6();
            if (escenarioActual === 6) { construirTanque3D(); iniciarPeces3D(); }
        }
        actualizarTablaCapDina();
        actualizarHighlightsCapDina();
    }
    inp1.addEventListener('input', onInput);
    inp2.addEventListener('input', onInput);
    chk.addEventListener('change', function () {
        actualizarHighlightsCapDina();
    });
}

function actualizarTablaCapDina() {
    let L = Number(largoSlider.value);
    let W = Number(anchoSlider.value);
    let H = Number(altoSlider.value);
    let fixed = { ancho: L * H, alto: L * W, largo: W * H };
    let mult = fixed[capDinaActual] || 0;

    for (let i = 0; i < capDinaVal1.length; i++) {
        let v1 = Number(capDinaVal1[i].value);
        let v2 = Number(capDinaVal2[i].value);

        if (isNaN(v1) || v1 <= 0 || isNaN(v2) || v2 <= 0) {
            capDinaCap1[i].textContent = '—';
            capDinaCap2[i].textContent = '—';
            capDinaDiff[i].textContent = '—';
            continue;
        }

        let c1 = v1 * mult / 1000;
        let c2 = v2 * mult / 1000;
        capDinaCap1[i].textContent = c1.toFixed(3) + ' L';
        capDinaCap2[i].textContent = c2.toFixed(3) + ' L';

        let diff = c2 - c1;
        if (diff > 0.001) {
            capDinaDiff[i].textContent = 'Δ Cap₂ - Cap₁ = ' + diff.toFixed(3) + ' L';
        } else if (diff < -0.001) {
            capDinaDiff[i].textContent = '▼ Cap₁ - Cap₂ = ' + (-diff).toFixed(3) + ' L';
        } else {
            capDinaDiff[i].textContent = '—';
        }
    }
}

let threeRenderer = null;
let threeContainer = null;
let threeScene = null;
let threeCamera = null;
let threeControls = null;
let tankGroup = null;
let waterSurface = null;
let waterSurfaceGeo = null;
let peces3D = [];
let clock = new THREE.Clock();

function getDimL() { return Number(largoSlider.value) || 1; }
function getDimW() { return Number(anchoSlider.value) || 1; }
function getDimH() { return Number(altoSlider.value) || 1; }

function initEscena3D() {
    threeContainer = document.getElementById('three-container');
    if (!threeContainer) return;

    threeScene = new THREE.Scene();
    threeScene.background = new THREE.Color(0x87CEEB);

    let w = threeContainer.clientWidth || 600;
    let h = threeContainer.clientHeight || 400;
    threeCamera = new THREE.PerspectiveCamera(40, w / h, 0.1, 500);
    threeCamera.position.set(Math.max(getDimL(), getDimW(), getDimH()) * 1.8, getDimH() * 1.2, Math.max(getDimL(), getDimW(), getDimH()) * 1.8);

    threeRenderer = new THREE.WebGLRenderer({ antialias: true });
    threeRenderer.setSize(w, h);
    threeRenderer.setPixelRatio(window.devicePixelRatio);
    threeContainer.appendChild(threeRenderer.domElement);

    threeControls = new THREE.OrbitControls(threeCamera, threeRenderer.domElement);
    threeControls.enableDamping = true;
    threeControls.dampingFactor = 0.08;
    threeControls.target.set(0, getDimH() / 2, 0);

    let ambient = new THREE.AmbientLight(0x404060, 0.6);
    threeScene.add(ambient);
    let dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(20, 40, 20);
    threeScene.add(dirLight);
    let fillLight = new THREE.DirectionalLight(0x88aaff, 0.3);
    fillLight.position.set(-20, 10, -20);
    threeScene.add(fillLight);

    let groundGeo = new THREE.PlaneGeometry(80, 80);
    let groundMat = new THREE.MeshStandardMaterial({ color: 0xd4e8f0, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    let ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    threeScene.add(ground);

    construirTanque3D();
}

function crearTextSprite(text, color) {
    let canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 52px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 68);
    let tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    let mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    let sprite = new THREE.Sprite(mat);
    sprite.scale.set(5, 1.25, 1);
    return sprite;
}

function crearLineaCota(p1, p2, tickDir, color, texto) {
    let g = new THREE.Group();
    let mat = new THREE.LineBasicMaterial({ color });
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([p1, p2]), mat));
    let t = tickDir.clone().multiplyScalar(0.2);
    for (let p of [p1, p2]) {
        g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([p.clone().add(t), p.clone().sub(t)]), mat));
    }
    let mid = new THREE.Vector3().copy(p1).add(p2).multiplyScalar(0.5);
    let sprite = crearTextSprite(texto, color);
    sprite.position.copy(mid);
    sprite.position.y += 1.0;
    g.add(sprite);
    return g;
}

function construirTanque3D() {
    if (tankGroup) { threeScene.remove(tankGroup); tankGroup = null; }
    let L = Math.max(1, getDimL());
    let W = Math.max(1, getDimW());
    let H = Math.max(1, getDimH());
    tankGroup = new THREE.Group();

    let wallMat = new THREE.MeshPhongMaterial({ color: 0x88ccff, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false });
    let wallGeo = new THREE.BoxGeometry(L, H, W);
    let walls = new THREE.Mesh(wallGeo, wallMat);
    walls.position.y = H / 2;
    tankGroup.add(walls);

    let edgeMat = new THREE.LineBasicMaterial({ color: 0x4a90d9 });
    let edgeGeo = new THREE.EdgesGeometry(wallGeo);
    let edges = new THREE.LineSegments(edgeGeo, edgeMat);
    edges.position.y = H / 2;
    tankGroup.add(edges);

    let waterMat = new THREE.MeshPhongMaterial({ color: 0x88ccff, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false });
    let waterVol = new THREE.Mesh(new THREE.BoxGeometry(L * 0.96, H * 0.96, W * 0.96), waterMat);
    waterVol.position.y = H / 2;
    tankGroup.add(waterVol);

    let surfMat = new THREE.MeshPhongMaterial({ color: 0x3399ff, transparent: true, opacity: 0.85, side: THREE.DoubleSide, shininess: 30, specular: 0x4488cc });
    waterSurfaceGeo = new THREE.PlaneGeometry(L * 0.96, W * 0.96, 40, 40);
    waterSurfaceGeo.rotateX(-Math.PI / 2);
    waterSurface = new THREE.Mesh(waterSurfaceGeo, surfMat);
    waterSurface.position.y = H * 0.98;
    tankGroup.add(waterSurface);

    // Cotas
    let off = 0.6;
    tankGroup.add(crearLineaCota(
        new THREE.Vector3(-L / 2, 0, W / 2 + off),
        new THREE.Vector3(L / 2, 0, W / 2 + off),
        new THREE.Vector3(0, 0, 1), 0xff6666, 'Largo: ' + L
    ));
    tankGroup.add(crearLineaCota(
        new THREE.Vector3(L / 2 + off, 0, W / 2),
        new THREE.Vector3(L / 2 + off, 0, -W / 2),
        new THREE.Vector3(1, 0, 0), 0x66ff66, 'Ancho: ' + W
    ));
    tankGroup.add(crearLineaCota(
        new THREE.Vector3(L / 2 + off, 0, W / 2 + off),
        new THREE.Vector3(L / 2 + off, H, W / 2 + off),
        new THREE.Vector3(1, 0, 0), 0xffdd66, 'Alto: ' + H
    ));

    actualizarHighlights();
    actualizarHighlightsCapDina();

    threeScene.add(tankGroup);
    threeControls.target.set(0, H / 2, 0);
}

function iniciarPeces3D() {
    limpiarPeces3D();
    let L = Math.max(1, getDimL());
    let W = Math.max(1, getDimW());
    let H = Math.max(1, getDimH());
    let numPeces = Math.min(10, Math.max(3, Math.floor((L * W * H) / 50)));
    for (let i = 0; i < numPeces; i++) {
        peces3D.push(crearPez3D(L, W, H));
    }
}

function crearPez3D(L, W, H) {
    let group = new THREE.Group();

    // Body with vertex colors for two-tone neon pattern
    let bodyGeo = new THREE.SphereGeometry(0.5, 14, 10);
    bodyGeo.scale(1.8, 0.6, 0.7);

    let pos = bodyGeo.attributes.position;
    let cArr = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i);
        let zAbs = Math.abs(pos.getZ(i));
        if (y > 0.05 && y < 0.2 && zAbs > 0.08) {
            // Cyan stripe on upper flanks
            cArr[i * 3] = 0; cArr[i * 3 + 1] = 0.83; cArr[i * 3 + 2] = 1;
        } else if (y < -0.05 && zAbs > 0.08) {
            // Red belly
            cArr[i * 3] = 1; cArr[i * 3 + 1] = 0.27; cArr[i * 3 + 2] = 0.27;
        } else {
            // Dark body base
            cArr[i * 3] = 0.17; cArr[i * 3 + 1] = 0.24; cArr[i * 3 + 2] = 0.31;
        }
    }
    bodyGeo.setAttribute('color', new THREE.BufferAttribute(cArr, 3));

    let body = new THREE.Mesh(bodyGeo, new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 25 }));
    body.position.x = 0.3;
    group.add(body);

    // Tail (dark translucent)
    let tailShape = new THREE.Shape();
    tailShape.moveTo(0, 0); tailShape.lineTo(-0.5, -0.3); tailShape.lineTo(-0.5, 0.3); tailShape.closePath();
    let tail = new THREE.Mesh(new THREE.ShapeGeometry(tailShape), new THREE.MeshPhongMaterial({ color: 0x2C3E50, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
    tail.position.x = -0.7;
    group.add(tail);

    // Eyes (black)
    let eyeMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
    let eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), eyeMat);
    eye.position.set(0.9, 0.1, 0.3);
    group.add(eye);
    let eye2 = eye.clone();
    eye2.position.z = -0.3;
    group.add(eye2);

    let margin = 1;
    group.position.set(
        (Math.random() - 0.5) * (L - margin * 2),
        Math.random() * (H - margin * 2) + margin,
        (Math.random() - 0.5) * (W - margin * 2)
    );
    group.rotation.y = Math.random() * Math.PI * 2;

    threeScene.add(group);
    return {
        mesh: group,
        speed: 0.5 + Math.random() * 0.8,
        target: new THREE.Vector3(
            (Math.random() - 0.5) * (L - margin * 2),
            Math.random() * (H - margin * 2) + margin,
            (Math.random() - 0.5) * (W - margin * 2)
        ),
        phase: Math.random() * Math.PI * 2
    };
}

function animarPeces3D() {
    let L = Math.max(1, getDimL());
    let W = Math.max(1, getDimW());
    let H = Math.max(1, getDimH());
    let margin = 1;
    let time = clock.getElapsedTime();
    for (let p of peces3D) {
        let pos = p.mesh.position;
        let dir = new THREE.Vector3().copy(p.target).sub(pos);
        let dist = dir.length();
        if (dist < 0.5) {
            p.target.set(
                (Math.random() - 0.5) * (L - margin * 2),
                Math.random() * (H - margin * 2) + margin,
                (Math.random() - 0.5) * (W - margin * 2)
            );
        }
        dir.normalize();
        pos.x += dir.x * p.speed * 0.05;
        pos.y += dir.y * p.speed * 0.04;
        pos.z += dir.z * p.speed * 0.05;
        pos.x = Math.max(-L / 2 + margin, Math.min(L / 2 - margin, pos.x));
        pos.y = Math.max(margin, Math.min(H - margin, pos.y));
        pos.z = Math.max(-W / 2 + margin, Math.min(W / 2 - margin, pos.z));
        if (dist > 0.1) p.mesh.rotation.y = Math.atan2(dir.x, dir.z);
        let tail = p.mesh.children[1];
        if (tail) tail.rotation.y = Math.sin(time * 3 + p.phase) * 0.3;
    }
}

function animarOlas() {
    if (!waterSurfaceGeo) return;
    let pos = waterSurfaceGeo.attributes.position;
    let time = clock.getElapsedTime();
    for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i), z = pos.getZ(i);
        pos.setY(i, Math.sin(x * 0.5 + time * 1.2) * 0.25 + Math.cos(z * 0.4 + time * 0.9) * 0.20 + Math.sin((x + z) * 0.3 + time * 0.7) * 0.12);
    }
    pos.needsUpdate = true;
}

function limpiarPeces3D() {
    for (let p of peces3D) { threeScene.remove(p.mesh); }
    peces3D = [];
}

function redimensionarThree() {
    if (!threeRenderer || !threeContainer) return;
    let w = threeContainer.clientWidth, h = threeContainer.clientHeight;
    if (w === 0 || h === 0) return;
    threeCamera.aspect = w / h;
    threeCamera.updateProjectionMatrix();
    threeRenderer.setSize(w, h);
}

// Event listeners
esc6Btn.addEventListener('click', function () { navegarA(6); });
largoSlider.addEventListener('input', function () {
    largoVal.textContent = this.value;
    actualizarInfoEsc6();
    actualizarTablaDimVar();
    if (escenarioActual === 6) { construirTanque3D(); iniciarPeces3D(); }
});
anchoSlider.addEventListener('input', function () {
    anchoVal.textContent = this.value;
    actualizarInfoEsc6();
    actualizarTablaDimVar();
    if (escenarioActual === 6) { construirTanque3D(); iniciarPeces3D(); }
});
altoSlider.addEventListener('input', function () {
    altoVal.textContent = this.value;
    actualizarInfoEsc6();
    actualizarTablaDimVar();
    if (escenarioActual === 6) { construirTanque3D(); iniciarPeces3D(); }
});
btnResetEsc6.addEventListener('click', function () {
    largoSlider.value = 19; anchoSlider.value = 18; altoSlider.value = 21;
    largoVal.textContent = 19; anchoVal.textContent = 18; altoVal.textContent = 21;
    // Limpiar tabla Dimensiones variables
    highlightGroups.forEach(function (g) { threeScene.remove(g); });
    highlightGroups = [];
    dimTabInputs = []; dimTabSpans = []; dimTabChecks = [];
    document.getElementById('tbodyDim').innerHTML = '';
    for (let i = 0; i < 2; i++) { agregarFilaDimVar(); }
    // Limpiar tabla Capacidad Dinámica
    capDinaHighlightGroups.forEach(function (g) { threeScene.remove(g); });
    capDinaHighlightGroups = [];
    capDinaVal1 = []; capDinaVal2 = []; capDinaCap1 = []; capDinaCap2 = []; capDinaDiff = []; capDinaChecks = [];
    document.getElementById('tbodyCapDina').innerHTML = '';
    for (let i = 0; i < 2; i++) { agregarFilaCapDina(); }
    actualizarInfoEsc6();
    actualizarTablaDimVar();
    if (escenarioActual === 6) { construirTanque3D(); iniciarPeces3D(); }
});
window.addEventListener('resize', redimensionarThree);

// Escenario 7 event listeners
esc7Val1.addEventListener('input', actualizarEsc7);
esc7Val2.addEventListener('input', actualizarEsc7);
esc7BtnVal.addEventListener('click', function() { verificarEsc7('val'); });
esc7BtnCap.addEventListener('click', function() { verificarEsc7('cap'); });
esc7BtnReset.addEventListener('click', function () {
    esc7Val1.value = '';
    esc7Val2.value = '';
    esc7DeltaVal.value = '';
    esc7DeltaCap.value = '';
    if (labelDeltaVal) labelDeltaVal.setAttribute({visible: false});
    if (labelDeltaCap) labelDeltaCap.setAttribute({visible: false});
    esc7IncluirPeces.checked = false;
    esc7FishCount.value = '';
    esc7FishSize.value = '';
    document.getElementById('esc7FishSection').style.display = 'none';
    if (fishPoint7) fishPoint7.setAttribute({visible: false});
    if (fishLineH7) fishLineH7.setAttribute({visible: false});
    actualizarEsc7();
});
esc7IncluirPeces.addEventListener('change', verificarFish7);
esc7FishCount.addEventListener('input', verificarFish7);
esc7FishSize.addEventListener('input', verificarFish7);

document.querySelectorAll('#esc7Tabs .nav-link').forEach(function (tab) {
    tab.addEventListener('click', function () {
        document.querySelectorAll('#esc7Tabs .nav-link').forEach(function (t) { t.classList.remove('active'); });
        this.classList.add('active');
        esc7DimActual = this.getAttribute('data-dim');

        let dimLabel = esc7DimActual.charAt(0).toUpperCase() + esc7DimActual.slice(1);
        document.getElementById('esc7Th1').textContent = dimLabel + '₁';
        document.getElementById('esc7Th2').textContent = dimLabel + '₂';
        document.getElementById('esc7ThDelta').textContent = 'Δ ' + dimLabel;

        esc7DeltaVal.value = '';
        esc7DeltaCap.value = '';
        esc7IncluirPeces.checked = false;
        esc7FishCount.value = '';
        esc7FishSize.value = '';
        document.getElementById('esc7FishSection').style.display = 'none';
        if (fishPoint7) fishPoint7.setAttribute({visible: false});
        if (fishLineH7) fishLineH7.setAttribute({visible: false});
        actualizarEsc7();
    });
});

escenariosDesbloqueados.add(1);
cambiarEscenario(1);
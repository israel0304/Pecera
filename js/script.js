let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let graph = document.getElementById("box");
let boton3 = document.getElementById("point");
let cajaPeces = document.getElementById("peces");
let cajaTemperatura = document.getElementById("temp");
let textSaturacion = document.getElementById("sat");
let image = new Image();
let imgPecera = new Image();
canvas.width=innerWidth;
canvas.height=canvas.width/2

// event listeers
boton3.addEventListener('click', crearPunto);
cajaPeces.addEventListener('change',pecesDinamicos);
cajaTemperatura.addEventListener('change', tempDinamica);
cajaTemperatura.addEventListener('keydown', pressIntro);



// clases

class Vector {
    constructor(x,y){
         this.x=x;
         this.y=y;
    }

    add(v){
         this.x = this.x + v.x;
         this.y = this.y + v.y;
    }

    res(v){
         this.x = this.x - v.x;
         this.y = this.y - v.y;
    }

    mul(n){
       this.x = this.x * n;
       this.y = this.y * n;
    }

    div(n){
        this.x = this.x / n;
        this.y = this.y / n;
     }


    mag(){
        return Math.sqrt(Math.pow(this.x,2)+Math.pow(this.y,2))
    }
    norm(){
         let m = this.mag();
         if(m>0){
            this.div(m);
         }
    }
    limit(h){
        if (this.mag()>h){
            this.norm();
            this.mul(h);
        }
    }

    static add(v1,v2){
        let v3 = new Vector(v1.x+v2.x,v1.y+v2.y);
        return v3;
    }

    static res(v1,v2){
        let v3 = new Vector(v1.x-v2.x,v1.y-v2.y);
        return v3;
    }
   }


class Pez { 
    constructor(){
        this.canvas = canvas;
        this.ctx = ctx;
        this.image = image;
        this.image.src = './img/pez_neon_todos.png';
        this.dWidth = aleatorio((this.canvas.width * 8)/100,(this.canvas.width * 15)/100);
        this.dHeight = this.dWidth/2;
        this.sWidth = 540;
        this.sHeight = 290;
        this.imageDirection = 'izquierda';
        this.vivir = true;
        this.salud = 'sano'
        this.tamaño = 10;
        // Area de nado
        this.paddingDer = this.canvas.width - ((this.canvas.width * 5)/100) - this.dWidth;
        this.paddingIzq = (this.canvas.width * 5)/100;
        this.paddingArr = (this.canvas.height * 11)/100;
        this.paddingAba = this.canvas.height - ((this.canvas.height * 11)/100) - this.dHeight;

        // Valores de nado 
        this.posicion = new Vector(this.validarPosicionX(),this.validarPosicionY());
        this.velocidad = new Vector(0,0);
        this.velocidad.limit(0.4);
        this.aceleracion = new Vector(0.01,0.01);  
        this.dir = new Vector(signo()*Math.random()*canvas.width/2,signo()*Math.random()*canvas.height/2); 
        
    }

    aparecer() {
        
        this.enfermar();
        // Dirección del pez
        if( this.aceleracion.x < 0){
            this.imageDirection = 'izquierda';
        }else if(this.aceleracion.x > 0){
            this.imageDirection = 'derecha';
        }
        
        // Direccion de imagen Pez
        // ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        
        if(this.imageDirection==='derecha' & this.vivir===true){
            this.ctx.drawImage(this.image,0,0,this.sWidth,this.sHeight,this.posicion.x,this.posicion.y,this.dWidth,this.dHeight);
        }else if(this.imageDirection==='derecha' & this.vivir===false){
            this.ctx.drawImage(this.image,this.sWidth*2,0,this.sWidth,this.sHeight,this.posicion.x,this.posicion.y,this.dWidth,this.dHeight);
        }

        if (this.imageDirection==='izquierda' & this.vivir===true){
            this.ctx.drawImage(this.image,this.sWidth,0,this.sWidth,this.sHeight,this.posicion.x,this.posicion.y,this.dWidth,this.dHeight);
        }else if(this.imageDirection==='izquierda' & this.vivir===false){
            this.ctx.drawImage(this.image,this.sWidth*3,0,this.sWidth,this.sHeight,this.posicion.x,this.posicion.y,this.dWidth,this.dHeight);
        }
    } 


    nadar(){
        this.aceleracion = this.dir;
        this.velocidad.add(this.aceleracion);
        this.velocidad.limit(0.5);
        this.posicion.add(this.velocidad);
        this.chocar();
    }
  

    chocar() {

        if(this.posicion.x > this.paddingDer || this.posicion.x < this.paddingIzq) {
            this.velocidad.x = -this.velocidad.x;
            this.aceleracion.x = -this.aceleracion.x;
        }
        if(this.posicion.y > this.paddingAba || this.posicion.y < this.paddingArr) {
            this.velocidad.y = -this.velocidad.y;
            this.aceleracion.y = -this.aceleracion.y;
        }

    }

    enfermar(){
        if (this.salud === 'enfermo'){
            this.dWidth = aleatorio(50,80);
            this.dHeight = this.dWidth/2;
        }
    }

    morir(){
        this.vivir = false;
        let pMuerto=new Vector(this.posicion.x,this.paddingArr);//cambia direccion de vector en posicion.y a -1
        this.dir = Vector.res(pMuerto,this.posicion);
        this.dir.norm();
        this.dir.mul(1);
        this.nadar();

    }

    validarPosicionX(){
        let valx = aleatorio(this.paddingIzq,this.paddingDer);
        return valx;
    }

    validarPosicionY(){
        let valy = aleatorio(this.paddingArr,this.paddingAba);
        return valy;
    }
    
}

class Burbuja {
    constructor() {
      this.canvas = canvas;
      this.canvas.width = canvas.width;
      this.canvas.height = canvas.height;
      this.radius = aleatorio(3, 10);
      // Area de burbujas
      this.paddingDer = this.canvas.width - ((this.canvas.width * 5)/100) - this.radius;
      this.paddingIzq = (this.canvas.width * 5)/100;
      this.paddingArr = (this.canvas.height * 12)/100;
      this.paddingAba = this.canvas.height - ((this.canvas.height * 11)/100) - this.radius;
      //Posición burbuja
      this.x = aleatorio(this.paddingIzq, this.paddingDer);
      this.y = aleatorio(this.paddingArr, this.paddingAba);
      this.speedX = aleatorio(-4, 4);
      this.speedY = aleatorio(1, 1);
      
    }
    reset = () => {
      if (this.y < this.paddingArr) {
        this.y = this.paddingAba;
        this.x = aleatorio(0,canvas.width);
      }
      if(this.x > this.paddingDer){
        this.x = this.paddingIzq;
      }
      if(this.x < this.paddingIzq){
        this.x = this.paddingDer;
      }
    };
    move = () => {
      this.y -= this.speedY;
      this.speedX+=0.01;
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
      ctx.arc(this.x-2, this.y-3, this.radius/4, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    };
  }


class Pecera {
    constructor(temp){
        this.ancho = canvas.width;
        this.alto = canvas.width/2;
        this.image = imgPecera;
        this.image.src = './img/pecera.png';
        this.texto = textSaturacion
        this.ctx = ctx;
        this.temperatura = temp;
        this.saturacion = this.calSaturacion(this.temperatura);
    }

    aparecer(){
        this.texto.innerHTML = this.saturacion;      
        this.ctx.drawImage(this.image,0,0,this.ancho,this.alto); 
    }

    calSaturacion(t){
        this.sat = -0.0001*(Math.pow(t,3))+0.01*(Math.pow(t,2))-0.39*(t)+14.57
        return parseFloat(this.sat.toFixed(2));
    }

}



///  Funciones
cajaPeces.value=10;
cajaTemperatura.value=22;
let pecera = new Pecera(cajaTemperatura.value);
let peces = generar(Pez,cajaPeces.value);
let burbujas = generar (Burbuja,validarBurbujasIniciales(cajaTemperatura.value));



function pecesDinamicos(e){
    e.preventDefault();
    let nuevop = generar(Pez,cajaPeces.value);
        peces = nuevop;
}

function tempDinamica(e){
    e.preventDefault();
    let nuevaTemp = cajaTemperatura.value;
    pecera = new Pecera (nuevaTemp);
    burbujasDinamicas();
    resucitarPez();
}

function burbujasDinamicas(){
    let nuevasBurbujas = Math.floor(pecera.saturacion);
    if (pecera.temperatura<22){
        burbujas = generar (Burbuja,nuevasBurbujas*50);
    }else if(pecera.temperatura>28){
        burbujas = generar (Burbuja,nuevasBurbujas-5);
    } else{
        burbujas = generar (Burbuja,nuevasBurbujas+50)
    }
}

function validarBurbujasIniciales(b){
    if (b<22){
        return Math.floor(pecera.saturacion)*50
    }else if(b>28){
        return Math.floor(pecera.saturacion)-5
    } else {
        return Math.floor(pecera.saturacion)+50
    }
}

function resucitarPez(){
    for (let i = 0; i < peces.length; i++) {
        peces[i].vivir = true;
        peces[i].dir = new Vector(signo()*Math.random()*canvas.width/2,signo()*Math.random()*canvas.height/2);   
    } 
}

function generar(obj,n){
    let p = [];
    for(i=0;i<n;i++){
        p[i] = new obj();
    }
    return p;
}

function aleatorio(min,max){
    return Math.floor(Math.random() * (max-min) + min);
}

function signo(){
    let s = aleatorio(0,2)==0?-1:1;
    return s;
}

function alerta(){
    alert("¡Precaución!\nTodos Los peces van a morir");
    for(i=0;i<peces.length;i++){
        peces[i].vivir=false;
        peces[i].salud='sano';
    }
}
function enfermar(){
    if(peces[0].vivir === true)
    for(i=0;i<peces.length;i++){
        peces[i].salud='enfermo';
    }else{
        alert('Los peces ya estan muertos, ¡no pueden enfermar!');
    }
    
}

function actualizar(){
    ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
    pecera.aparecer();
    
    for(i=0;i<burbujas.length;i++){
        burbujas[i].draw();
    }
    
    for(i=0;i<peces.length;i++){
        peces[i].aparecer();

        if(pecera.temperatura<22){
            peces[i].salud = 'enfermo';
            peces[i].nadar();
        }else{
            peces[i].salud = 'sano';
            peces[i].nadar();
        }
 
        if(pecera.temperatura>28){
            peces[i].nadar();
            peces[i].morir();
             }else{
            peces[i].nadar();
         }  
     }

    
    
    requestAnimationFrame(actualizar);
}

requestAnimationFrame(actualizar);


//////////JSXGraph


var board = JXG.JSXGraph.initBoard
(
    'box', 
{
    boundingbox: [-5, 50, 100, -5], 
    axis:true,
    showCopyright: false,
}
);
graph.style.height = `${innerHeight/2}px`;

function crearPunto(){
    let caja = document.getElementById('temp')
    pecera.temperatura=caja.value;
    let psaturacion = pecera.calSaturacion(pecera.temperatura);
    let pointColor = pecera.temperatura >= 22 & pecera.temperatura <= 28?'#5dc1b9':'#fd7b7b';
    console.log(pointColor);
    board.create(
        'point', 
        [pecera.temperatura,psaturacion],
        {
            name:'', 
            strokecolor: pointColor,
            fillColor: pointColor,
            fixed : true
        }
        );
        
}

function pressIntro(e){
    if(e.keyCode === 13){
    crearPunto();
    }
        
}

function crearGrafica(){
    board.create('functiongraph', [function(x){return -0.0001*(Math.pow(x,3))+0.01*(Math.pow(x,2))-0.39*(x)+14.57}]);
}
console.log(pecera.sat);
crearGrafica();



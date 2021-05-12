
var url = window.location.href;
var swLocation = '/twittor/sw.js';
var swReg;

if ( navigator.serviceWorker ) {


    if ( url.includes('localhost') ) {
        swLocation = '/sw.js';
    }

    window.addEventListener('load', function(){
        navigator.serviceWorker.register( swLocation ).then(function(reg){
            swReg = reg;
            swReg.pushManager.getSubscription().then(verificaSuscripcion);
        });
    });
}






// Referencias de jQuery

var titulo      = $('#titulo');
var nuevoBtn    = $('#nuevo-btn');
var salirBtn    = $('#salir-btn');
var cancelarBtn = $('#cancel-btn');
var postBtn     = $('#post-btn');
var avatarSel   = $('#seleccion');
var timeline    = $('#timeline');

var modal       = $('#modal');
var modalAvatar = $('#modal-avatar');
var avatarBtns  = $('.seleccion-avatar');
var txtMensaje  = $('#txtMensaje');

var btnActivadas = $(".btn-noti-activadas");
var btnDesactivadas = $(".btn-noti-desactivadas");

// El usuario, contiene el ID del hÃ©roe seleccionado
var usuario;




// ===== Codigo de la aplicaciÃ³n

function crearMensajeHTML(mensaje, personaje) {

    var content =`
    <li class="animated fadeIn fast">
        <div class="avatar">
            <img src="img/avatars/${ personaje }.jpg">
        </div>
        <div class="bubble-container">
            <div class="bubble">
                <h3>@${ personaje }</h3>
                <br/>
                ${ mensaje }
            </div>
            
            <div class="arrow"></div>
        </div>
    </li>
    `;

    timeline.prepend(content);
    cancelarBtn.click();

}



// Globals
function logIn( ingreso ) {

    if ( ingreso ) {
        nuevoBtn.removeClass('oculto');
        salirBtn.removeClass('oculto');
        timeline.removeClass('oculto');
        avatarSel.addClass('oculto');
        modalAvatar.attr('src', 'img/avatars/' + usuario + '.jpg');
    } else {
        nuevoBtn.addClass('oculto');
        salirBtn.addClass('oculto');
        timeline.addClass('oculto');
        avatarSel.removeClass('oculto');

        titulo.text('Seleccione Personaje');
    
    }

}


// Seleccion de personaje
avatarBtns.on('click', function() {

    usuario = $(this).data('user');

    titulo.text('@' + usuario);

    logIn(true);

});

// Boton de salir
salirBtn.on('click', function() {

    logIn(false);

});

// Boton de nuevo mensaje
nuevoBtn.on('click', function() {

    modal.removeClass('oculto');
    modal.animate({ 
        marginTop: '-=1000px',
        opacity: 1
    }, 200 );

});

// Boton de cancelar mensaje
cancelarBtn.on('click', function() {
    if ( !modal.hasClass('oculto') ) {
        modal.animate({ 
            marginTop: '+=1000px',
            opacity: 0
         }, 200, function() {
             modal.addClass('oculto');
             txtMensaje.val('');
         });
    }
});

// Boton de enviar mensaje
postBtn.on('click', function() {

    var mensaje = txtMensaje.val();
    if ( mensaje.length === 0 ) {
        cancelarBtn.click();
        return;
    }

var data={
    mensaje:mensaje,
    user:usuario
}

    fetch('api',{
        method: 'Post',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(res=> res.json())
    .then(res=>console.log('app.js',res))
    .catch(err=> console.log('app.js error:',err));

    
    crearMensajeHTML( mensaje, usuario );

});


//obtener los msj del servidor
function getMensajes(){
    fetch('api')
    .then(res=>res.json())
    .then (posts=>{
        console.log(posts);

        posts.forEach(post=>
            crearMensajeHTML(post.mensaje,post.user));
        
    });
}

getMensajes();

function isOnline(){
    if(navigator.onLine){
        //Tenemos conexion a internet.
        //console.log('Online');
        $.mdtoast('Online',{
            interaction: true,
            interactionTime: 1000,
            actionText: 'OK',
            type: 'success'
        });
    }else{
        //No tenemos conexion a internet.
        //console.log('Offline');
        $.mdtoast('Offline',{
            interaction: true,
            actionText: 'OK',
            type: 'warning'
        });
    }
}

window.addEventListener('online', isOnline);
window.addEventListener('offline', isOnline);

isOnline();

function verificaSuscripcion(activadas){
    console.log(activadas);
    if(activadas){
        btnActivadas.removeClass('oculto');
        btnDesactivadas.addClass('oculto');
    }else{
        btnActivadas.addClass('oculto');
        btnDesactivadas.removeClass('oculto');
    }
}
/* verificaSuscripcion(); */


//Notificaciones
function enviarNotificaciones(){
    const Notif ={
        body: 'Este es el cuerpo de la notificación',
        icon: 'img/icons/icon-72x72.png'
    };

    const n = new Notification('Hola mundo', Notif);
    n.onclick=()=>{
        console.log('Click');
    };
}


function notificarme(){
    if(!window.Notification){
        console.log('Este navegador no soporta las notificaciones');
        return;
    }

    if(Notification.permission==='granted'){
        //new Notification('Hola Mundo! - Granted');
        enviarNotificaciones();
    }else if(Notification.permission !== 'denied' || Notification.permission === 'default'){
        Notification.requestPermission(function(permission){
            
            console.log(permission);

            if(Notification.permission==='granted'){
                //new Notification('Hola Mundo! - Pregunta');
                enviarNotificaciones();
            }
        });
    }
}
notificarme();

function getPublickey(){
    return fetch('api/key')
    .then(res=>res.arrayBuffer())
    .then(key=> new Uint8Array(key));
}
getPublickey().then(console.log);

btnDesactivadas.on('click', function(){
    if(!swReg) return console.log('No hay registro de SW');
    getPublickey().then(function(key){
        swReg.pushManager.subscribe({
            //hacemos visible el btn
            userVisibleOnly: true,
            //mandamos la key
            applicationServerKey: key
        })
        .then(res=>res.toJSON())
        .then(suscripcion=>{
            //console.log(suscripcion);
            fetch('api/suscribe',{
                method:'POST',
                headers:{'Content-Type': 'application/json'},
                body:JSON.stringify(suscripcion)
            }).then(verificaSuscripcion)
            .catch(cancelarSuscripcion);
        });
    });
});

function cancelarSuscripcion(){
    swReg.pushManager.getSubscription().then(subs=>{
        subs.unsubscribe().then(()=>verificaSuscripcion(false));
    });
}
 
btnActivadas.on('click',function(){
    //cancelar
    cancelarSuscripcion();
    
});
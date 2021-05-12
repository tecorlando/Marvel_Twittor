// Routes.js - Módulo de rutas
const express = require('express');
const router = express.Router();
const push = require('./push');

const mensajes=[
{
  _id: 'xxxx',
  user:'Diana',
  mensaje:'Hola a todos'
},
{
  _id: 'xxxx',
  user:'Merlin',
  mensaje:'La magia es grandiosa'
},
{
  _id: 'xxxx',
  user:'Ban',
  mensaje:'Que pereza hacer cualquier cosa'
}

];


// Get mensajes
router.get('/', function (req, res) {
  //res.json('Obteniendo mensajes');
  res.json(mensajes);
});

// Post mensajes
router.post('/', function (req, res) {

    const mensaje={
      mensaje:req.body.mensaje,
      user: req.body.user
    };
    mensajes.push(mensaje);

    console.log(mensajes);

    res.json({
      ok:true,
      mensaje
    });

});

//Almacenar la suscripcion
router.post('/suscribe',(req, res)=>{
  const suscripcion = req.body;
  push.addSubscription(suscripcion);
  res.json('Suscribe');
});

//obtener la key
router.get('/key',(req, res)=>{
  const key = push.getKey();
  res.send(key);
});
//NOSOTROS Enviar la notificacion a los usuarios activos
//REST
router.post('/push',(req,res)=>{

  const post = {
    titulo: req.body.titulo,
    cuerpo: req.body.cuerpo,
    usuario: req.body.usuario
  };

  push.sendPush(post);
  res.json(post)
});



module.exports = router;

      var xhr = new XMLHttpRequest();
      function enviarPOST(url,json){        $.ajax({
      url: url,
      type: 'POST',
      dataType: 'json',
      data: json,
      contentType: 'application/json; charset=utf-8',
      error: function (result) {
      },
      success: function (data) {
      console.log(data);
      if(data.message == "correcto"){
      switch (data.accion){
      case 'redirect':
      window.location.href = data.destino;
      break;
      case 'envio':
      break;
      case 'editar':
      document.body.innerHTML=result.responseText;
      console.log("editar");
      break;
      default:
      }
      }else{
      switch (data.accion){
      case 'redirect':
      alert('Usuario o Password incorrecto');
      break;
      default:
      window.location.href = '/';
      }
      }
      }        });
      }
      function enviarPUT(url,json){        
      $.ajax({
      url: url,
      type: 'PUT',
      dataType: 'json',
      data: json,
      contentType: 'application/json; charset=utf-8',
      error: function (result) {
      console.log(result);
      },
      success: function (data) {
	window.location.href = '/pos.html';
      }        });
      }
      function validarToken(){
      console.log('paso');
      var id = (document.cookie.match(/^(?:.*;)?token=([^;]+)(?:.*)?$/)||[,null])[1];
      var token = new Object();
      token.id = id;
      var jtoken = JSON.stringify(token);
      enviarPOST("https://volley-vr.1d35.starter-us-east-1.openshiftapps.com/f_validarToken",jtoken);
      }
 function cambiarEstado(id,estado){
      var dispositivo = new Object();
      dispositivo.id = id ;
      dispositivo.estado = estado;
      var jdispositivo = JSON.stringify(dispositivo);
      console.log(jdispositivo);
      enviarPOST("https://volley-vr.1d35.starter-us-east-1.openshiftapps.com/f_cambiarEstado",jdispositivo);
      }
      function editarConfiguracion(id){
      window.location.href = "https://volley-vr.1d35.starter-us-east-1.openshiftapps.com/_editarConfiguracion?id="+id;
      }
  
      function httpGetAsync(theUrl, callback){
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      console.log("get:" + xmlHttp.responseText);
      callback((xmlHttp.responseText));
      }
      xmlHttp.open("GET", theUrl, true); // true for asynchronous
      xmlHttp.send(null);
      }
function validarUsuario(f_usuario, f_password){
      var usuario = new Object();
      usuario.nombre = f_usuario;
      usuario.password = f_password;
      var jusuario = JSON.stringify(usuario);
      enviarPOST("https://volley-vr.1d35.starter-us-east-1.openshiftapps.com/f_validarUsuario",jusuario);
      }
function modificarDispositivo(id){
      var dispositivo = new Object();
      dispositivo.id = id;
      dispositivo.tipo = document.getElementById("tiposDispositivos")[document.getElementById("tiposDispositivos").selectedIndex].value;
      dispositivo.ubicacion = document.getElementById("ubicacion").value;
      var jdispositivo = JSON.stringify(dispositivo);
      console.log(jdispositivo);
      enviarPUT("https://volley-vr.1d35.starter-us-east-1.openshiftapps.com/dispositivos", jdispositivo);
      }
function regresar(path){
	window.location.href = path;
}

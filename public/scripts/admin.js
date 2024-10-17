const menuCerrar = document.getElementsByClassName("menuCerrar")[0]; // Accediendo al primer elemento
const menuxLog = document.getElementsByClassName("menuxLog")[0];     // Accediendo al primer elemento
const nombre = document.getElementById("nombre");

if (sesionIniciada == 'true') {
    if (nombre) nombre.innerHTML = usuario;
} else {}
const CerrarSesion = () => {
    localStorage.clear();
}

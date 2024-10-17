function showSidebar(){
    const sidebar = document.querySelector('.sidebar')
    sidebar.style.display = 'flex'
}
function hideSidebar(){
    const sidebar = document.querySelector('.sidebar')
    sidebar.style.display = 'none'
}

const sesionIniciada = localStorage.getItem("sesionIniciada");
const botonSide = document.querySelector(".botonSide");
const botonNav = document.querySelector(".botonNav");

if(sesionIniciada == 'true'){
    botonNav.innerText = "Administracion";
    botonNav.href = '/admin';
    botonSide.innerText = "Administracion";
    botonSide.href = '/admin';
}
else {
    botonNav.innerText = "Iniciar Sesion";
    botonNav.href = '/login';
    botonSide.innerText = "Iniciar Sesion";
    botonSide.href = '/login';
}

const usuario = localStorage.getItem("usuario");
const idAdmin = localStorage.getItem("idAdmin");
const email = localStorage.getItem("email");
window.onload = () => {
    console.log(sesionIniciada)
    if(sesionIniciada && !sesionIniciadaServidor){
        fetch('/sincronizarSesion', {
            method: "Post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                idAdmin: idAdmin,
                usuario: usuario,
                email: email
            })
        }).then(response => {
            if(response.ok){
                location.reload();
            }
        });
    }
}
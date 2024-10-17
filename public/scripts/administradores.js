const RegisterForm = document.getElementById("RegisterForm");
const ModificarForm = document.getElementById("ModificarForm");
const btnAdmin = document.getElementById("btn-admin");
const butRegistrarAdmin = document.getElementById("butRegistrarAdmin");
const butModificarAdmin = document.getElementById("butModificarAdmin");

const toggleFormRegistrar = (FormType) => {
    if(FormType == 'Modificar'){
        ModificarForm.classList.add('active');
        RegisterForm.classList.remove('active');
        btnAdmin.style.left = "110px";
        butModificarAdmin.style.color = "#000";
        butModificarAdmin.style.transition = "0.5s";
        butRegistrarAdmin.style.color = "#edededcd";
        butRegistrarAdmin.style.transition = "0.5s";
    }
    else{
        RegisterForm.classList.add('active');
        ModificarForm.classList.remove('active');
        btnAdmin.style.left = "0px";
        butModificarAdmin.style.color = "#edededcd";
        butModificarAdmin.style.transition = "0.5s";
        butRegistrarAdmin.style.color = "#000";
        butRegistrarAdmin.style.transition = "0.5s";
    }
}
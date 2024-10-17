const AgregarDatosUser = (data) => {
    document.getElementById('userName').textContent = `${data.nombre} ${data.apellido}`;
    document.getElementById('userNick').textContent = data.nick;
    document.getElementById('userRole').textContent = data.rol;
    document.getElementById('userDescription').textContent = data.descripcion;
    document.getElementById('userExperience').textContent = data.experiencia;
}

// Cargar los datos del usuario cuando la página esté lista
document.addEventListener('DOMContentLoaded', () => AgregarDatosUser(Usuario));
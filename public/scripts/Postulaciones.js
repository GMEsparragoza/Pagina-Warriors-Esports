const PostulacionesHTML = document.querySelector(".PostulacionesHTML")

const cargarPostulacionesPlayers = (PostPlayers) => {
    let content = '';
    PostPlayers.forEach(Post => {
        content += `<div class="Post">
            <img src="../img/Logo Warriors.jpeg" alt="Logo">
            <h2>Player</h2>
            <div class="Requisitos">
                <h3>Requisitos:</h3>
                <p>Rango: ${Post.rango}</p>
                <p>Edad minima: ${Post.edadMinima}</p>
                <p>Experiencia Previa: ${Post.experiencia == 1 ? 'Requerida' : 'No Requerida'}</p>
                <p>Rol: ${Post.roles}</p>
                <p>Disponibilidad Horaria</p>
                <p>${Post.horario}</p>
            </div>
            <a href="/Formulario"><input type="button" class="btn-post" value="Postulate"></a>
        </div>`;
    });
    return content;
}

const cargarPostulacionesStaff = (PostStaff) => {
    let content = '';
    PostStaff.forEach(Post => {
        content += `<div class="Post">
            <img src="../img/Logo Warriors.jpeg" alt="Logo">
            <h2>Staff Tecnico</h2>
            <div class="Requisitos">
                <h3>Requisitos:</h3>
                <p>Edad minima: ${Post.edadMinima}</p>
                <p>Experiencia Previa: ${Post.experiencia == 1 ? 'Requerida' : 'No Requerida'}</p>
                <p>Rol: ${Post.roles}</p>
                ${Post.horario ? `
                    <p>Disponibilidad Horaria:</p>
                    <p>${Post.horario}</p>
                ` : ''}
            </div>
            <a href="/Formulario"><input type="button" class="btn-post" value="Postulate"></a>
        </div>`;
    });
    return content;
}

const mostrarPostulaciones = () => {
    let contentPlayers = cargarPostulacionesPlayers(listaPostulacionesPlayers);
    let contentStaff = cargarPostulacionesStaff(listaPostulacionesStaff);

    if (contentPlayers === '' && contentStaff === '') {
        PostulacionesHTML.innerHTML = '<p class="no-postulaciones">No hay postulaciones disponibles en este momento.</p>';
    } else {
        PostulacionesHTML.innerHTML = contentPlayers + contentStaff;
    }
}

mostrarPostulaciones();
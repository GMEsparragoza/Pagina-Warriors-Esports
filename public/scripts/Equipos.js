const RostersContainer = document.querySelector(".RostersContainer");

const cargarEquipos = (Usuarios, Equipos) => {
    Equipos.forEach(Equipo => {
        let nuevoRoster = document.createElement("div");
        nuevoRoster.classList.add("Equipo");
        nuevoRoster.innerHTML = `
            <h2 class="EquipoTitle">${Equipo.nombreRoster}</h2>
            <div class="EquipoOverlay">
                <h3>${Equipo.nombreRoster}</h3>
                <p>${Equipo.descripcion}</p>
            </div>
            <div class="EquipoContent"></div>
        `;

        let EquipoContent = nuevoRoster.querySelector(".EquipoContent");
        let UsuariosRoster = Usuarios.filter((Usuario) => Usuario.idRoster == Equipo.idRoster);

        UsuariosRoster.forEach(UsuarioRoster => {
            let userElement = document.createElement("a");
            userElement.href = `/Perfil/${UsuarioRoster.nick}`;
            userElement.classList.add("User");
            userElement.innerHTML = `
                <img src="../img/Logo Warriors.jpeg" alt="Logo">
                <h2>${UsuarioRoster.nick}</h2>
                <h4>${UsuarioRoster.rol}</h4>
            `;
            EquipoContent.appendChild(userElement);
        });

        RostersContainer.appendChild(nuevoRoster);
    });
}

cargarEquipos(listaUsuarios, listaEquipos);
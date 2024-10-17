// importar la libreria
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const session = require('express-session');

//Crear conexion con la Base de Datos
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Warriors'
});

//Verificar conexion con la Base de Datos
connection.connect((err) => {
    if (err) {
        console.error('Error en la BD', err);
        return;
    }
    console.log("Conexion exitosa a la BD");
});
module.exports = connection;

// Objetos para llamar a los metodos de express
const app = express();

//configuraciones
app.use(cors());

app.use(express.json());

//Especificar Motor de Vistas
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret',
    resave: 'true',
    saveUninitialized: true,
    sesionActual: {Iniciada: false},
    alerta: {activa: false}
}));

//Middleware o Ruta de archivos estáticos
app.use(express.static("public"));

//Funcion para hacer consulta a la Base de Datos
const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
}

//Middleware para configurar el uso de la alerta
app.use((req, res, next) => {
    res.locals.alerta = req.session.alerta || { activa: false };
    req.session.alerta = null; // Limpiar la alerta después de usarla
    next();
});

//Middleware para Mantener la Sesion del Servidor entre las paginas
app.use((req,res,next) => {
    res.locals.SesionActual = req.session.sesionActual || {Iniciada: false};
    next();
});

//Conexion para la pagina de Inicio
app.get("/", async (req, res) => {
    let consultaPlayers = 'SELECT * FROM PostPlayers';
    let consultaStaff = 'SELECT * FROM PostStaff';
    try {
        let PostPlayers = await query(consultaPlayers);
        let PostStaff = await query(consultaStaff);
        res.render("index", {PostPlayers, PostStaff});
    }
    catch (err) {
        res.status(500).send("Error al cargar las Postulaciones");
    }
});

//Conexion para la pagina de Equipos
app.get("/Equipos", async (req, res) => {
    let conRosters = 'SELECT * FROM Roster';
    let conUsers = 'SELECT * FROM Usuario';
    try {
        let Rosters = await query(conRosters);
        let Gente = await query(conUsers);
        res.render("Equipos", {Rosters, Gente});
    }
    catch (err) {
        res.status(500).send("Error al cargar los Rosters");
    }
});

//Conexion con las Paginas de los perfiles de cada Usuario cargado de na BD
app.get("/Perfil/:nick", async (req, res) => {
    let nick = req.params.nick;
    let conUsers = `SELECT * FROM Usuario WHERE nick = ?`;
    try {
        let Gente = await query(conUsers, [nick]);
        res.render("Perfil", {Gente: Gente[0]})
    }
    catch (err) {
        res.status(500).send("Error al cargar los Rosters");
    }

});

//Conexion para la pagina de Login
app.get("/login", (req, res) => {
    const alerta = req.query.alerta ? JSON.parse(decodeURIComponent(req.query.alerta)) : res.locals.alerta;
    let sesionReciente = req.session.sesionActual || {Iniciada:false};
    if (sesionReciente.Iniciada) {
        res.redirect("/admin");
    } else {
        res.render('login', {alerta});
    }
});

//Conexion para la pagina de las Postulaciones
app.get("/Postulaciones", async (req, res) => {
    let consultaPlayers = 'SELECT * FROM PostPlayers';
    let consultaStaff = 'SELECT * FROM PostStaff';
    try {
        let PostPlayers = await query(consultaPlayers);
        let PostStaff = await query(consultaStaff);
        res.render("Postulaciones", {PostPlayers, PostStaff});
    }
    catch (err) {
        res.status(500).send("Error al cargar las Postulaciones");
    }
});

//Conexion para la pagina de enviar Formularios de Postulantes
app.get("/Formulario", (req, res) => {
    res.render('Formulario');
});

//Conexion para la pagina de Administracion
app.get("/admin", (req, res) => {
    SesionActual = req.session.sesionActual || {Iniciada: false};
    if (SesionActual.Iniciada) {
        res.render("admin", {SesionActual});
    }
    else {
        res.redirect("/login");
    }
});

//Conexion para verificar el Inicio de Sesion
app.post("/auth", async (req, res) => {
    const datosLogin = req.body;
    let email = datosLogin.email;
    let password = datosLogin.password;
    if (email && password) {
        let registrar = `SELECT * FROM Admins WHERE (email like ?) AND (contra like ?)`;

        try {
            let rows = await query(registrar, [email, password]);
            if (!rows || rows.length == 0) {
                req.session.alerta = {
                    activa: true,
                    titulo: 'Correo y/o Contraseña no validos',
                    parrafo: 'El correo y la contraseña no coinciden con alguno de la base de datos',
                    bien: "No"
                };
                res.redirect('/login');
            }
            else {
                let UsuarioEncontrado = rows[0];
                req.session.sesionActual = {
                    Iniciada: true,
                    User: UsuarioEncontrado.username,
                    idAdmin: UsuarioEncontrado.idAdmin,
                    email: UsuarioEncontrado.email
                }
                req.session.alerta = {
                    activa: true,
                    titulo: 'Logueado',
                    parrafo: 'Se inicio la sesion con Exito',
                    bien: "Si"
                };
                res.redirect('/admin');
            }
        }
        catch (err) {
            res.status(500).send("Error al Iniciar Sesion");
        }
    } else {
        req.session.alerta = {
            activa: true,
            titulo: 'Faltan Datos',
            parrafo: 'No se puede completar el inicio de Sesion',
            bien: "No"
        };
        res.redirect('/login');
    }
});

//Conexion para la pagina de Envio de Formulario de Players
app.post("/submitPlayers", async (req, res) => {
    const datosPlayer = req.body;
    let registrar = `
    INSERT INTO FormPlayers 
    (nombre, apellido, edad, nick, twitter, rangoActual, rangoPeak, roles, experiencia) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    let valores = [datosPlayer.nombre, datosPlayer.apellido, datosPlayer.edad, datosPlayer.nick, datosPlayer.twitter, datosPlayer.rangoActual, datosPlayer.rangoPeak, datosPlayer.roles, datosPlayer.experiencia];
    try {
        await query(registrar, valores);
        req.session.alerta = {
            activa: true,
            titulo: 'Formulario Enviado',
            parrafo: 'Se registraron las respuestas correctamente',
            bien: "Si"
        };
        res.redirect('/');
    }
    catch (err) {
        req.session.alerta = {
            activa: true,
            titulo: 'Error al enviar Formulario',
            parrafo: 'Datos erroneos o campos incompletos',
            bien: "No"
        };
        res.redirect('/Formulario');
    }
});

//Conexion para la pagina de Envio de Formulario de Staff
app.post("/submitStaff", async (req, res) => {
    const datosStaff = req.body;
    let registrar = `
    INSERT INTO FormStaff 
    (nombre, apellido, edad, nick, twitter, rol, experiencia) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`;
    let valores = [datosStaff.nombre, datosStaff.apellido, datosStaff.edad, datosStaff.nick, datosStaff.twitter, datosStaff.rol, datosStaff.experiencia];
    try {
        await query(registrar, valores);
        req.session.alerta = {
            activa: true,
            titulo: 'Formulario Enviado',
            parrafo: 'Se registraron las respuestas correctamente',
            bien: "Si"
        };
        res.redirect('/');
    }
    catch (err) {
        req.session.alerta = {
            activa: true,
            titulo: 'Error al enviar Formulario',
            parrafo: 'Datos erroneos o campos incompletos',
            bien: "No"
        };
        res.redirect('/Formulario');
    }
});

//Conexion para Validar el Insert de Postulaciones para Player
app.post("/ValidarPostPlayers", async (req, res) => {
    const datos = req.body;
    let registrar = `INSERT INTO PostPlayers (idPost, rango, edadMinima, experiencia, roles, horario) VALUES (NULL,?,?,?,?,?)`;
    let valores = [datos.rango, datos.edadMinima, datos.experiencia, datos.rol, datos.horario];
    try {
        await query(registrar, valores);
        req.session.alerta = {
            activa: true,
            titulo: 'Postulacion Creada',
            parrafo: 'Se registro la postulacion con exito',
            bien: "Si"
        };
        res.redirect('/admin');
    }
    catch (err) {
        req.session.alerta = {
            activa: true,
            titulo: 'Error al crear Postulacion',
            parrafo: 'Datos erroneos o campos incompletos',
            bien: "No"
        };
        res.redirect('/admin');
    }
});

//Conexion para Validar el Insert de Postulaciones para Staff
app.post("/ValidarPostStaff", async (req, res) => {
    const datos = req.body;
    let registrar = `INSERT INTO PostStaff (idPost, edadMinima, experiencia, roles, horario) VALUES (NULL,?,?,?,?)`;
    let valores = [datos.edadMinima, datos.experiencia, datos.rol, datos.horario];
    try {
        await query(registrar, valores);
        req.session.alerta = {
            activa: true,
            titulo: 'Postulacion Creada',
            parrafo: 'Se registro la postulacion con exito',
            bien: "Si"
        };
        res.redirect('/admin');
    }
    catch (err) {
        req.session.alerta = {
            activa: true,
            titulo: 'Error al crear Postulacion',
            parrafo: 'Datos erroneos o campos incompletos',
            bien: "No"
        };
        res.redirect('/admin');
    }
});

//Conexion para modificar los datos de las Postulaciones para Player
app.post("/ModificarPostPlayers", async (req, res) => {
    const datos = req.body;
    let buscarPost = `SELECT * FROM PostPlayers WHERE idPost = ?`;
    let results = await query(buscarPost, [datos.idPost]);
    if (!results || results.length == 0) {
        req.session.alerta = {
            activa: true,
            titulo: 'Postulacion incorrecta',
            parrafo: 'No se encontro la postulacion Ingresada',
            bien: "No"
        };
        res.redirect('/admin');
    }
    else {
        let actualizarPost = `UPDATE PostPlayers set rango = ?, edadMinima = ?, experiencia = ?, roles = ?,
        horario = ? WHERE idPost = ?`
        let valores = [datos.rango, datos.edadMinima, datos.experiencia, datos.rol, datos.horario, datos.idPost];

        try {
            await query(actualizarPost, valores);
            req.session.alerta = {
                activa: true,
                titulo: 'Modificacion Satisfactoria',
                parrafo: 'Se modifico con exito la Postulacion',
                bien: "Si"
            };
            res.redirect('/admin');
        }
        catch (err) {
            req.session.alerta = {
                activa: true,
                titulo: 'Error al modificar la Postulacion',
                parrafo: 'Datos erroneos o campos incompletos',
                bien: "No"
            };
            res.redirect('/admin');
        }
    }
});


//Conexion para modificar los datos de las Postulaciones para Staff
app.post("/ModificarPostStaff", async (req, res) => {
    const datos = req.body;
    let buscarPost = `SELECT * FROM PostStaff WHERE idPost = ?`;
    let results = await query(buscarPost, [datos.idPost]);
    if (!results || results.length == 0) {
        req.session.alerta = {
            activa: true,
            titulo: 'Postulacion incorrecta',
            parrafo: 'No se encontro la postulacion Ingresada',
            bien: "No"
        };
        res.redirect('/admin');
    }
    else {
        let actualizarPost = `UPDATE PostStaff set edadMinima = ?, experiencia = ?, roles = ?,
        horario = ? WHERE idPost = ?`
        let valores = [datos.edadMinima, datos.experiencia, datos.rol, datos.horario, datos.idPost];
        try {
            await query(actualizarPost, valores);
            req.session.alerta = {
                activa: true,
                titulo: 'Modificacion Satisfactoria',
                parrafo: 'Se modifico con exito la Postulacion',
                bien: "Si"
            };
            res.redirect('/admin');
        }
        catch (err) {
            req.session.alerta = {
                activa: true,
                titulo: 'Error al modificar la Postulacion',
                parrafo: 'Datos erroneos o campos incompletos',
                bien: "No"
            };
            res.redirect('/admin');
        }
    }
});

//Conexion para eliminar Postulaciones para Players
app.post("/EliminarPostPlayers", async (req, res) => {
    const idPost = req.body.idPost;
    let buscarPost = `SELECT * FROM PostPlayers WHERE idPost = ?`;
    let results = await query(buscarPost, [idPost]);
    if (!results || results.length == 0) {
        req.session.alerta = {
            activa: true,
            titulo: 'Error al eliminar la postulacion',
            parrafo: 'No se encontro la postulacion ingresada',
            bien: "No"
        };
        res.redirect('/admin');
    }
    else {
        let registrar = `DELETE FROM PostPlayers WHERE idPost = ?`;
        await query(registrar, [idPost]);
        req.session.alerta = {
            activa: true,
            titulo: 'Postulacion eliminada',
            parrafo: 'Se elimino con exito la postulacion',
            bien: "Si"
        };
        res.redirect('/admin');
    }
});

//Conexion para eliminar Postulaciones para Staff
app.post("/EliminarPostStaff", async (req, res) => {
    const idPost = req.body.idPost;
    let buscarPost = `SELECT * FROM PostStaff WHERE idPost = ?`;
    let results = await query(buscarPost, [idPost]);
    if (!results || results.length == 0) {
        req.session.alerta = {
            activa: true,
            titulo: 'Error al eliminar la postulacion',
            parrafo: 'No se encontro la postulacion ingresada',
            bien: "No"
        };
        res.redirect('/admin');
    }
    else {
        let registrar = `DELETE FROM PostStaff WHERE idPost = ?`;
        await query(registrar, [idPost]);
        req.session.alerta = {
            activa: true,
            titulo: 'Postulacion eliminada',
            parrafo: 'Se elimino con exito la postulacion',
            bien: "Si"
        };
        res.redirect('/admin');
    }
});

//Conexion para Validar Rosters
app.post("/ValidarRoster", async (req, res) => {
    const datos = req.body;
    if (!datos.idRoster || !datos.nombreRoster || !datos.descripcion) {
        req.session.alerta = {
            activa: true,
            titulo: 'No se realizo la modificacion',
            parrafo: 'Verifique que todos los campos esten completos',
            bien: "No"
        };
        res.redirect('/admin');
    } else {
        let registrar = 'INSERT INTO Roster VALUES (?,?,?)';
        let valores = [datos.idRoster, datos.nombreRoster, datos.descripcion];
        try {
            await query(registrar, valores);
            req.session.alerta = {
                activa: true,
                titulo: 'Roster Creado',
                parrafo: 'Se creo el roster con exito',
                bien: "Si"
            };
            res.redirect('/admin');
        }
        catch (err) {
            req.session.alerta = {
                activa: true,
                titulo: 'error al crear el Roster',
                parrafo: 'Datos erroneos o campos incompletos',
                bien: "No"
            };
            res.redirect('/admin');
        }
    }
});

//Conexion para Modificar los Rosters
app.post("/ModificarRoster", async (req, res) => {
    const datos = req.body;
    if (!datos.idRoster || !datos.nombreRoster || !datos.descripcion) {
        req.session.alerta = {
            activa: true,
            titulo: 'No se realizo la modificacion',
            parrafo: 'Verifique que todos los campos esten completos',
            bien: "No"
        };
        res.redirect('/admin');
    } else {
        let consultarRoster = 'SELECT * FROM Roster WHERE idRoster = ?';
        let results = await query(consultarRoster, [datos.idRoster]);
        if (!results || results.length == 0) {
            req.session.alerta = {
                activa: true,
                titulo: 'Error al modificar Roster',
                parrafo: 'No se encontro el Roster ingresado',
                bien: "No"
            };
            res.redirect('/admin');
        }
        else {
            let registrar = 'UPDATE Roster set nombreRoster = ?, descripcion = ? WHERE idRoster = ?';
            let valores = [datos.nombreRoster, datos.descripcion, datos.idRoster];

            try {
                await query(registrar, valores);
                req.session.alerta = {
                    activa: true,
                    titulo: 'Roster Modificado',
                    parrafo: 'Se aplicaron las modificaciones con exito',
                    bien: "Si"
                };
                res.redirect('/admin');
            }
            catch (err) {
                req.session.alerta = {
                    activa: true,
                    titulo: 'Error al modificar Roster',
                    parrafo: 'Datos erroneos o campos incompletos',
                    bien: "No"
                };
                res.redirect('/admin');
            }
        }
    }
});

//Conexion pata Validar Usuarios
app.post("/ValidarUsuario", async (req, res) => {
    const datos = req.body;
    let registrar = 'INSERT INTO Usuario VALUES (?,?,?,?,?,?,?,?)';
    let valores = [datos.idUser, datos.nick, datos.nombre, datos.apellido, datos.idRoster, datos.experiencia, datos.descripcion, datos.rol];
    try {
        await query(registrar, valores);
        req.session.alerta = {
            activa: true,
            titulo: 'Usuario creado',
            parrafo: 'Se creo con exito el usuario ingresado',
            bien: "Si"
        };
        res.redirect('/admin');
    }
    catch (err) {
        req.session.alerta = {
            activa: true,
            titulo: 'Error al ingresar usuario',
            parrafo: 'Datos erroneos o campos incompletos',
            bien: "No"
        };
        res.redirect('/admin');
    }
});

//Conexion para Modificar Usuarios
app.post("/ModificarUsuario", async (req, res) => {
    const datos = req.body;
    let registrar = 'SELECT * FROM Usuario WHERE idUser = ?';
    let results = await query(registrar, [datos.idUser]);
    if (!results || results.length == 0) {
        req.session.alerta = {
            activa: true,
            titulo: 'Error al modificar Usuario',
            parrafo: 'No se encontro el Usuario ingresado',
            bien: "No"
        };
        res.redirect('/admin');
    }
    else {
        let registrar = 'UPDATE Usuario set nick = ?, nombre = ?, apellido = ?, idRoster = ?, experiencia = ?, descripcion = ?, rol =? WHERE idUser = ?';
        let valores = [datos.nick, datos.nombre, datos.apellido, datos.idRoster, datos.experiencia, datos.descripcion, datos.rol, datos.idUser];
        try {
            await query(registrar, valores);
            req.session.alerta = {
                activa: true,
                titulo: 'Usuario Modificado',
                parrafo: 'Se modifico el Usuario con exito',
                bien: "Si"
            };
            res.redirect('/admin');
        }
        catch (err) {
            req.session.alerta = {
                activa: true,
                titulo: 'Error al modificar Usuario',
                parrafo: 'Datos erroneos o campos incompletos',
                bien: "No"
            };
            res.redirect('/admin');
        }
    }
});

//Conexion para eliminar Usuarios
app.post("/EliminarUsuario", async (req, res) => {
    let idUser = req.body.idUser;
    let consultaUsuario = 'SELECT * FROM Usuario WHERE idUser = ?';
    let results = await query(consultaUsuario, [idUser]);
    if (!results || results.length == 0) {
        req.session.alerta = {
            activa: true,
            titulo: 'Error al eliminar Usuario',
            parrafo: 'No se encontro el Usuario Ingresado',
            bien: "No"
        };
        res.redirect('/admin');
    }
    else {
        let eliminar = 'DELETE FROM Usuario WHERE idUser = ?';
        await query(eliminar, [idUser]);
        req.session.alerta = {
            activa: true,
            titulo: 'Usuario Eliminado',
            parrafo: 'Se elimino el Usuario',
            bien: "Si"
        };
        res.redirect('/admin');
    }
});

//Conexion para Registrar Usuarios Administradores
app.post("/registrarAdmin", async (req, res) => {
    const datos = req.body;
    if (!datos.username || !datos.password || !datos.email) {
        req.session.alerta = {
            activa: true,
            titulo: 'No se registro el Administrador',
            parrafo: 'Verifique que todos los campos esten completos',
            bien: "No"
        };
        res.redirect('/admin');
    } else {
        let consultarEmail = `SELECT * FROM Admins WHERE email = ?`;
        let results = await query(consultarEmail, [datos.email]);
        if (!results || results.length == 1) {
            req.session.alerta = {
                activa: true,
                titulo: 'Error al registrar Administrador',
                parrafo: 'Ya se encuentra un Admin con el email ingresado',
                bien: "No"
            };
            res.redirect('/admin');
        }
        else {
            let registrar = `INSERT INTO Admins VALUES (NULL,?,?,?)`;
            let valores = [datos.username, datos.email, datos.password];
            try {
                await query(registrar, valores);
                req.session.alerta = {
                    activa: true,
                    titulo: 'Administrador registrado',
                    parrafo: 'Se registro el Administrador ingresado con exito',
                    bien: "Si"
                };
                res.redirect('/admin');
            }
            catch (err) {
                req.session.alerta = {
                    activa: true,
                    titulo: 'Error al registrar Administrador',
                    parrafo: 'Datos erroneos o campos incompletos',
                    bien: "No"
                };
                res.redirect('/admin');
            }
        }
    }
});

//Conexion para modificar Administradores
app.post("/modificarAdmin", async (req, res) => {
    const datos = req.body;
    if (!datos.username || !datos.password || !datos.email) {
        req.session.alerta = {
            activa: true,
            titulo: 'No se realizo la modificacion',
            parrafo: 'Verifique que todos los campos esten completos',
            bien: "No"
        };
        res.redirect('/admin');
    }
    else {
        let consultarAdmin = `SELECT * FROM Admins WHERE email = ?`;
        let results = await query(consultarAdmin, [datos.email]);
        if (!results || results.length == 0) {
            req.session.alerta = {
                activa: true,
                titulo: 'Error al Modificar Admin',
                parrafo: 'No se encontro un Admin con el email ingresado',
                bien: "No"
            };
            res.redirect('/admin');
        }
        else {
            let registrar = `UPDATE Admins set username = ?, contra = ? WHERE email = ?`;
            let valores = [datos.username, datos.password, datos.email];
            try {
                await query(registrar, valores);
                req.session.alerta = {
                    activa: true,
                    titulo: 'Admin Modificado',
                    parrafo: 'Se modificaron los datos del Admin',
                    bien: "Si"
                };
                res.redirect('/admin');
            }
            catch (err) {
                req.session.alerta = {
                    activa: true,
                    titulo: 'Error al Modificar Admin',
                    parrafo: 'Datos erroneos',
                    bien: "No"
                };
                res.redirect('/admin');
            }
        }
    }
});

//Sincronizar la Sesion Actual con la del Servidor
app.post("/sincronizarSesion", (req, res) => {
    const idAdmin = req.body.idAdmin;
    const usuario = req.body.usuario;
    const email = req.body.email;
    if (idAdmin && usuario && email) {
        req.session.sesionActual = {
            Iniciada: true,
            User: usuario,
            idAdmin: idAdmin,
            email: email
        }
        res.status(200).send("Sesion sincronizada correctamente");
    }
    else {
        res.status(400).send("Datos de la sesion no encontrados");
    }
});

//Conexion para el deslogueo de la pagina
app.get("/logout", (req, res) => {
    const alerta = encodeURIComponent(JSON.stringify({
        activa: true,
        titulo: 'Sesion Cerrada',
        parrafo: 'Se Cerro la Sesion con exito',
        bien: "Si"
    }));

    req.session.destroy(() => {
        res.redirect(`/login?alerta=${alerta}`);
    });
});

// Configurar puerto para servidor local
app.listen(4000, () => {
    console.log("El Servidor fue creado en http://localhost:4000");
});
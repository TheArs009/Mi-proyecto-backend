const userService = require('../services/user.service');

// Crea un usuario bajo la administración del usuario autenticado.
exports.createUser = async (req, res, next) => {
    try {
        const usuario = await userService.createUser(
            req.body.nombre,
            req.body.email,
            req.body.password,
            req.body.rol_id,
            req.user.id
        );

        // No devuelve el hash de la contraseña al cliente.
        const usuarioPublico = usuario.toJSON();
        delete usuarioPublico.password;

        return res.status(201).json(usuarioPublico);
    } catch (error) {
        next(error);
    }
};

// Actualiza los datos de un usuario que administra quien realiza la solicitud.
exports.updateUser = async (req, res, next) => {
    try {
        const usuario = await userService.updateUser(
            req.params.id,
            req.body.nombre,
            req.body.email,
            req.body.rol_id,
            req.user.id,
            req.user.id
        );

        // No devuelve el hash de la contraseña al cliente.
        const usuarioPublico = usuario.toJSON();
        delete usuarioPublico.password;

        return res.status(200).json(usuarioPublico);
    } catch (error) {
        next(error);
    }
};

// Lista los usuarios administrados por quien realiza la solicitud.
exports.getAllUsersByAdministratorId = async (req, res, next) => {
    try {
        const usuarios = await userService.getAllUsersByAdministradorId(
            req.user.id,
            req.query.email
        );

        return res.status(200).json(usuarios);
    } catch (error) {
        next(error);
    }
};

// Elimina un usuario administrado por quien realiza la solicitud.
exports.deleteUser = async (req, res, next) => {
    try {
        const resultado = await userService.deleteUser(
            req.params.id,
            req.user.id
        );

        return res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};

// Lista usuarios con el rol indicado en la URL.
exports.getAllUsersByRoleId = async (req, res, next) => {
    try {
        const usuarios = await userService.getAllUsersByRolId(req.params.id);

        return res.status(200).json(usuarios);
    } catch (error) {
        next(error);
    }
};
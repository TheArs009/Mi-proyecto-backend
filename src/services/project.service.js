const Project = require('../models/project.model');
const User = require('../models/user.model');
const ROLES = require('../utils/constants');
const UserProject = require('../models/userProject.model');
const sequelize = require('../config/db');

// Crea un proyecto y asigna como responsable al administrador autenticado.
exports.createProject = async (data, administradorId) => {
    // Verifica que el usuario responsable exista y tenga el rol ADMIN.
    const administrador = await User.findByPk(administradorId);

    if (!administrador) {
        throw new Error('Administrador no encontrado');
    }

    if (administrador.rol_id !== ROLES.ADMIN) {
        throw new Error('El usuario responsable del proyecto debe ser administrador');
    }

    // Guarda los datos del proyecto junto con su administrador responsable.
    return Project.create({
        nombre: data.nombre,
        descripcion: data.descripcion,
        administrador_id: administrador.id
    });
};

// Lista los proyectos visibles para el usuario según su rol.
exports.getAllProjects = async (userId, rolId) => {
    // Un administrador solo ve los proyectos que tiene a su cargo.
    if (rolId === ROLES.ADMIN){
        return Project.findAll({
            where: {administrador_id: userId}
        })
    }

    // Un usuario regular ve los proyectos en los que participa.
    if (rolId === ROLES.USER) {
   return exports.getProjectsByUserId(userId);
      
}

// No se permite consultar proyectos con roles no contemplados.
throw new Error('Rol no válido para consultar proyectos');


};

// Obtiene los proyectos asociados al usuario mediante la tabla intermedia.
exports.getProjectsByUserId = async (userId) => {
    return Project.findAll({
    // Filtra la relación muchos a muchos por el usuario solicitado.
    include: [{
        model: User,
        as: 'usuarios',
        where: { id: userId },
        // Devuelve proyectos sin incluir columnas de usuarios ni de la tabla intermedia.
        attributes: [],
        through: { attributes: [] }
    }]
});

};

// Agrega un usuario como participante en un proyecto administrado por quien solicita.
exports.assignUsersToProject = async (data, administradorId) => {
    // Comprueba que el proyecto exista y pertenezca al administrador autenticado.
    const proyecto = await Project.findOne({
    where: {
        id: data.proyecto_id,
        administrador_id: administradorId
    }
});

if (!proyecto) {
    throw new Error('Proyecto no encontrado o no está bajo tu administración');
}

// Comprueba que el usuario que se quiere agregar exista.
const usuario = await User.findByPk(data.usuario_id);

if (!usuario) {
    throw new Error('Usuario no encontrado');
}

// Evita crear de nuevo una participación que ya existe.
const participacionExistente = await UserProject.findOne({
    where: {
        usuario_id: data.usuario_id,
        proyecto_id: data.proyecto_id
    }
});

if (participacionExistente) {
    throw new Error('El usuario ya participa en este proyecto');
}

// Crea el vínculo del usuario con el proyecto en la tabla intermedia.
return UserProject.create({
    usuario_id: usuario.id,
    proyecto_id: proyecto.id

});

};

// Quita la participación de un usuario en un proyecto del administrador autenticado.
exports.removeUserFromProject = async (data, administradorId) => {
    // Comprueba que el administrador solicitante sea responsable del proyecto.
    const proyecto = await Project.findOne({
    where: {
        id: data.proyecto_id,
        administrador_id: administradorId
    }
});

if (!proyecto) {
    throw new Error('Proyecto no encontrado o no está bajo tu administración');
}

// Busca el vínculo concreto que se eliminará de la tabla intermedia.
const participacion = await UserProject.findOne({
    where: {
        proyecto_id: proyecto.id,
        usuario_id: data.usuario_id
    }
});

if (!participacion) {
    throw new Error('El usuario no participa en este proyecto');
}

// Elimina solo la participación; conserva el proyecto y el usuario.
await participacion.destroy();
return { message: 'Usuario desvinculado del proyecto' };


};

// Actualiza parcialmente un proyecto que administra el usuario autenticado.
exports.updateProject = async (data, administradorId) => {
    // Busca el proyecto y verifica que el administrador tenga autorización.
    const proyecto = await Project.findOne({
    where: {
        id: data.proyecto_id,
        administrador_id: administradorId
    }
});

if (!proyecto) {
    throw new Error('Proyecto no encontrado o no está bajo tu administración');
}

// Incluye solo los campos enviados para conservar los demás valores actuales.
const cambios = {};

if (data.nombre !== undefined) {
    cambios.nombre = data.nombre;
}

if (data.descripcion !== undefined) {
    cambios.descripcion = data.descripcion;
}

// Rechaza solicitudes que no incluyan ningún campo editable.
if (Object.keys(cambios).length === 0) {
    throw new Error('Debes enviar al menos un campo para actualizar');
}

// Guarda y devuelve el proyecto actualizado.
await proyecto.update(cambios);
return proyecto;

};

// Elimina un proyecto y sus participaciones, solo si lo administra quien solicita.
exports.deleteProject = async (id, administradorId) => {

    // Verifica la existencia del proyecto y la responsabilidad del administrador.
    const proyecto = await Project.findOne({
    where: {
        id,
        administrador_id: administradorId
    }
});

if (!proyecto) {
    throw new Error('Proyecto no encontrado o no está bajo tu administración');
}

// Agrupa ambos borrados para que se confirmen o reviertan como una sola operación.
return sequelize.transaction(async (transaction) => {
    // Borra primero los vínculos para mantener la integridad referencial.
    await UserProject.destroy({
        where: { proyecto_id: proyecto.id },
        transaction
    });

    // Borra el proyecto dentro de la misma transacción.
    await proyecto.destroy({ transaction });

    return { message: 'Proyecto eliminado correctamente' };
});

};

// Busca un proyecto por ID aplicando las reglas de acceso del rol del usuario.
exports.getProjectById = async (id, userId, rolId) => {
    // El administrador solo puede consultar proyectos que tiene a su cargo.
    if(rolId===ROLES.ADMIN){
        return Project.findOne({
            where:{administrador_id: userId, id}
        })
    }

    // El usuario regular solo puede consultar proyectos en los que participa.
    if (rolId === ROLES.USER) {
    return Project.findOne({
        where: { id },
        // La relación limita el resultado a proyectos asociados con este usuario.
        include: [{
            model: User,
            as: 'usuarios',
            where: { id: userId },
            attributes: [],
            through: { attributes: [] }
        }]
    });
}

    // Rechaza roles que no tengan permiso para consultar proyectos.
    throw new Error('Rol no valido para realizar consultas');
};
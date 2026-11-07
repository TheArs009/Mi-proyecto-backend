const projectService = require('../services/project.service');

// Atiende la petición HTTP para crear un proyecto.
exports.createProject = async (req, res, next) => {
    try {
        // Envía al servicio los datos del proyecto y el ID del usuario autenticado.
        const proyecto = await projectService.createProject(
            req.body,
            req.user.id
        );

        // Responde con 201 porque se creó un recurso nuevo.
        return res.status(201).json(proyecto);
    } catch (error) {
        // Delega los errores al middleware de manejo de errores de Express.
        next(error);
    }
};

// Atiende la petición HTTP para listar los proyectos visibles para el usuario.
exports.getAllProjects = async (req, res, next) => {
    try {
        // El servicio aplica el filtro correspondiente al ID y rol autenticados.
        const proyectos = await projectService.getAllProjects(
            req.user.id,
            req.user.rol_id
        );

        // Devuelve la lista de proyectos como JSON.
        return res.status(200).json(proyectos);
    } catch (error) {
        next(error);
    }
};

// Atiende la petición HTTP para consultar un proyecto por su ID.
exports.getProjectById = async (req, res, next) => {
    try {
        // Pasa el ID de la URL y la identidad autenticada al servicio.
        const proyecto = await projectService.getProjectById(
            req.params.id,
            req.user.id,
            req.user.rol_id
        );

        // Informa que no se encontró un proyecto accesible con ese ID.
        if (!proyecto) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        // Devuelve el proyecto encontrado.
        return res.status(200).json(proyecto);
    } catch (error) {
        next(error);
    }
};

// Atiende la petición HTTP para agregar un usuario como participante del proyecto.
exports.assignUsersToProject = async (req, res, next) => {
    try {
        // El cuerpo identifica proyecto y usuario; el ID autenticado permite autorizar.
        const participacion = await projectService.assignUsersToProject(
            req.body,
            req.user.id
        );

        // Responde con 201 porque se creó una participación.
        return res.status(201).json(participacion);
    } catch (error) {
        next(error);
    }
};

// Atiende la petición HTTP para quitar a un usuario de un proyecto.
exports.removeUserFromProject = async (req, res, next) => {
    try {
        // El servicio valida al administrador y elimina solo el vínculo de participación.
        const resultado = await projectService.removeUserFromProject(
            req.body,
            req.user.id
        );

        // Devuelve el resultado de la desvinculación.
        return res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};

// Atiende la petición HTTP para actualizar un proyecto.
exports.updateProject = async (req, res, next) => {
    try {
        // Pasa los campos enviados y el ID del administrador autenticado al servicio.
        const proyecto = await projectService.updateProject(
            req.body,
            req.user.id
        );

        // Devuelve el proyecto actualizado.
        return res.status(200).json(proyecto);
    } catch (error) {
        next(error);
    }
};

// Atiende la petición HTTP para eliminar un proyecto.
exports.deleteProject = async (req, res, next) => {
    try {
        // Obtiene el ID del proyecto de la URL y pasa la identidad autenticada.
        const resultado = await projectService.deleteProject(
            req.params.id,
            req.user.id
        );

        // Devuelve la confirmación de eliminación enviada por el servicio.
        return res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};
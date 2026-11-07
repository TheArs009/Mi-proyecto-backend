const authService = require('../services/auth.service');

// Atiende la petición HTTP de inicio de sesión.
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Rechaza la solicitud si faltan credenciales.
        if (!email || !password) {
            return res.status(400).json({
                message: 'El correo y la contraseña son obligatorios'
            });
        }

        // El servicio valida las credenciales y devuelve el token JWT.
        const token = await authService.loginUser(email, password);

        return res.status(200).json({ token });
    } catch (error) {
        next(error);
    }
};
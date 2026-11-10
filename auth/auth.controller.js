const authService = require('./auth.service');

const authController = {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            res.json(result);
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    },

    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            const tokens = await authService.refreshToken(refreshToken);
            res.json(tokens);
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    },

    async me(req, res) {
        try {
            const user = await authService.me(req.user.id);
            res.json(user);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    },

    async logout(req, res) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const { refreshToken } = req.body;
            await authService.logout(refreshToken, token);
            res.json({ message: 'Logout successful' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = authController;
const userService = require("./user.service");

const userController = {
    create: async (req, res) => {
        try {
            const user = await userService.create(req.body);
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    findById: async (req, res) => {
        try {
            const user = await userService.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    findByEmail: async (req, res) => {
        try {
            const user = await userService.findByEmail(req.params.email);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    update: async (req, res) => {
        try {
            const updatedUser = await userService.update(req.params.id, req.body);
            res.json(updatedUser);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    toggleActive: async (req, res) => {
        try {
            const { active } = req.body;
            if (active === undefined) {
                return res.status(400).json({ error: 'Active field is required' });
            }
            const updatedUser = await userService.toggleActive(req.params.id, active);
            res.json(updatedUser);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    findAll: async (req, res) => {
        try {
            const users = await userService.findAll();
            res.json(users);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = userController;
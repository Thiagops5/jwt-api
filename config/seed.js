const { User } = require('../models');
const userService = require('../user/user.service');

// Cria o primeiro administrador quando ainda não existe nenhum no banco.
// Os dados podem ser trocados pelo .env (ADMIN_NAME, ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD).
const seedAdmin = async () => {
    const adminExists = await User.findOne({ where: { isAdmin: true } });
    if (adminExists) return;

    const email = process.env.ADMIN_EMAIL || 'admin@biblioteca.com';
    const password = process.env.ADMIN_PASSWORD || '123456';

    await userService.create({
        name: process.env.ADMIN_NAME || 'Admin',
        username: process.env.ADMIN_USERNAME || 'admin',
        email,
        password,
        isAdmin: true
    });

    console.log(`SEED: administrador criado (${email})`);
};

module.exports = seedAdmin;

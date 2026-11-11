const bcrypt = require('bcrypt');
const User = require('./user.model');

const userService = {
    create: async (userData) => {
        try {
            userData.password = await bcrypt.hash(userData.password, 10);
            return await User.create(userData);
        } catch (error) {
            throw new Error('Error creating user: ' + error.message);
        }
    },
    // usando o attributes exclude password nas buscas e atualizações pra já barrar a senha direto na consulta do banco de dados
    // assim a gente aplica o princípio do menor privilégio e nem traz o hash da senha pra memória quando não precisa mostrar nada disso pro front
    findById: async (id) => {
        return await User.findByPk(id, { attributes: { exclude: ['password'] } });
    },
    // aqui no findByEmail foi o único lugar que deixei sem o exclude porque o auth.service usa essa função na hora do login pra comparar a senha digitada com o hash do bcrypt (e se tirasse aqui o login ia quebrar kkkkkk)
    findByEmail: async (email) => {
        return await User.findOne({ where: { email } });
    },
    findAll: async () => {
        return await User.findAll({ attributes: { exclude: ['password'] } });
    },
    // no update a gente filtra só os campos permitidos (name, username e email) pra ninguém tentar injetar um isAdmin: true na malandragem pelo body da requisição
    update: async (id, data) => {
        const allowedFields = ['name', 'username', 'email'];
        const updateData = {};
        for (const field of allowedFields) {
            if (data[field] !== undefined) updateData[field] = data[field];
        }
        const [updated] = await User.update(updateData, { where: { id } });
        if (!updated) throw new Error('User not found');
        return await User.findByPk(id, { attributes: { exclude: ['password'] } });
    },
    // ativa ou desativa o atendente (se ficar false ele já é barrado lá no login) e devolve o usuário atualizado sem a senha
    toggleActive: async (id, active) => {
        const [updated] = await User.update({ active }, { where: { id } });
        if (!updated) throw new Error('User not found');
        return await User.findByPk(id, { attributes: { exclude: ['password'] } });
    }



};

module.exports = userService;
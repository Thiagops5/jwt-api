const { Reader, Loan } = require('../models');

const readerService = {
    create: async (readerData) => {
        try {
            return await Reader.create(readerData);
        } catch (error) {
            throw new Error('Erro ao criar leitor: ' + error.message);
        }
    },
    findById: async (id) => {
        return await Reader.findByPk(id); 
    },
    findAll: async () => {
        return await Reader.findAll();
    },
    update: async (id, readerData) => {
        const reader = await Reader.findByPk(id);
        if (!reader) throw new Error('Leitor não encontrado');
        return await reader.update(readerData);
    },
    delete: async (id) => {
        const reader = await Reader.findByPk(id);
        if (!reader) throw new Error('Leitor não encontrado');

        //Vai impedir de apagar um leitor que tem histórico de empréstimos
        const loanCount = await Loan.count({ where: { readerId: id } });
        if (loanCount > 0) {
            throw new Error('Não é possível excluir leitor pois possui empréstimos vinculados.');
        }

        await reader.destroy();
    }
};

module.exports = readerService;
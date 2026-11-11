const { Op } = require('sequelize');
const { Reader, Loan, Book } = require('../models');

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
    // bucando todos os empréstimos de um leitor específico que era um dos requisitos do trabalho e não tinha implementado nenhum serviço com o loan ainda no reader
    findLoans: async (id) => {
        const reader = await Reader.findByPk(id);
        if (!reader) throw new Error('Leitor não encontrado');

        await Loan.update(
            { status: 'ATRASADO' },
            {
                where: {
                    readerId: id,
                    returnDate: null,
                    dueDate: { [Op.lt]: new Date() },
                    status: 'ATIVO'
                }
            }
        );

        return await Loan.findAll({
            where: { readerId: id },
            include: [Book]
        });
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
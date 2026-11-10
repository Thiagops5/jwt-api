// o pior service que ja fiz com toda a certeza kkkkkkk mas explicando o create que ele inicia a transaçãp pelo db.transaction() que se algo da errado ele desfaz tudo que fez ate o momento, e se dá certo ele confirma com o t.commit() e cria oemprestimo
// a primeira validação que ele faz é se existe e se tem copias disponiveis(availableCopies)
// depois ele valida se o leitor tem mais de 3 emprestimos ativos(if (max >= 3)) e se tem algum emprestimo em atraso(const max = await Loan.count{}), se passar por todas as validações ele cria o emprestimo 
// e diminui a quantidade de copias disponiveis do livro(book.availableCopies -= 1;)
// se dá ruim ele desfaz tudo que a transação tentou fazer(await t.rollback();)


const { Op } = require('sequelize');
const { Loan, Book, Reader } = require('../models');
const db = require('../config/db'); // IMPORTANTE: Importar o db para a transação

const loanService = {
    create: async (loanData) => {

        const t = await db.transaction();
        try {

            const book = await Book.findByPk(loanData.bookId);
            if (!book) throw new Error('Livro não encontrado');
            if (book.availableCopies <= 0) throw new Error('Nenhuma cópia disponível');

            const max = await Loan.count({ 
                where: {
                    readerId: loanData.readerId,
                    status: 'ATIVO', 
                    returnDate: null 
                } 
            });
            if (max >= 3) throw new Error('Limite de empréstimos atingido');

            const arrears = await Loan.findOne({
                where: {
                    readerId: loanData.readerId,
                    returnDate: null,
                    dueDate: { [Op.lt]: new Date() }
                }
            });
            if (arrears) throw new Error('Existem empréstimos em atraso');


            loanData.status = 'ATIVO';
            loanData.loanDate = new Date();
            
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 7);
            loanData.dueDate = dueDate;

            const loan = await Loan.create(loanData, { transaction: t });

            book.availableCopies -= 1;
            await book.save({ transaction: t });

            await t.commit();
            return loan; 

        } catch (error) {
            await t.rollback();
            throw new Error(error.message);
        }
    },

    // e aqui no returnBook (a devolução) a gente pega o empréstimo pelo id e confere se já não foi devolvido pra não bugar o estoque
    // depois faz a matemática doida do JS pra ver se atrasou (transformando milissegundos em dias arredondando pra cima) pra cobrar R$ 1,00 por dia de atraso
    // no final muda o status pra DEVOLVIDO, salva a multa e devolve o livro pra estante somando +1 no availableCopies
    // tudo isso abraçado pela transação (t) também pra garantir que o banco não exploda e salve pela metade
    returnBook: async (id) => {
        const t = await db.transaction();

        try {
            const loan = await Loan.findByPk(id);
            if (!loan) throw new Error('Empréstimo não encontrado');
            if (loan.status === 'DEVOLVIDO') throw new Error('Este livro já foi devolvido');

            const today = new Date();
            let fine = 0;

            // Lógica da Multa: Se hoje for maior que a data limite, o cara atrasou
            if (today > loan.dueDate) {
                const diffTime = today - loan.dueDate;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                fine = diffDays * 1; // R$ 1,00 por dia
            }

            // Atualiza os dados do empréstimo
            loan.status = 'DEVOLVIDO';
            loan.returnDate = today;
            loan.fine = fine;
            await loan.save({ transaction: t });

            // Devolve o livro pra estante com o +1
            const book = await Book.findByPk(loan.bookId);
            book.availableCopies += 1;
            await book.save({ transaction: t });

            await t.commit();
            return loan;

        } catch (error) {
            await t.rollback();
            throw new Error(error.message);
        }
    },


    findById: async (id) => {
        return await Loan.findByPk(id, {
            include: [Book]
        });
    },
    findAll: async (statusQuery) => {
        const filter = {};

        if (statusQuery) {
            // ajuda para colocar para maiúsculo para evitar problemas (ex: ?status=ativo vira ATIVO)
            filter.status = statusQuery.toUpperCase();
        }

        // Busca no banco aplicando o filtro de status se ele existir
        const loans = await Loan.findAll({
            where: filter,
            include: ['Book', 'Reader', 'User'] // Inclui os relacionamentos se você já tiver configurado
        });

        return loans;
    },

    findByReaderId: async (readerId) => {
        return await Loan.findAll({
            where: { readerId },
            include: ['Book']
        });
    },
    update: async (id, loanData) => {
        const loan = await Loan.findByPk(id);
        if (!loan) throw new Error('Empréstimo não encontrado');
        return await loan.update(loanData);
    },
    delete: async (id) => {
        const loan = await Loan.findByPk(id);
        if (!loan) throw new Error('Empréstimo não encontrado');
        await loan.destroy();
    }
};

module.exports = loanService;
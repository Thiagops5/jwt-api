const { Op } = require('sequelize');
const { Book, Loan } = require('../models');

const reportService = {
    // Totais para os cards do dashboard.
    // Os empréstimos são classificados por returnDate/dueDate (e não pela coluna status),
    // assim o "atrasado" é sempre calculado: dueDate < hoje e sem returnDate.
    dashboard: async () => {
        const totalBooks = await Book.count();
        const totalCopies = (await Book.sum('totalCopies')) || 0;
        const availableCopies = (await Book.sum('availableCopies')) || 0;

        const activeLoans = await Loan.count({ where: { returnDate: null } });
        const overdueLoans = await Loan.count({
            where: {
                returnDate: null,
                dueDate: { [Op.lt]: new Date() }
            }
        });
        const totalFines = (await Loan.sum('fine')) || 0;

        return {
            totalBooks,
            totalCopies,
            availableCopies,
            activeLoans,
            overdueLoans,
            totalFines
        };
    }
};

module.exports = reportService;

// Op para fazer pesquisa por so parte do titulo, requisito do trabalho
const { Op } = require('sequelize');
const { Book, Category, Author, Loan } = require('../models'); 

const bookService = {
    create: async (bookData) => {
        try {
          // Criando o livro
            const newBook = await Book.create(bookData);
            
            // Se o front-end mandou uma lista de autores, faz a ligação. o que faz tambem a obrigação do cadastro de autores antes do cadastro do livro
            if (bookData.authors && bookData.authors.length > 0) {
                await newBook.setAuthors(bookData.authors);
            }
            
            return newBook;
        } catch (error) {
            throw new Error('Erro ao criar livro: ' + error.message);
        }
    },
    
    findById: async (id) => {
        return await Book.findByPk(id, {
            include: [Category, Author]
        });
    },
    

    findAll: async (filters = {}) => {
        const whereClause = {};

        if (filters.title) {
            whereClause.title = { [Op.like]: `%${filters.title}%` }; // Busca qualquer livro que contenha o texto
        }
        if (filters.categoryId) {
            whereClause.categoryId = filters.categoryId;
        }
        if (filters.available === 'true') {
            whereClause.availableCopies = { [Op.gt]: 0 };
        }

        // Se acaso vier filtro de autor, filtro a tabela de autores também
        const includeClause = [
            { model: Category },
            { 
                model: Author,
                where: filters.authorId ? { id: filters.authorId } : undefined
            }
        ];

        return await Book.findAll({
            where: whereClause,
            include: includeClause
        });
    },
    
    update: async (id, bookData) => {
        const book = await Book.findByPk(id);
        if (!book) throw new Error('Livro não encontrado');
        
        await book.update(bookData);

        // atualiza os autores do livro quendo atualiza o livro
        if (bookData.authors) {
            await book.setAuthors(bookData.authors);
        }
        return book;
    },
    
    delete: async (id) => {
        const book = await Book.findByPk(id);
        if (!book) throw new Error('Livro não encontrado');

        // bloqueia se tiver algum empréstimo usando esse livro
        const loanCount = await Loan.count({ where: { bookId: id } });
        if (loanCount > 0) {
            throw new Error('Não foi possível excluir livro pois possui empréstimos vinculados.');
        }

        await book.destroy();
    }
};

module.exports = bookService;
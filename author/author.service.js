const { Author, Book } = require('../models');

const authorService = {
    create: async (authorData) => {
        try {
            return await Author.create(authorData);
        } catch (error) {
            throw new Error('Erro ao criar autor: ' + error.message);
        }
    },
    findById: async (id) => {
        return await Author.findByPk(id); 
    }, 
    findAll: async () => {
        return await Author.findAll();
    },
    update: async (id, authorData) => {
        const author = await Author.findByPk(id);
        if (!author) throw new Error('Autor não encontrado');
        return await author.update(authorData);
    },
    delete: async (id) => {
        const author = await Author.findByPk(id);
        if (!author) throw new Error('Autor não encontrado');

        const bookCount = await author.countBooks();
        if (bookCount > 0) {
            throw new Error('Não é possível excluir autor pois possui livros vinculados.');
        }
        await author.destroy();
    }
};

module.exports = authorService;
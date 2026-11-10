// Importamos o Category e o Book lá do nosso "Casamenteiro"
const { Category, Book } = require('../models'); 

const categoryService = {
    create: async (categoryData) => {
        try {
            return await Category.create(categoryData);
        } catch (error) {
            throw new Error('Erro ao criar categoria: ' + error.message);
        }
    },
    
    findById: async (id) => {
        return await Category.findByPk(id); 
    }, 
    
    findAll: async () => {
        return await Category.findAll();
    },
    
    update: async (id, categoryData) => {
        const category = await Category.findByPk(id);
        if (!category) throw new Error('Categoria não encontrada');
        return await category.update(categoryData);
    },
    

    // ele vai fazer uma busca pelo id da categoria, se não achar, lança o erro de categoria não encontrada
    // se achar, ele vai contar quantos livros estão amarrados a essa categoria
    // se tiver algum livro, lança o erro de não pode excluir categoria com livros
    // se não tiver livro, ele vai deletar a categoria
    delete: async (id) => {
        const category = await Category.findByPk(id);
        if (!category) throw new Error('Categoria não encontrada');

        const bookCount = await Book.count({ where: { categoryId: id } });
        
        if (bookCount > 0) {
            throw new Error('Não foi possível excluir categoria pois possui livros.'); 
        }

        await category.destroy();
    }
};


module.exports = categoryService;
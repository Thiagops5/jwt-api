const categoryService = require('./category.service');

const categoryController = {
  create: async (req, res) => {
    try {
      const category = await categoryService.create(req.body);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  findById: async (req, res) => {
    try {
      const category = await categoryService.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  findAll: async (req, res) => {
    try {
      const categories = await categoryService.findAll();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  update: async (req, res) => {
    try {
      const category = await categoryService.update(req.params.id, req.body);
      res.json(category);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  delete: async (req, res) => {
    try {
      await categoryService.delete(req.params.id);
      res.status(204).send('Categoria excluída com sucesso');
    } catch (error) {
      res.status(409).json({ error: 'Não é possível excluir registro com vínculos ativos.' });
    }
  }
};
module.exports = categoryController;
const readerService = require('./reader.service');

const readerController = {
  create: async (req, res) => {
    try {
      const reader = await readerService.create(req.body);
      res.status(201).json(reader);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  findById: async (req, res) => {
    try {
      const reader = await readerService.findById(req.params.id);
      if (!reader) {
        return res.status(404).json({ error: 'Leitor não encontrado' });
      }
      res.json(reader);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  findAll: async (req, res) => {
    try {
      const readers = await readerService.findAll();
      res.json(readers);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  update: async (req, res) => {
    try {
      const reader = await readerService.update(req.params.id, req.body);
      res.json(reader);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  delete: async (req, res) => {
    try {
      await readerService.delete(req.params.id);
      res.status(204).send(); 
    } catch (error) {
      if (error.message.includes('possui empréstimos')) {
        return res.status(409).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    } 
  }
};

module.exports = readerController;
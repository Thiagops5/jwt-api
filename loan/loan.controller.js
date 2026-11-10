const loanService = require('./loan.service'); 
const loanController = {
  create: async (req, res) => {
    try {
      const loan = await loanService.create(req.body);
      res.status(201).json(loan);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  
  findById: async (req, res) => {
    try {
      const loan = await loanService.findById(req.params.id);
      if (!loan) {
        return res.status(404).json({ error: 'Empréstimo não encontrado' });
      } 
      res.json(loan);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  
  async findAll(req, res) {
        try {
            // Pega o ?status=... da URL (ex: /v1/loans?status=ATIVO)
            const { status } = req.query;
            
            const loans = await loanService.findAll(status);
            res.json(loans);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
  
  returnBook: async (req, res) => {
    try {
      const loan = await loanService.returnBook(req.params.id);
      res.json(loan);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  
};

module.exports = loanController;
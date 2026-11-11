const reportService = require('./report.service');

const reportController = {
    dashboard: async (req, res) => {
        try {
            const data = await reportService.dashboard();
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = reportController;

// o middleware foi alterado pois a versão anterior precisava suportar a nova estrutura de autenticação com Refresh Token e validação do payload contendo o isAdmin, garantindo que a extração do token Bearer do cabeçalho seja robusta, trate erros de formato adequadamente e anexe os dados decodificados (req.user) para que os próximos middlewares e controllers saibam exatamente quem está acessando e se possui privilégios administrativos
const authService = require('./auth.service');

const authMiddleware = {
    // Guarda-costas geral: Verifica se o usuário está logado e tem um token válido
    verifyToken: async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({ error: 'Token não fornecido' });
            }

            // Separa o "Bearer" do token JWT
            const parts = authHeader.split(' ');
            if (parts.length !== 2) {
                return res.status(401).json({ error: 'Erro no formato do token' });
            }

            const [scheme, token] = parts;
            if (!/^Bearer$/i.test(scheme)) {
                return res.status(401).json({ error: 'Token mal formatado' });
            }

            // Chama o service para verificar a validade e a blacklist
            const decoded = await authService.verifyToken(token);
            
            // Anexa os dados decodificados (id, email, name, isAdmin) na requisição
            req.user = decoded; 
            
            return next(); 
        } catch (error) {
            return res.status(401).json({ error: error.message || 'Token inválido ou expirado' });
        }
    },

    // Guarda-costas VIP: Verifica se além de logado, o usuário é Administrador com base no isAdmin
    verifyAdmin: (req, res, next) => {
        if (!req.user || req.user.isAdmin !== true) {
            return res.status(403).json({ error: 'Acesso negado: Apenas administradores podem realizar esta ação' });
        }
        next();
    }
};

module.exports = authMiddleware;
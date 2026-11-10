const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const userService = require('../user/user.service');
const LogoutList = require('./logoutList.model');
const RefreshToken = require('./refreshToken.model');
const authService = {
    login: async (email, password) => {

        // não é um erro ele comparar o user duas vezes, um no isMatch e outro no if? eu não poderia apagar a linha que fala if (!user) throw new Error('Invalid email or password'); ?
        const user = await userService.findByEmail(email);
        if (!user) throw new Error('Invalid email or password');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!user || !isMatch) {
            throw new Error('Invalid email or password');
        }
        const token = jwt.sign(
            {
             id: user.id,
              email: user.email,
              name: user.name,
            //  usando o isAdmin pois pesquisei e disseram que fala que ele é melhor do que ficar puxando a senha toda vez quando ele pode puxar somente o token que é mais seguro, e o isAdmin é para saber se ele é admin ou user 
              isAdmin: user.isAdmin
            }, process.env.JWT_SECRET, 
            { expiresIn: '5h', });

        const refreshTokenValue = crypto.randomBytes(40).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await RefreshToken.create({
            token: refreshTokenValue,
            userId: user.id,
            expiresAt,
            revoked: false
        });

        return {
            accessToken: token,
            refreshToken: refreshTokenValue,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            }
        };
    },

    refreshToken: async (oldRefreshTokenValue) => {
        if (!oldRefreshTokenValue) {
            throw new Error('Refresh token não fornecido');
        }

        const storedToken = await RefreshToken.findOne({ where: { token: oldRefreshTokenValue } });
        if (!storedToken) {
            throw new Error('Refresh token inválido');
        }

        // token já revogado sendo reutilizado: revoga todos os refresh tokens do usuário (detecção de roubo)
        if (storedToken.revoked) {
            await RefreshToken.update({ revoked: true }, { where: { userId: storedToken.userId } });
            throw new Error('Tentativa de reutilização de token detectada. Sessão encerrada por segurança.');
        }

        if (new Date() > new Date(storedToken.expiresAt)) {
            throw new Error('Refresh token expirado');
        }

        // rotação: o refresh antigo é revogado e um novo par é emitido
        storedToken.revoked = true;
        await storedToken.save();

        const user = await userService.findById(storedToken.userId);
        if (!user) {
            throw new Error('Usuário inválido');
        }

        const newAccessToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                isAdmin: user.isAdmin
            }, process.env.JWT_SECRET,
            { expiresIn: '15m', });

        const newRefreshTokenValue = crypto.randomBytes(40).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await RefreshToken.create({
            token: newRefreshTokenValue,
            userId: user.id,
            expiresAt,
            revoked: false
        });

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshTokenValue
        };
    },

    logout: async (refreshTokenValue, token) => {
        // Implement logout logic if needed (e.g., token blacklisting), é o que? kkkkkk
        // explicando de uma maneira mais facil ele vai jogar o token atual na lista negra para invalidar o usuario
        if (refreshTokenValue) {
            await RefreshToken.update({ revoked: true }, { where: { token: refreshTokenValue } });
        }
        await LogoutList.create({ token });
        
    },

    // busca no banco de dados o usuario pelo id que vem do token, e volta o id, name, email e isAdmin, sem a senha
    me: async (id) => {
        const user = await userService.findById(id);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
        };
    },

verifyToken: async (token) => {
        try {
            const isBlacklisted = await LogoutList.findOne(
                { where: { token } }
            );
            if (isBlacklisted) {
                throw new Error('Token revogado');
            }
         
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return decoded;
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
};

module.exports = authService;
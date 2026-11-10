const dotenv = require('dotenv');
dotenv.config();
const db = require('./config/db');
const express = require('express');

// onde está cada router de cada entidade
const authRouter = require('./auth/auth.router');
const userRouter = require('./user/user.router');
const categoryRouter = require('./category/category.router');
const authorRouter = require('./author/author.router');
const readerRouter = require('./reader/reader.router');
const bookRouter = require('./book/book.router');
const loanRouter = require('./loan/loan.router');

const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

//aqui cai ficar as rotas de cada entidade
app.use('/v1/auth', authRouter);
app.use('/v1/user', userRouter);
app.use('/v1/categories', categoryRouter);
app.use('/v1/authors', authorRouter);
app.use('/v1/readers', readerRouter);
app.use('/v1/books', bookRouter);
app.use('/v1/loans', loanRouter);



db.sync()
app.listen(PORT, () => {
    console.log(`SERVIDOR RODANDO http://localhost:${PORT}`);
});
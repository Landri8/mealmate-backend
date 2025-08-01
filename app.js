const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const { connectdb } = require('./config/db');
const { validateAuthUser } = require('./middlewares/auth.middleware');

dotenv.config();

connectdb();

const app = express();

app.use(cors({origin: '*'}));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use(helmet());

app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/users', validateAuthUser, require('./routes/user.route'));
app.use('/api/recipes', validateAuthUser, require('./routes/recipe.route'));
app.use('/api/ingredients', validateAuthUser, require('./routes/ingredient.route'));
app.use('/api/categories', validateAuthUser, require('./routes/category.route'));
app.use('/api/app', validateAuthUser, require('./routes/client.route'));

module.exports = app;
const Sequelize = require('sequelize');
const User = require('./user');
const Game = require('./game');
const Vote = require('./vote');
const Comment = require('./comment');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config,
);

db.sequelize = sequelize;

db.User = User;
db.Game = Game;
db.Vote = Vote;
db.Comment = Comment;

User.init(sequelize);
Game.init(sequelize);
Vote.init(sequelize);
Comment.init(sequelize);

User.associate(db);
Game.associate(db);
Vote.associate(db);
Comment.associate(db);

module.exports = db;
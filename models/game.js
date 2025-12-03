const Sequelize = require('sequelize');

class Game extends Sequelize.Model {
  static init(sequelize) {
    const gameAttr = {
      // 밸런즈 게임 주제
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      // 선택지1
      optionA: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      // 선택지2
      optionB: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      // 선택지1 선택 횟수
      countA: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      // 선택지2 선택 횟수
      countB: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      // 생성자 타입(유저 or AI)
      creatorType: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'user',
      },
    };

    const gameTbl = {
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: `Game`,
      tableName: `games`,
      paranoid: false,
      charset: `utf8mb4`,
      collate: `utf8mb4_general_ci`,
    };

    return super.init(gameAttr, gameTbl);
  }

  static associate(db) {
    db.Game.belongsTo(db.User);
    db.Game.hasMany(db.Vote);
    db.Game.hasMany(db.Comment);
  }
}

module.exports = Game;
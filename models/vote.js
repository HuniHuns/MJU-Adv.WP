const Sequelize = require('sequelize');

class Vote extends Sequelize.Model {
  static init(sequelize) {
    const voteAttr = {
      // 선택한 선택지
      choice: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
    };

    const voteTbl = {
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: `Vote`,
      tableName: `votes`,
      paranoid: false,
      charset: `utf8mb4`,
      collate: `utf8mb4_general_ci`,
      indexes: [
        {
          unique: true,
          fields: ['GameId', 'UserId'],
        },
      ],
    };

    return super.init(voteAttr, voteTbl);
  }

  static associate(db) {
    db.Vote.belongsTo(db.User);
    db.Vote.belongsTo(db.Game);
  }
}

module.exports = Vote;
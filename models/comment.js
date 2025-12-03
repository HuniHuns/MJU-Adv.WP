const Sequelize = require('sequelize');

class Comment extends Sequelize.Model {
  static init(sequelize) {
    const commentAttr = {
      // 댓글 내용
      content: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      // 선택한 선택지
      choice: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
    };

    const commentTbl = {
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: `Comment`,
      tableName: `comments`,
      paranoid: false,
      charset: `utf8mb4`,
      collate: `utf8mb4_general_ci`,
    };

    return super.init(commentAttr, commentTbl);
  }

  static associate(db) {
    db.Comment.belongsTo(db.User);
    db.Comment.belongsTo(db.Game);
  }
}

module.exports = Comment;
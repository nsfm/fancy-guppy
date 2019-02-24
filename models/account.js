'use strict';

const name = 'Account';

module.exports = {
  name,
  schema: (sequelize, DataTypes) => {
    return sequelize.define(
      name,
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
          autoIncrement: false,
          validate: {
            isUUID: 4
          }
        },
        username: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            is: /^(?=.{3,36}$)[a-z0-9\_\-\#\@\.\$\!\^\?\{\}\~\|\[\]]+$/,
            len: [3, 36]
          }
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            len: [6, 72],
            isEmail: true
          }
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            len: [6, 72]
          }
        },
        permissions: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          validate: {
            isInt: true,
            min: 0
          }
        }
      },
      { comment: 'User details and login information.' }
    );
  }
};

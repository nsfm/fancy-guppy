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
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true
          }
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false
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

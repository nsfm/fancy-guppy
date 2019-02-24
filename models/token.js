'use strict';

const name = 'Token';

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
        account: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
          validate: {
            isUUID: 4
          },
          references: { model: 'Accounts', key: 'id' }
        },
        revoked: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        signing_key_hash: {
          type: DataTypes.STRING,
          allowNull: false
        },
        expires_at: {
          type: DataTypes.DATE,
          allowNull: true
        },
        created_at: {
          type: DataTypes.DATE
        },
        updated_at: {
          type: DataTypes.DATE
        }
      },
      { comment: 'Records of API access tokens.' }
    );
  }
};

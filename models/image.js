'use strict';

const name = 'Image';

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
        short_url: {
          type: DataTypes.STRING,
          allowNull: false
        },
        created_at: {
          type: DataTypes.DATE
        },
        updated_at: {
          type: DataTypes.DATE
        }
      },
      { comment: 'Records host images.' }
    );
  }
};

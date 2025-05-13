module.exports = (sequelize, DataTypes) => {
    const Return = sequelize.define("Return", {
        returnID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        arsyeja: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    Return.associate = (models) => {
        Return.belongsTo(models.Order, {
            foreignKey: {
                name: 'returnOrderID',
                allowNull: false
            },
            onDelete: 'CASCADE'
        });
        models.Order.hasMany(Return, { foreignKey: 'returnOrderID' });
    };

    return Return;
};
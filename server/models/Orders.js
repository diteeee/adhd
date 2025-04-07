module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define("Order", {
        orderID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        totalPrice: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    Order.associate = (models) => {
        Order.belongsTo(models.User, {
            foreignKey: {
                name: 'orderUserID',
                allowNull: false
            },
            onDelete: 'CASCADE'
        });
        models.User.hasMany(Order, { foreignKey: 'orderUserID' });
    };

    return Order;
};
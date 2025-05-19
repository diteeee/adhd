module.exports = (sequelize, DataTypes) => {
    const OrderItem = sequelize.define("OrderItem", {
        orderItemID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        sasia: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cmimi: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    OrderItem.associate = (models) => {
        OrderItem.belongsTo(models.Order, {
            foreignKey: {
                name: 'orderItemOrderID',
                allowNull: false
            },
            onDelete: 'CASCADE'
        });
        models.Order.hasMany(OrderItem, { foreignKey: 'orderItemOrderID' });

       OrderItem.belongsTo(models.ProductVariant, {
            foreignKey: {
                name: 'orderItemProductVariantID',  // Linking to ProductVariant
                allowNull: false
            },
            onDelete: 'CASCADE'
        });
        models.ProductVariant.hasMany(OrderItem, { foreignKey: 'orderItemProductVariantID' });
    };

    return OrderItem;
};
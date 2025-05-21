module.exports = (sequelize, DataTypes) => {
    const Cart = sequelize.define("Cart", {
        cartID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        sasia: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    Cart.associate = (models) => {
        Cart.belongsTo(models.User, {
            foreignKey: {
                name: 'cartUserID',
                allowNull: false
            },
            onDelete: 'CASCADE'
        });
        models.User.hasMany(Cart, { foreignKey: 'cartUserID' });

        Cart.belongsTo(models.ProductVariant, {
            foreignKey: {
                name: 'cartProductVariantID',
                allowNull: false
            },
            onDelete: 'CASCADE'
        });
        models.ProductVariant.hasMany(Cart, { foreignKey: 'cartProductVariantID' });
    };

    return Cart;
};
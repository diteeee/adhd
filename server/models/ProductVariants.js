module.exports = (sequelize, DataTypes) => {
    const ProductVariant = sequelize.define("ProductVariant", {
        productVariantID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        shade: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        numri: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        inStock: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    ProductVariant.associate = (models) => {

        ProductVariant.belongsTo(models.Product, {
            foreignKey: {
                name: 'productVariantProductID',
                allowNull: false
            },
            onDelete: 'CASCADE'
        });
        models.Product.hasMany(ProductVariant, { foreignKey: 'productVariantProductID' });
    };

    return ProductVariant;
};
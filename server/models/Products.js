module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define("Product", {
        productID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        emri: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        pershkrimi: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        brandID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
            model: "Brands",
            key: "brandID",
            },
        },
        cmimi: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        imageURL: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    Product.associate = (models) => {
        Product.belongsTo(models.Category, {
            foreignKey: {
                name: 'productCategoryID',
                allowNull: false
            },
            onDelete: 'CASCADE'
        });
        models.Category.hasMany(Product, { foreignKey: 'productCategoryID' });
        Product.belongsTo(models.Brand, { foreignKey: 'brandID' });
    };

    return Product;
};
module.exports = (sequelize, DataTypes) => {
    const Wishlist = sequelize.define("Wishlist", {
        wishlistID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
    });

    Wishlist.associate = (models) => {
        Wishlist.belongsTo(models.User, {
            foreignKey: {
                name: 'wishlistUserID',
                allowNull: false
            },
            onDelete: 'CASCADE'
        });
        models.User.hasMany(Wishlist, { foreignKey: 'wishlistUserID' });

        Wishlist.belongsTo(models.Product, {
            foreignKey: {
                name: 'wishlistProductID',
                allowNull: false
            },
            onDelete: 'CASCADE'
        });
        models.Product.hasMany(Wishlist, { foreignKey: 'wishlistProductID' });
    };

    return Wishlist;
};
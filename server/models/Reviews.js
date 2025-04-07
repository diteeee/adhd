module.exports = (sequelize, DataTypes) => {
    const Review = sequelize.define("Review", {
        reviewID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        rating: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        koment: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    Review.associate = (models) => {
        Review.belongsTo(models.User, {
            foreignKey: {
                name: 'reviewUserID',
                allowNull: false
            },
            onDelete: 'CASCADE'
        });
        models.User.hasMany(Review, { foreignKey: 'reviewUserID' });

        Review.belongsTo(models.Product, {
            foreignKey: {
                name: 'reviewProductID',
                allowNull: false
            },
            onDelete: 'CASCADE'
        });
        models.Product.hasMany(Review, { foreignKey: 'reviewProductID' });
    };

    return Review;
};
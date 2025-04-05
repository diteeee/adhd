module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define("Category", {
        categoryID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        emri: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    return Category;
};
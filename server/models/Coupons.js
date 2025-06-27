module.exports = (sequelize, DataTypes) => {
    const Coupon = sequelize.define("Coupon", {
        couponID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        kodi: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        shuma: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    return Coupon;
};
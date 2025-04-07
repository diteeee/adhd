module.exports = (sequelize, DataTypes) => {
    const Payment = sequelize.define("Payment", {
        paymentID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        metoda: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        data: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    Payment.associate = (models) => {
        Payment.belongsTo(models.Order, {
            foreignKey: {
                name: 'paymentOrderID',
                allowNull: false
            },
            onDelete: 'CASCADE'
        });
        models.Order.hasMany(Payment, { foreignKey: 'paymentOrderID' });
    };

    return Payment;
};
module.exports = (sequelize, DataTypes) => {
    const Address = sequelize.define("Address", {
        addressID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        rruga: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        qyteti: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        zipCode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        shteti: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    });

    Address.associate = (models) => {
        Address.belongsTo(models.User, {
            foreignKey: {
                name: 'addressUserID',
                allowNull: false
            },
            onDelete: 'CASCADE'
        });
        models.User.hasMany(Address, { foreignKey: 'addressUserID' });
    };

    return Address;
};
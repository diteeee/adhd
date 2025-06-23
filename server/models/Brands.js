module.exports = (sequelize, DataTypes) => {
  const Brand = sequelize.define("Brand", {
    brandID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  });

  Brand.associate = (models) => {
    Brand.hasMany(models.Product, {
      foreignKey: {
        name: 'brandID',
        allowNull: false,
      },
      onDelete: 'CASCADE',
    });
  };

  return Brand;
};
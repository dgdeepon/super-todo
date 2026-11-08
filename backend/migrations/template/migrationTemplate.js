module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      // add your migration sql commands here
      `);
  },

  async down(queryInterface, Sequelize) {},
};

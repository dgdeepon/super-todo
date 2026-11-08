'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE tasks 
        CHANGE COLUMN time start_time TIME NOT NULL,
        ADD COLUMN end_time TIME NOT NULL DEFAULT '00:00:00' AFTER start_time;
    `);
  },

  async down(queryInterface, Sequelize) {}
};

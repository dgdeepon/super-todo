
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        auth_id CHAR(36) NOT NULL,
        title VARCHAR(100) NOT NULL,
        description VARCHAR(500) DEFAULT NULL,
        priority ENUM('low', 'medium', 'high') NOT NULL,
        status ENUM('in_progress', 'completed') NOT NULL DEFAULT 'in_progress',
        date DATETIME NOT NULL,
        time TIME NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,

        INDEX idx_tasks_auth_id (auth_id),
        INDEX idx_tasks_date (date),

        CONSTRAINT fk_tasks_auth_id
          FOREIGN KEY (auth_id)
          REFERENCES auth(id)
          ON UPDATE CASCADE
          ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
  },

  async down(queryInterface, Sequelize) {},
};

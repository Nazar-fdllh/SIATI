/**
 * Migration: Create users table
 */
exports.up = async function (knex) {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('email', 100).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.uuid('role_id').notNullable().references('id').inTable('roles');
    table.boolean('is_active').defaultTo(true);
    table.text('refresh_token');
    table.timestamp('refresh_token_expires_at');
    table.timestamp('last_login');
    table.timestamp('password_changed_at');
    table.integer('failed_login_attempts').defaultTo(0);
    table.timestamp('locked_until');
    table.timestamps(true, true);
  });

  // Indexes
  await knex.raw('CREATE INDEX idx_users_email ON users(email)');
  await knex.raw('CREATE INDEX idx_users_role ON users(role_id)');
  await knex.raw('CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = TRUE');
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('users');
};

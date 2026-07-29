/**
 * Migration: Create departments, positions, shifts tables
 */
exports.up = async function (knex) {
  // Departments
  await knex.schema.createTable('departments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name', 100).notNullable().unique();
    table.string('code', 20).notNullable().unique();
    table.string('description', 255);
    table.uuid('head_id'); // FK added after employees table
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Positions
  await knex.schema.createTable('positions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name', 100).notNullable().unique();
    table.string('level', 20); // staff, senior, lead, manager, director
    table.string('description', 255);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Shifts
  await knex.schema.createTable('shifts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name', 50).notNullable();
    table.time('start_time').notNullable();
    table.time('end_time').notNullable();
    table.integer('tolerance_minutes').defaultTo(15);
    table.integer('break_duration_minutes').defaultTo(60);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('shifts');
  await knex.schema.dropTableIfExists('positions');
  await knex.schema.dropTableIfExists('departments');
};

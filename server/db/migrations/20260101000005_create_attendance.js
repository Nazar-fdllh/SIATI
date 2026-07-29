/**
 * Migration: Create attendance and attendance_photos tables
 */
exports.up = async function (knex) {
  await knex.schema.createTable('attendance', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.date('attendance_date').notNullable();
    table.timestamp('check_in_time');
    table.timestamp('check_out_time');
    table.specificType('status', 'attendance_status').notNullable().defaultTo('present');
    table.decimal('check_in_lat', 10, 8);
    table.decimal('check_in_lng', 11, 8);
    table.decimal('check_out_lat', 10, 8);
    table.decimal('check_out_lng', 11, 8);
    table.specificType('check_in_ip', 'inet');
    table.specificType('check_out_ip', 'inet');
    table.boolean('is_valid_location').defaultTo(true);
    table.integer('work_duration_minutes').defaultTo(0);
    table.integer('overtime_minutes').defaultTo(0);
    table.text('notes');
    table.uuid('created_by').references('id').inTable('users');
    table.uuid('updated_by').references('id').inTable('users');
    table.timestamps(true, true);
    table.unique(['employee_id', 'attendance_date']);
  });

  await knex.schema.createTable('attendance_photos', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('attendance_id').notNullable().references('id').inTable('attendance').onDelete('CASCADE');
    table.specificType('photo_type', 'photo_type').notNullable();
    table.string('photo_url', 500).notNullable();
    table.integer('file_size');
    table.timestamp('captured_at').defaultTo(knex.fn.now());
  });

  // Performance indexes
  await knex.raw('CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, attendance_date DESC)');
  await knex.raw('CREATE INDEX idx_attendance_date ON attendance(attendance_date)');
  await knex.raw('CREATE INDEX idx_attendance_status ON attendance(status)');
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('attendance_photos');
  await knex.schema.dropTableIfExists('attendance');
};

/**
 * Migration: Create supporting tables (work_schedules, holidays, notifications, audit_logs, system_config)
 */
exports.up = async function (knex) {
  // Work Schedules
  await knex.schema.createTable('work_schedules', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.uuid('shift_id').notNullable().references('id').inTable('shifts');
    table.date('schedule_date').notNullable();
    table.boolean('is_off_day').defaultTo(false);
    table.string('notes', 255);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.unique(['employee_id', 'schedule_date']);
  });

  // Holidays
  await knex.schema.createTable('holidays', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name', 100).notNullable();
    table.date('holiday_date').notNullable();
    table.specificType('type', 'holiday_type').notNullable().defaultTo('national');
    table.boolean('is_recurring').defaultTo(false);
    table.integer('year').notNullable();
    table.string('description', 255);
    table.timestamps(true, true);
    table.unique(['holiday_date', 'name']);
  });

  // Notifications
  await knex.schema.createTable('notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.specificType('type', 'notification_type').notNullable();
    table.string('title', 200).notNullable();
    table.text('message').notNullable();
    table.string('link', 500);
    table.boolean('is_read').defaultTo(false);
    table.timestamp('read_at');
    table.jsonb('metadata').defaultTo('{}');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Audit Logs
  await knex.schema.createTable('audit_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('action', 50).notNullable();
    table.string('module', 50).notNullable();
    table.string('entity_type', 50);
    table.uuid('entity_id');
    table.jsonb('old_values');
    table.jsonb('new_values');
    table.specificType('ip_address', 'inet');
    table.string('user_agent', 500);
    table.text('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // System Configuration
  await knex.schema.createTable('system_config', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('key', 100).notNullable().unique();
    table.text('value').notNullable();
    table.string('description', 255);
    table.uuid('updated_by').references('id').inTable('users');
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Indexes
  await knex.raw('CREATE INDEX idx_schedule_employee_date ON work_schedules(employee_id, schedule_date)');
  await knex.raw('CREATE INDEX idx_holidays_date ON holidays(holiday_date)');
  await knex.raw('CREATE INDEX idx_holidays_year ON holidays(year)');
  await knex.raw('CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC)');
  await knex.raw('CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = FALSE');
  await knex.raw('CREATE INDEX idx_audit_user ON audit_logs(user_id)');
  await knex.raw('CREATE INDEX idx_audit_module ON audit_logs(module, created_at DESC)');
  await knex.raw('CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id)');
  await knex.raw('CREATE INDEX idx_audit_created ON audit_logs(created_at DESC)');
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('system_config');
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('notifications');
  await knex.schema.dropTableIfExists('holidays');
  await knex.schema.dropTableIfExists('work_schedules');
};

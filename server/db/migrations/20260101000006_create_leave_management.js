/**
 * Migration: Create leave management tables
 */
exports.up = async function (knex) {
  // Leave Types
  await knex.schema.createTable('leave_types', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name', 50).notNullable().unique();
    table.string('code', 10).notNullable().unique();
    table.integer('default_balance').notNullable().defaultTo(12);
    table.boolean('is_paid').defaultTo(true);
    table.boolean('requires_document').defaultTo(false);
    table.boolean('allow_half_day').defaultTo(false);
    table.integer('max_consecutive_days');
    table.boolean('is_active').defaultTo(true);
    table.string('description', 255);
    table.timestamps(true, true);
  });

  // Leave Requests
  await knex.schema.createTable('leave_requests', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.uuid('leave_type_id').notNullable().references('id').inTable('leave_types');
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.decimal('total_days', 3, 1).notNullable();
    table.specificType('status', 'leave_request_status').defaultTo('pending');
    table.text('reason').notNullable();
    table.specificType('urgency', 'urgency_type').defaultTo('normal');
    table.uuid('current_approver_id').references('id').inTable('employees');
    table.integer('approval_level').defaultTo(1);
    table.uuid('delegate_to').references('id').inTable('employees');
    table.timestamps(true, true);
  });
  await knex.raw('ALTER TABLE leave_requests ADD CONSTRAINT chk_date_range CHECK (end_date >= start_date)');
  await knex.raw('ALTER TABLE leave_requests ADD CONSTRAINT chk_total_days CHECK (total_days > 0)');

  // Leave Documents
  await knex.schema.createTable('leave_documents', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('leave_request_id').notNullable().references('id').inTable('leave_requests').onDelete('CASCADE');
    table.string('file_name', 255).notNullable();
    table.string('file_url', 500).notNullable();
    table.string('file_type', 50);
    table.integer('file_size');
    table.timestamp('uploaded_at').defaultTo(knex.fn.now());
  });

  // Leave Balances
  await knex.schema.createTable('leave_balances', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.uuid('leave_type_id').notNullable().references('id').inTable('leave_types');
    table.integer('year').notNullable();
    table.integer('total_balance').notNullable().defaultTo(0);
    table.decimal('used', 4, 1).notNullable().defaultTo(0);
    table.decimal('remaining', 4, 1).notNullable().defaultTo(0);
    table.integer('carried_over').notNullable().defaultTo(0);
    table.date('expires_at');
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.unique(['employee_id', 'leave_type_id', 'year']);
  });

  // Approvals
  await knex.schema.createTable('approvals', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('leave_request_id').notNullable().references('id').inTable('leave_requests').onDelete('CASCADE');
    table.uuid('approver_id').notNullable().references('id').inTable('employees');
    table.integer('approval_order').notNullable().defaultTo(1);
    table.specificType('status', 'approval_status').defaultTo('pending');
    table.text('remarks');
    table.timestamp('acted_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.unique(['leave_request_id', 'approver_id', 'approval_order']);
  });

  // Indexes
  await knex.raw('CREATE INDEX idx_leave_employee ON leave_requests(employee_id)');
  await knex.raw('CREATE INDEX idx_leave_status ON leave_requests(status)');
  await knex.raw('CREATE INDEX idx_leave_dates ON leave_requests(start_date, end_date)');
  await knex.raw(`CREATE INDEX idx_leave_approver ON leave_requests(current_approver_id) WHERE status IN ('pending', 'approved_l1')`);
  await knex.raw('CREATE INDEX idx_approvals_request ON approvals(leave_request_id)');
  await knex.raw('CREATE INDEX idx_approvals_approver ON approvals(approver_id, status)');
  await knex.raw('CREATE INDEX idx_balance_employee_year ON leave_balances(employee_id, year)');
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('approvals');
  await knex.schema.dropTableIfExists('leave_balances');
  await knex.schema.dropTableIfExists('leave_documents');
  await knex.schema.dropTableIfExists('leave_requests');
  await knex.schema.dropTableIfExists('leave_types');
};

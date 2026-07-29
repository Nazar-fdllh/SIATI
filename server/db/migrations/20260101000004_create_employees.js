/**
 * Migration: Create employees table
 */
exports.up = async function (knex) {
  await knex.schema.createTable('employees', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').unique().references('id').inTable('users').onDelete('SET NULL');
    table.string('employee_code', 20).notNullable().unique();
    table.string('full_name', 100).notNullable();
    table.string('nickname', 50);
    table.string('phone', 20);
    table.string('emergency_contact_name', 100);
    table.string('emergency_contact_phone', 20);
    table.date('birth_date');
    table.specificType('gender', 'gender_type');
    table.text('address');
    table.uuid('department_id').references('id').inTable('departments');
    table.uuid('position_id').references('id').inTable('positions');
    table.uuid('shift_id').references('id').inTable('shifts');
    table.uuid('supervisor_id').references('id').inTable('employees');
    table.specificType('employment_status', 'employment_status').defaultTo('active');
    table.date('join_date').notNullable();
    table.date('resign_date');
    table.string('photo_url', 500);
    table.jsonb('metadata').defaultTo('{}');
    table.timestamps(true, true);
  });

  // Add deferred FK for department head
  await knex.raw(`
    ALTER TABLE departments ADD CONSTRAINT fk_dept_head
    FOREIGN KEY (head_id) REFERENCES employees(id) ON DELETE SET NULL
  `);

  // Indexes
  await knex.raw('CREATE INDEX idx_employees_user ON employees(user_id)');
  await knex.raw('CREATE INDEX idx_employees_dept ON employees(department_id)');
  await knex.raw('CREATE INDEX idx_employees_position ON employees(position_id)');
  await knex.raw('CREATE INDEX idx_employees_supervisor ON employees(supervisor_id)');
  await knex.raw('CREATE INDEX idx_employees_status ON employees(employment_status)');
  await knex.raw('CREATE INDEX idx_employees_code ON employees(employee_code)');
};

exports.down = async function (knex) {
  await knex.raw('ALTER TABLE departments DROP CONSTRAINT IF EXISTS fk_dept_head');
  await knex.schema.dropTableIfExists('employees');
};

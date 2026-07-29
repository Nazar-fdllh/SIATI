/**
 * Migration: Create roles and permissions tables
 */
exports.up = async function (knex) {
  // Create ENUM types
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE employment_status AS ENUM ('active', 'probation', 'contract', 'resigned', 'terminated');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `);
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE gender_type AS ENUM ('male', 'female');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `);
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE attendance_status AS ENUM ('present', 'late', 'sick', 'permit', 'leave', 'wfh', 'business_trip', 'absent');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `);
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE leave_request_status AS ENUM ('draft', 'pending', 'approved_l1', 'approved', 'rejected', 'cancelled');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `);
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `);
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE notification_type AS ENUM ('attendance', 'leave_request', 'leave_approval', 'system', 'reminder');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `);
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE holiday_type AS ENUM ('national', 'company', 'collective_leave');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `);
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE photo_type AS ENUM ('check_in', 'check_out');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `);
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE urgency_type AS ENUM ('normal', 'urgent');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `);

  // Enable UUID extension
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // Roles
  await knex.schema.createTable('roles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name', 50).notNullable().unique();
    table.string('description', 255);
    table.boolean('is_system').defaultTo(false);
    table.timestamps(true, true);
  });

  // Permissions
  await knex.schema.createTable('permissions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('code', 100).notNullable().unique();
    table.string('name', 100).notNullable();
    table.string('module', 50).notNullable();
    table.string('description', 255);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Role-Permission join table
  await knex.schema.createTable('role_permissions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('role_id').notNullable().references('id').inTable('roles').onDelete('CASCADE');
    table.uuid('permission_id').notNullable().references('id').inTable('permissions').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.unique(['role_id', 'permission_id']);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('role_permissions');
  await knex.schema.dropTableIfExists('permissions');
  await knex.schema.dropTableIfExists('roles');
};

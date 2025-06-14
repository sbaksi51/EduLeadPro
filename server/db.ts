import * as schema from "../shared/schema";

type TableName = 'users' | 'leads' | 'followUps' | 'leadSources' | 'staff' | 
  'attendance' | 'payroll' | 'expenses' | 'students' | 'feeStructure' | 
  'feePayments' | 'eMandates' | 'emiSchedule';

// Simple in-memory database
const db: Record<TableName, Map<string, any>> = {
  users: new Map(),
  leads: new Map(),
  followUps: new Map(),
  leadSources: new Map(),
  staff: new Map(),
  attendance: new Map(),
  payroll: new Map(),
  expenses: new Map(),
  students: new Map(),
  feeStructure: new Map(),
  feePayments: new Map(),
  eMandates: new Map(),
  emiSchedule: new Map(),
};

// Helper functions to simulate database operations
const dbHelper = {
  insert: (table: TableName, data: any) => {
    const id = Date.now().toString();
    const record = { id, ...data };
    db[table].set(id, record);
    return record;
  },
  find: (table: TableName, id: string) => {
    return db[table].get(id);
  },
  findAll: (table: TableName) => {
    return Array.from(db[table].values());
  },
  update: (table: TableName, id: string, data: any) => {
    const record = db[table].get(id);
    if (record) {
      const updated = { ...record, ...data };
      db[table].set(id, updated);
      return updated;
    }
    return null;
  },
  delete: (table: TableName, id: string) => {
    return db[table].delete(id);
  }
};

// Create a drizzle-like interface
export const drizzleDb = {
  insert: dbHelper.insert,
  find: dbHelper.find,
  findAll: dbHelper.findAll,
  update: dbHelper.update,
  delete: dbHelper.delete,
};

export { dbHelper as db };
import { db } from './db';
import { sql } from 'drizzle-orm';

async function initializeDatabase() {
  try {
    console.log('Checking if global_class_fees table exists...');
    
    // Check if table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'global_class_fees'
      );
    `);
    
    console.log('Table exists:', tableExists[0]?.exists);
    
    if (!tableExists[0]?.exists) {
      console.log('Creating global_class_fees table...');
      
      // Create the table
      await db.execute(sql`
        CREATE TABLE global_class_fees (
          id SERIAL PRIMARY KEY,
          class_name VARCHAR(20) NOT NULL,
          fee_type VARCHAR(50) NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          frequency VARCHAR(20) NOT NULL,
          academic_year VARCHAR(20) NOT NULL,
          description TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `);
      
      // Create indexes
      await db.execute(sql`
        CREATE INDEX idx_global_class_fees_class_name ON global_class_fees(class_name);
        CREATE INDEX idx_global_class_fees_academic_year ON global_class_fees(academic_year);
        CREATE INDEX idx_global_class_fees_active ON global_class_fees(is_active);
      `);
      
      // Insert sample data
      await db.execute(sql`
        INSERT INTO global_class_fees (class_name, fee_type, amount, frequency, academic_year, description, is_active) VALUES
        ('Class 10', 'tuition', 5000.00, 'monthly', '2024-25', 'Monthly tuition fee for Class 10', true),
        ('Class 10', 'admission', 15000.00, 'one-time', '2024-25', 'One-time admission fee for Class 10', true),
        ('Class 11', 'tuition', 6000.00, 'monthly', '2024-25', 'Monthly tuition fee for Class 11', true),
        ('Class 12', 'tuition', 7000.00, 'monthly', '2024-25', 'Monthly tuition fee for Class 12', true);
      `);
      
      console.log('Global class fees table created successfully with sample data');
    } else {
      console.log('Global class fees table already exists');
    }
    
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Run initialization
initializeDatabase(); 
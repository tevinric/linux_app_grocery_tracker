-- ==========================================
-- PostgreSQL Initialization Script for Grocery Tracker
-- ==========================================
-- This script creates users, database, and tables
-- NOTE: This script runs only once when the database is first created
--
-- IMPORTANT: The app_user password MUST match DB_PASSWORD in your .env file
-- Default password is 'app_password' - change this in production!
-- To change the password after initialization, connect as admin and run:
-- ALTER USER app_user WITH PASSWORD 'your_new_password';

-- Create application user (limited privileges)
CREATE USER app_user WITH PASSWORD 'app_password';

-- Grant connection privileges to the database
GRANT CONNECT ON DATABASE grocery_db TO app_user;

-- Create grocery_items table
CREATE TABLE IF NOT EXISTS grocery_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on quantity for faster low-stock queries
CREATE INDEX idx_quantity ON grocery_items(quantity);

-- Grant privileges to app_user
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE grocery_items TO app_user;
GRANT USAGE, SELECT ON SEQUENCE grocery_items_id_seq TO app_user;

-- Insert some sample data for testing
INSERT INTO grocery_items (name, description, quantity) VALUES
('Milk', 'Whole milk, 1 gallon', 1),
('Bread', 'Whole wheat bread', 2),
('Eggs', 'Large eggs, dozen', 5),
('Butter', 'Unsalted butter', 3),
('Cheese', 'Cheddar cheese block', 1),
('Apples', 'Red delicious apples', 8),
('Bananas', 'Fresh bananas', 6),
('Chicken Breast', 'Boneless skinless chicken breast', 0),
('Rice', '5 lb bag of white rice', 2),
('Pasta', 'Spaghetti pasta', 4);

-- Admin user is already created as POSTGRES_USER in docker-compose
-- The 'admin' user has full superuser privileges

-- Display confirmation
SELECT 'Database initialized successfully!' as status;
SELECT 'Admin user: admin (superuser)' as user_info;
SELECT 'App user: app_user (limited privileges)' as user_info;

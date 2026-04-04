CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  university VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  level VARCHAR(50),
  category VARCHAR(100) NOT NULL,
  team_name VARCHAR(100),
  registration_id VARCHAR(50) UNIQUE,
  amount_paid INTEGER DEFAULT 200000,  -- in kobo (₦2000)
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_reference VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ambassadors (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  university VARCHAR(100) NOT NULL,
  level VARCHAR(50),
  portfolio_url TEXT,
  why_represent TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  registration_id INTEGER REFERENCES registrations(id),
  reference VARCHAR(100) UNIQUE,
  amount INTEGER,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
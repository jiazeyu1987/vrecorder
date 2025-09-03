-- Creating all required database tables for healthcare recorder app

-- Users table for record keepers, doctors, administrators
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    role VARCHAR(20) DEFAULT 'recorder', -- recorder, doctor, admin
    status VARCHAR(20) DEFAULT 'active', -- active, inactive
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Families table for household units
CREATE TABLE IF NOT EXISTS families (
    id SERIAL PRIMARY KEY,
    family_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    district VARCHAR(50),
    contact_phone VARCHAR(20),
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients table for individual family members
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    family_id INTEGER REFERENCES families(id),
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(10),
    birth_date DATE,
    id_number VARCHAR(50),
    phone VARCHAR(20),
    relationship VARCHAR(50), -- 户主, 配偶, 子女, 父母等
    medical_conditions TEXT,
    allergies TEXT,
    medications TEXT,
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service types and packages
CREATE TABLE IF NOT EXISTS service_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    duration_minutes INTEGER,
    price DECIMAL(10,2),
    category VARCHAR(50), -- 基础护理, 专业护理, 康复训练等
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table for scheduled services
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    recorder_id INTEGER REFERENCES users(id),
    service_type_id INTEGER REFERENCES service_types(id),
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled, rescheduled
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, overdue, refunded
    payment_method VARCHAR(20), -- wechat, alipay, cash, bank_card
    amount DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Health records for service documentation
CREATE TABLE IF NOT EXISTS health_records (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id),
    patient_id INTEGER REFERENCES patients(id),
    recorder_id INTEGER REFERENCES users(id),
    service_date DATE NOT NULL,
    vital_signs JSONB, -- {"blood_pressure": "120/80", "heart_rate": 72, "temperature": 36.5}
    symptoms TEXT,
    observations TEXT,
    treatments TEXT,
    medications_given TEXT,
    photos TEXT[], -- array of photo URLs
    audio_recordings TEXT[], -- array of audio URLs
    doctor_notes TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment transactions
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id),
    patient_id INTEGER REFERENCES patients(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending',
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP,
    refund_amount DECIMAL(10,2) DEFAULT 0,
    refund_date TIMESTAMP,
    refund_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications and alerts
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50) NOT NULL, -- appointment_reminder, payment_overdue, emergency, system
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    read_status BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- File attachments for photos and audio
CREATE TABLE IF NOT EXISTS file_attachments (
    id SERIAL PRIMARY KEY,
    record_id INTEGER REFERENCES health_records(id),
    file_type VARCHAR(20) NOT NULL, -- photo, audio, document
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs for tracking changes
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL, -- create, update, delete
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

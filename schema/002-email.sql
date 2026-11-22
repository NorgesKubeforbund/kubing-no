ALTER TABLE users RENAME COLUMN email TO wca_email;
ALTER TABLE users ADD COLUMN contact_email VARCHAR(150);

CREATE TABLE IF NOT EXISTS unconfirmed_contact_emails (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    email VARCHAR(150) NOT NULL,
    verification_code UUID NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS emails (
    id SERIAL PRIMARY KEY,
    subject VARCHAR(200) NOT NULL,
    norwegian_message TEXT NOT NULL,
    english_message TEXT,
    membership_year INTEGER,
    status VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_batches (
    id UUID PRIMARY KEY,
    email_id INTEGER NOT NULL,
    emails_payload JSONB NOT NULL,
    status VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE
);

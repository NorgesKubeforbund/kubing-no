ALTER TABLE users RENAME COLUMN email TO wca_email;
ALTER TABLE users ADD COLUMN contact_email VARCHAR(150);

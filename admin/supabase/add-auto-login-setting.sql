-- Tambah kolom auto_login_enabled ke company_settings
-- Default true agar perilaku saat ini (auto-login aktif) tetap terjaga.
ALTER TABLE company_settings
ADD COLUMN IF NOT EXISTS auto_login_enabled BOOLEAN NOT NULL DEFAULT true;

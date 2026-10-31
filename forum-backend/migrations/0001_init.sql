CREATE TABLE IF NOT EXISTS complaints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('player','staff','appeal')),
  nickname TEXT NOT NULL,
  target TEXT NOT NULL,
  rule TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL,
  details TEXT NOT NULL,
  evidence TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','open','review','closed','rejected')),
  public INTEGER NOT NULL DEFAULT 0 CHECK(public IN (0,1)),
  reply TEXT NOT NULL DEFAULT '',
  receipt_hash TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_complaints_public_created ON complaints(public,created_at DESC);
CREATE TABLE IF NOT EXISTS rate_limits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_limits_ip_time ON rate_limits(ip_hash,created_at);

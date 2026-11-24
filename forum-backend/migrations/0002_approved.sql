CREATE TABLE complaints_v2 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('player','staff','appeal')),
  nickname TEXT NOT NULL,
  target TEXT NOT NULL,
  rule TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL,
  details TEXT NOT NULL,
  evidence TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','open','review','closed','rejected','approved')),
  public INTEGER NOT NULL DEFAULT 0 CHECK(public IN (0,1)),
  reply TEXT NOT NULL DEFAULT '',
  receipt_hash TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  approved_at INTEGER
);
INSERT INTO complaints_v2 (id,type,nickname,target,rule,subject,details,evidence,state,public,reply,receipt_hash,created_at,updated_at) SELECT id,type,nickname,target,rule,subject,details,evidence,state,public,reply,receipt_hash,created_at,updated_at FROM complaints;
UPDATE sqlite_sequence SET seq=MAX(seq,COALESCE((SELECT seq FROM sqlite_sequence WHERE name='complaints'),0)) WHERE name='complaints_v2';
DROP TABLE complaints;
ALTER TABLE complaints_v2 RENAME TO complaints;
CREATE INDEX idx_complaints_public_created ON complaints(public,created_at DESC);
CREATE INDEX idx_complaints_approved_at ON complaints(state,approved_at);

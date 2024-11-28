CREATE TABLE IF NOT EXISTS supplies (
    id INTEGER PRIMARY KEY,
    item TEXT,
    item_variety TEXT,
    qty INTEGER,
    date_purchased TEXT,
    cost REAL,
    remind_after INTEGER,
    reminder_flag BOOLEAN,
    category TEXT,
    pack_size TEXT,
);

CREATE TABLE IF NOT EXISTS groceries (
    id INTEGER PRIMARY KEY,
    item TEXT,
    item_variety TEXT,
    qty INTEGER,
    date_purchased TEXT,
    cost REAL,
    remind_after INTEGER,
    reminder_flag BOOLEAN,
    category TEXT,
    pack_size TEXT,
);

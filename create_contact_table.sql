CREATE TABLE IF NOT EXISTS Contact ( -- Added IF NOT EXISTS
    id SERIAL PRIMARY KEY,
    phoneNumber VARCHAR(255),
    email VARCHAR(255),
    linkedId INTEGER REFERENCES Contact(id),
    linkPrecedence VARCHAR(20) CHECK (linkPrecedence IN ('primary', 'secondary')),
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_phone_number ON Contact (phoneNumber); -- Added IF NOT EXISTS
CREATE INDEX IF NOT EXISTS idx_email ON Contact (email); -- Added IF NOT EXISTS
CREATE INDEX IF NOT EXISTS idx_phone_email ON Contact (phoneNumber, email); -- Added IF NOT EXISTS

CREATE TABLE cards (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name TEXT NOT NULL,
    set_id INTEGER REFERENCES sets(id) ON DELETE CASCADE NOT NULL, 
    rarity TEXT NOT NULL,
    type TEXT NOT NULL
)
# Memento - Free video album

## Fake Database

The fake database includes 3 tables: `Users`, `Profiles`, `Albums`.

### Initialize MongoDB

1. Install MongoDB.
2. Start *mongodb* process by `mongod --dbpath=/data`.
3. Run `node db-init.js` to automatically drop the existing database and re-initialize the fake database.

### Default Data

Use the default accounts credentials to log in.

#### admin account

email: admin@memento.io

password: 11111111

#### user account

email: user@memento.io

password: 22222222

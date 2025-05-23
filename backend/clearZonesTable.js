const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('dev.sqlite3');

db.serialize(() => {
  // Delete all zones
  db.run("DELETE FROM zones", function(err) {
    if (err) {
      return console.error("Error clearing zones:", err.message);
    }
    console.log(`Cleared ${this.changes} zone record(s).`);
  });

  // Reset AUTOINCREMENT (optional)
  db.run("DELETE FROM sqlite_sequence WHERE name='zones';", err => {
    if (err) console.error("Error resetting sequence:", err.message);
  });

  // Optionally VACUUM to reclaim space:
  db.run("VACUUM;", err => {
    if (err) console.error("Error vacuuming DB:", err.message);
  });
});

db.close();

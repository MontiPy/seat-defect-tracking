const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('dev.sqlite3');

db.serialize(() => {
  // Delete all defects
  db.run("DELETE FROM defects", function(err) {
    if (err) {
      return console.error("Error clearing defects:", err.message);
    }
    console.log(`Cleared ${this.changes} defect record(s).`);
  });

  // Reset AUTOINCREMENT (optional)
  db.run("DELETE FROM sqlite_sequence WHERE name='defects';", err => {
    if (err) console.error("Error resetting sequence:", err.message);
  });

  // Optionally VACUUM to reclaim space:
  db.run("VACUUM;", err => {
    if (err) console.error("Error vacuuming DB:", err.message);
  });
});

db.close();

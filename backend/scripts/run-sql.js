// Simple script to show a row, perform an update, and show the row again
const sqlite3 = require('sqlite3').verbose();
const DB = 'database.sqlite';
const email = 'teodor.ivanov1608@gmail.com';
const sqlUpdate = `UPDATE users SET role='ADMIN' WHERE email=?`;
const db = new sqlite3.Database(DB, (err) => {
  if (err) return console.error('DB open error:', err.message);
});

function showRow(label, cb) {
  db.get('SELECT id, email, role, createdAt FROM users WHERE email = ?', [email], (err, row) => {
    if (err) return cb(err);
    console.log(`\n${label}:`);
    if (!row) console.log('  <no row found>');
    else console.log(`  id=${row.id} email=${row.email} role=${row.role} createdAt=${row.createdAt}`);
    cb(null, row);
  });
}

showRow('Before', (err) => {
  if (err) { console.error('SELECT error:', err); db.close(); process.exit(1); }
  db.run(sqlUpdate, [email], function (err) {
    if (err) { console.error('UPDATE error:', err); db.close(); process.exit(1); }
    console.log(`\nUPDATE executed, changed rows: ${this.changes}`);
    showRow('After', (err) => {
      if (err) console.error('SELECT error:', err);
      db.close();
    });
  });
});

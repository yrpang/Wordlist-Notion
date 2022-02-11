import mysql from 'mysql';

const connection = mysql.createConnection({
    host: '81.70.104.126',
    user: 'wordlist',
    password: 'Pang232202',
    database: 'wordlist'
});

// connection.connect(function (err) {
//     if (err) {
//         console.error('error connecting: ' + err.stack);
//         return;
//     }
// });

connection.query('SELECT * FROM users;', (error, results, fields) => {
    if (error) throw error;
    console.log(results[0]);
})

connection.end();

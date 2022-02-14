import mysql from 'mysql';
import crypto from 'crypto';
import { APIError } from './error.js';

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

async function createUser(userInfo) {
    if (!userInfo) throw Error('error');

    const { notion_token, youdao_id, youdao_token, database_id } = userInfo;

    if (!notion_token) throw EvalError('user_id error.');

    const user_id = crypto.randomUUID();
    const api_token = crypto.randomUUID();

    if (!youdao_id && !youdao_token) {
        return connection.query(`INSERT INTO users (USER_ID, NOTION_TOKEN, database_id, TOKEN) VALUES(?, ?, ?, ?)`,
            [user_id, notion_token, database_id, api_token], (error, results, fields) => {
                if (error) throw error;
                console.log(results);
            })
    } else if (youdao_id && youdao_token) {
        return connection.query(`INSERT INTO users (USER_ID, NOTION_TOKEN, YOUDAO_ID, YOUDAO_TOKEN, database_id, TOKEN) VALUES(?, ?, ?, ?, ?, ?)`,
            [user_id, notion_token, youdao_id, youdao_token, database_id, api_token], (error, results, fields) => {
                if (error) throw error;
                console.log(results);
            })
    } else {
        throw Error('youdao error.')
    }
}

async function getUser(api_token) {
    if (!api_token) throw new APIError('UserInfo', 'No api token');

    return new Promise((resolve, reject) => {
        connection.query("SELECT NOTION_TOKEN, YOUDAO_ID, YOUDAO_TOKEN, database_id FROM users WHERE TOKEN=?",
            [api_token], (error, results, fields) => {
                if (error) reject(error);
                if (results.length !== 1)
                    reject(new APIError('UserInfo', 'token is wrong'));
                else {
                    resolve(results[0])
                };
            })

    })
}

export { getUser };
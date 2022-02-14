import mysql from 'mysql';
import crypto from 'crypto';

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

async function getUser(userInfo) {
    if (!userInfo) throw Error('No userInfo');

    const { user_id, api_token } = userInfo;

    if (!api_token) throw Error('No api_token');

    return new Promise((resolve, reject) => {
        connection.query("SELECT NOTION_TOKEN, YOUDAO_ID, YOUDAO_TOKEN, database_id FROM users WHERE TOKEN=?",
            [api_token], (error, results, fields) => {
                if (error) reject(error);
                console.log(results);
                if (results.length == 0) resolve([]);
                else {
                    console.log(results[0]);
                    resolve(results[0])
                };
            })

    })
}


// try {
//     await createUser({
//         notion_token: 'secret_2um92ACUkFSLlLRKQjpkqnUzFZNpWkqTvRLTDIzxMc5',
//         database_id: '5fe6198ed109423b83b32b807c831e78',
//         youdao_id: '721e2adadc3e05f8',
//         youdao_token: 'zsMiLJQNXBxk18XvZI0pXAUUYFDhmNhD'
//     });
//     // const a = await getUser({ api_token: 'd4dd4410-6090-495e-b72e-958657be914e' });
//     // const { database_id, NOTION_TOKEN, YOUDAO_ID, YOUDAO_TOKEN } = a;

//     // console.log(database_id);
// } catch (e) {
//     console.error(e);
// }


export { getUser };
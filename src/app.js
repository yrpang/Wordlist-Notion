import express from 'express';
import { TranslationAPI, NotionAPI } from './wordlist.js'
import { APIError } from './error.js';
import axios from 'axios';
import { CONFIG } from './config.js';

const { YOUDAO_ID, YOUDAO_TOKEN, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET } = CONFIG;

const app = express()
const port = 9000

app.get('/api', async (req, res) => {
    const { token, database_id, word } = req.query;
    if (typeof token != 'string' || !token) {
        res.json({
            errCode: -1,
            errMsg: "Parameter 'token' is missing."
        });
        return;
    }
    if (typeof database_id != 'string' || !database_id) {
        res.json({
            errCode: -1,
            errMsg: "Parameter 'database_id' is missing."
        });
        return;
    }
    if (typeof word != 'string' || !word) {
        res.json({
            errCode: -1,
            errMsg: "Parameter 'word' is missing."
        });
        return;
    }

    try {
        // Get translation from youdao
        const trans = new TranslationAPI(YOUDAO_ID, YOUDAO_TOKEN);
        const transRes = await trans.getWordTrans(word);

        // Add word to Notion
        const wordLower = word.toLowerCase();
        const notion = new NotionAPI(token, database_id);
        await notion.addItem(wordLower, transRes);

        res.json({
            errCode: 0,
            errMsg: 'OK'
        });
    } catch (e) {
        if (e instanceof APIError) {
            console.error(e.toString());
            switch (e.type) {
                case 'Translation':
                    res.json({
                        errCode: -3,
                        errMsg: e.msg
                    })
                    return;
                case 'NotionAPI':
                    res.json({
                        errCode: -4,
                        errMsg: e.msg
                    })
                    return;
                case 'UserInfo':
                    res.json({
                        errCode: -5,
                        errMsg: e.msg
                    })
                    return;
                default:
                    res.json({
                        errCode: -6,
                        errMsg: e.msg
                    })
                    return;
            }
        } else {
            console.error(e);
            res.json({
                errCode: -7,
                errMsg: 'Unknown error.'
            })
            return;
        }
    }
})

app.get('/callback', async (req, res) => {
    const { code, state } = req.query;
    if (!code) {
        res.json({
            err: "Parameter 'code' is null"
        })
        return;
    }

    try {
        const response = await axios.post('https://api.notion.com/v1/oauth/token', {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': 'https://wordlist.lnception.cn/callback'
        }, {
            auth: {
                username: OAUTH_CLIENT_ID,
                password: OAUTH_CLIENT_SECRET
            }
        })
        // res.send(`请妥善保存，您的token是: ${response.data.access_token}`);
        res.redirect(`https://yrpang.github.io/Wordlist-Notion/callback?code=${response.data.access_token}`);
        return;
    }
    catch (e) {
        console.error(e.response.status, e.response.data);
        res.json({
            status: e.response.status,
            err: e.response.state
        })
        return;
    }
})

app.listen(port, () => {
    console.log(`Wordlist listening at http://localhost:${port}`)
})


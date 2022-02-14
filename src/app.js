import express from 'express';
import { TranslationAPI, NotionAPI } from './wordlist.js'
import { getUser } from './userInfo.js';
import { APIError } from './error.js';

const app = express()
const port = 9000

app.get('/', async (req, res) => {
    const { word, token } = req.query;
    if (!word) {
        res.json({
            errCode: -1,
            errMsg: "Parameter 'word' is missing."
        });
        return;
    }
    if (!token) {
        res.json({
            errCode: -2,
            errMsg: "Parameter 'token' is missing."
        });
        return;
    }

    try {
        const userInfo = await getUser(token);
        const { NOTION_TOKEN, database_id, YOUDAO_ID, YOUDAO_TOKEN } = userInfo;

        // Get translation from youdao
        const trans = new TranslationAPI(YOUDAO_ID, YOUDAO_TOKEN);
        const transRes = await trans.getWordTrans(word);

        // Add word to Notion
        const wordLower = word.toLowerCase();
        const notion = new NotionAPI(NOTION_TOKEN, database_id);
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

app.listen(port, () => {
    console.log(`Wordlist listening at http://localhost:${port}`)
})


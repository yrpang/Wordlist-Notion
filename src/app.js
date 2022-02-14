import express from 'express';
import { getWordTrans, addItem } from './wordlist.js'
import { getUser } from './userInfo.js';

const app = express()
const port = 9000

app.get('/', async (req, res) => {
    const { word, token } = req.query;
    if (!token) {
        console.log(token);
        res.json({
            errCode: -2,
            errMsg: "Parameter 'token' is missing."
        });
        return;
    }
    const userInfo = await getUser({ api_token: token });

    if (!userInfo.NOTION_TOKEN || !userInfo.database_id) {
        res.json({
            errCode: -5,
            errMsg: "Parameter 'token' is wrong."
        })
        return;
    }

    if (!userInfo.YOUDAO_ID || !userInfo.NOTION_TOKEN) {
        res.json({
            errCode: -5,
            errMsg: "Cannot find YOUDAO_token"
        })
        return;
    }

    if (!word) {
        console.log(word);
        console.log(req.query)
        res.json({
            errCode: -1,
            errMsg: "Parameter 'word' is missing."
        });
        return;
    }

    // Get translation from youdao
    const transRes = await getWordTrans(word, userInfo);
    if (transRes.err != 0) {
        console.error(transRes);
        res.json({
            errCode: -3,
            errMsg: "Translation fail. Original error is:" + transRes.errmsg
        })
        return;
    }

    // Add word to Notion
    const wordLower = word.toLowerCase();
    const addItemRes = await addItem(wordLower, transRes, userInfo);
    if (addItemRes.err != 0) {
        console.error(addItemRes);
        res.json({
            errCode: -4,
            errMsg: "Add to Notion fail. Original error is:" + addItemRes.errmsg
        })
        return;
    }

    res.json({
        errCode: 0,
        errMsg: 'OK'
    });
})

app.listen(port, () => {
    console.log(`Wordlist listening at http://localhost:${port}`)
})


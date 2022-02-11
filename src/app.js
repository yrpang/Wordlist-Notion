import express from 'express';
import { getWordTrans, addItem } from './wordlist.js'
import { CONFIG } from './config.js';
const { TOKEN } = CONFIG;

const app = express()
const port = 9000

app.get('/', async (req, res) => {
    const { word, token } = req.query;
    if (!word) {
        console.log(word);
        console.log(req.query)
        res.json({
            errCode: -1,
            errMsg: "Parameter 'word' is missing."
        });
        return;
    }
    if (!token || token !== TOKEN) {
        console.log(token)
        res.json({
            errCode: -2,
            errMsg: "Parameter 'token' is missing or wrong."
        });
        return;
    }

    // Get translation from youdao
    const transRes = await getWordTrans(word);
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
    const addItemRes = await addItem(wordLower, transRes);
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


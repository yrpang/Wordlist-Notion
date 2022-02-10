import express from 'express';
import { getWordTrans, addItem } from './wordlist.js'

const app = express()
const port = 9000

app.get('/', async (req, res) => {
    const { word, secret } = req.query;
    if (!word) {
        res.json({
            errCode: -1,
            errMsg: "参数word不存在"
        });
        return;
    }

    if (!secret || secret !== 'FD1451FA-E921-4D85-BABB-5459DFF9676A') {
        res.json({
            errCode: -2,
            errMsg: "secret错误"
        });
        return;
    }

    const trans = await getWordTrans(word);
    // console.log(trans);

    if (trans.err != 0) {
        res.json({
            errCode: -3,
            errMsg: "翻译错误, 原始错误号: " + trans.err
        })
        return;
    }

    let word_lower = word.toLowerCase();
    const status = await addItem(word_lower, trans);
    if(status.err != 0){
        res.json({
            errCode: -4,
            errMsg: "addItem错误, 原始错误: " + status.errmsg
        })
        return;
    }

    console.log(status.errmsg);
    res.json({
        errCode: 0,
        errMsg: 'OK'
    });
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})


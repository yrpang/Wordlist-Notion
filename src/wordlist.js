import { randomUUID, createHash } from 'crypto'
import axios from "axios";
import { Client } from "@notionhq/client";
import { CONFIG } from './config.js';

const { NOTION_TOKEN, YOUDAO_ID, YOUDAO_TOKEN, database_id } = CONFIG;

const notion = new Client({ auth: NOTION_TOKEN });

function truncate(q) {
    var len = q.length;
    if (len <= 20) return q;
    return q.substring(0, 10) + len + q.substring(len - 10, len);
}

async function getWordTrans(word) {
    try {
        const salt = randomUUID();
        const curtime = Math.round(new Date().getTime() / 1000);
        const hash = createHash('sha256')
        const input = truncate(word);
        const sign = hash.update(YOUDAO_ID + input + salt + curtime + YOUDAO_TOKEN).digest("hex");
        const reqUrl = 'https://openapi.youdao.com/api?q=' + word
            + '&from=en&to=zh-CHS'
            + '&appKey=' + YOUDAO_ID
            + '&salt=' + salt
            + '&sign=' + sign
            + '&signType=v3'
            + '&curtime=' + curtime;
        const response = await axios.get(encodeURI(reqUrl));
        const { errorCode, basic, isWord } = response.data;
        if (errorCode != 0) {
            return {
                err: errorCode,
                errmsg: 'API returns errorCode: ' + errorCode
            }
        }

        if (isWord) {
            const { phonetic, explains } = basic;
            return {
                err: errorCode,
                isWord,
                phonetic,
                trans: explains.join()
            }
        } else {
            const { translation } = response.data;
            return {
                err: errorCode,
                isWord,
                trans: translation.join()
            }
        }

    } catch (e) {
        console.error(e);
        return {
            err: -1,
            errmsg: 'Connect to youdao fail.'
        }
    }
}

async function checkIfExist(word) {
    const response = await notion.databases.query({
        database_id: database_id,
        filter: {
            property: 'Word',
            text: {
                equals: word,
            },
        }
    });
    // console.log(response);
    const { results } = response;
    return (!results || results.length === 0) ? false : true
}

async function addItem(src, res) {
    if (await checkIfExist(src)) {
        return {
            err: 0,
            errmsg: 'Already exist.'
        }
    }

    const { isWord, trans, phonetic } = res
    const basic_prop = {
        'title': {
            title: [
                {
                    "text": {
                        "content": src
                    }
                }
            ]
        },
        'xGVJ': {
            rich_text: [
                {
                    "text": {
                        content: trans
                    }
                }
            ]
        }
    };
    const properties = isWord ? {
        ...basic_prop,
        'Hjo%40': {
            rich_text: [
                {
                    "text": {
                        content: phonetic ? '| ' + phonetic + ' |' : ''
                    }
                }
            ]
        }
    } : basic_prop;

    try {
        const response = await notion.pages.create({
            parent: { database_id: database_id },
            properties
        });
        console.log("Success! Entry added.");
        return {
            err: 0,
            errmsg: 'OK'
        }

    } catch (error) {
        return {
            err: -1,
            errmsg: error.body
        }
    }
}

export { getWordTrans, addItem }
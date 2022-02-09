import { Client } from "@notionhq/client";
import axios from "axios";
import { randomUUID, createHash } from 'crypto'

const NOTION_KEY = 'secret_eVqnnBDiCYHtLU5mfvRLg48xq4nLnZpoFIBiy0RBIuE';
const databaseId = '5fe6198ed109423b83b32b807c831e78';
const APPKEY = '721e2adadc3e05f8';
const key = '0MgIpFOAnVQHB7rmVwI8YBRNj47OBHGT';

const notion = new Client({ auth: NOTION_KEY });

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
        const sign = hash.update(APPKEY + input + salt + curtime + key).digest("hex");
        const reqUrl = 'https://openapi.youdao.com/api?q=' + word
            + '&from=en&to=zh-CHS'
            + '&appKey=' + APPKEY
            + '&salt=' + salt
            + '&sign=' + sign
            + '&signType=v3'
            + '&curtime=' + curtime;
        const res = await axios.get(reqUrl);
        const { errorCode, basic, isWord } = res.data;
        if (errorCode != 0) {
            return {
                err: errorCode
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
            const { translation } = res.data;
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
            errmsg: '请求失败'
        }
    }
}

async function addItem(src, res) {
    const { isWord, trans, phonetic } = res
    const basic_prop = {
        'Word': {
            title: [
                {
                    "text": {
                        "content": src
                    }
                }
            ]
        },
        'Meaning': {
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
        'Phonetic': {
            rich_text: [
                {
                    "text": {
                        content: '| ' + phonetic + ' |'
                    }
                }
            ]
        }
    } : basic_prop;

    try {
        const response = await notion.pages.create({
            parent: { database_id: databaseId },
            properties
        });
        // console.log(response);
        // console.log("Success! Entry added.");
    } catch (error) {
        console.error(error.body);
    }
}
const word = 'connect';
const trans = await getWordTrans(word);
addItem(word, trans)
// console.log(a);
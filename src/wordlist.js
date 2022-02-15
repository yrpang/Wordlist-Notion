import { randomUUID, createHash } from 'crypto'
import axios from "axios";
import { Client, APIResponseError } from "@notionhq/client";
import { APIError } from './error.js';

class TranslationAPI {
    constructor(YOUDAO_ID, YOUDAO_TOKEN) {
        if (!YOUDAO_ID || !YOUDAO_TOKEN) {
            throw new APIError('Translation', 'YOUDAO_ID or YOUDAO_TOKEN is null');
        }

        this.YOUDAO_ID = YOUDAO_ID;
        this.YOUDAO_TOKEN = YOUDAO_TOKEN;
    }

    _truncate(q) {
        var len = q.length;
        if (len <= 20) return q;
        return q.substring(0, 10) + len + q.substring(len - 10, len);
    }

    async getWordTrans(word) {
        try {
            const salt = randomUUID();
            const curtime = Math.round(new Date().getTime() / 1000);
            const hash = createHash('sha256');
            const input = this._truncate(word);
            const sign = hash.update(this.YOUDAO_ID + input + salt + curtime + this.YOUDAO_TOKEN).digest("hex");
            const reqUrl = 'https://openapi.youdao.com/api?q=' + word
                + '&from=en&to=zh-CHS'
                + '&appKey=' + this.YOUDAO_ID
                + '&salt=' + salt
                + '&sign=' + sign
                + '&signType=v3'
                + '&curtime=' + curtime;
            const response = await axios.get(encodeURI(reqUrl));
            const { errorCode, basic, isWord } = response.data;
            if (errorCode != 0) {
                throw new APIError('Translation', `API returns errorCode ${errorCode}`);
            }

            if (isWord) {
                const { phonetic, explains } = basic;
                return {
                    isWord,
                    phonetic,
                    trans: explains.join()
                }
            } else {
                const { translation } = response.data;
                return {
                    isWord,
                    trans: translation.join()
                }
            }

        } catch (e) {
            if (e instanceof APIError) throw e;
            else {
                console.error(e);
                throw new APIError('Translation', 'Connect to youdao fail');
            }
        }
    }
}

class NotionAPI {
    constructor(NOTION_TOKEN, database_id) {
        if (!NOTION_TOKEN || !database_id) {
            throw new APIError('NotionAPI', 'NOTION_TOKEN or database_id is null');
        }

        this.NOTION_TOKEN = NOTION_TOKEN;
        this.database_id = database_id;
        this.notion = new Client({ auth: NOTION_TOKEN });
    }

    async _checkIfExist(word) {
        try {
            const response = await this.notion.databases.query({
                database_id: this.database_id,
                filter: {
                    property: 'title',
                    text: {
                        equals: word,
                    },
                }
            });
            const { results } = response;
            return (!results || results.length === 0) ? false : true
        } catch (e) {
            console.error(e);
            throw new APIError('NotionAPI', e.body);
        }

    }

    async addItem(word, transRes) {
        if (!word) throw new APIError('Translation', 'word is null')

        if (await this._checkIfExist(word)) return;

        const { isWord, trans, phonetic } = transRes
        const basic_prop = {
            'title': {
                title: [
                    {
                        "text": {
                            "content": word
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
            const response = await this.notion.pages.create({
                parent: { database_id: this.database_id },
                properties
            });
            console.log("Success! Entry added.");
            return;

        } catch (e) {
            if (e instanceof APIResponseError) {
                console.error(e);
                throw new APIError('NotionAPI', e.code);
            }
            console.error(e);
            throw new APIError('NotionAPI', 'Unknown notion error');
        }
    }
}

export { TranslationAPI, NotionAPI };
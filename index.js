import { Client } from "@notionhq/client";

const NOTION_KEY = 'secret_eVqnnBDiCYHtLU5mfvRLg48xq4nLnZpoFIBiy0RBIuE';

const notion = new Client({ auth: NOTION_KEY });

const databaseId = '5fe6198ed109423b83b32b807c831e78';

async function addItem(text) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                title: {
                    title: [
                        {
                            "text": {
                                "content": text
                            }
                        }
                    ]
                },
                'xGVJ': {
                    rich_text: [
                        {
                            "text": {
                                content: "12121"
                            }
                        }
                    ]
                }
            },
        });
        console.log(response);
        console.log("Success! Entry added.");
    } catch (error) {
        console.error(error.body);
    }
}

addItem("Yurts in Big Sur, California");
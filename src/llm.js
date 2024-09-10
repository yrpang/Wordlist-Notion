import { AzureChatOpenAI } from "@langchain/openai";
import {
    ChatPromptTemplate,
    FewShotChatMessagePromptTemplate,
} from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { CONFIG } from './config.js';

const { azureOpenAIApiKey, azureOpenAIApiInstanceName, azureOpenAIApiDeploymentName, azureOpenAIApiVersion } = CONFIG;

const llm = new AzureChatOpenAI({
    model: 'gpt-4o-mini',
    azureOpenAIApiKey,
    azureOpenAIApiInstanceName,
    azureOpenAIApiDeploymentName,
    azureOpenAIApiVersion,
});

const examplePrompt = ChatPromptTemplate.fromMessages([
    ["human", `Please tell me the Chinese meaning of words or phrases "{word}" in sentence "{sentence}".`],
    ["ai", "{answer}"],
]);
const examples = [
    {
        word: "dictionary",
        sentence: "Each example should be a dictionary representing an example input to the formatter prompt we defined above.",
        answer: "字典"
    },
]
const fewShotPrompt = new FewShotChatMessagePromptTemplate({
    examplePrompt,
    examples,
    inputVariables: [], // no input variables
});
const finalPrompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a word translation assistant and can help users explain the meaning of words in a given sentence. You will only provide the meaning of the specified word, nothing else."],
    fewShotPrompt,
    ["human", `Please tell me the Chinese meaning of words or phrases "{word}" in sentence "{sentence}".`],
]);

const parser = new StringOutputParser();

export const chain = finalPrompt.pipe(llm).pipe(parser)
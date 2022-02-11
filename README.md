# notion worklist

自动查词并保存到notion的云函数

## How to use

### Step 1: Duplicate the template

Duplicate the [Wordlist template Database](https://yrpang.notion.site/b3e8405329cd4db78ce0ebe45a67b9eb?v=03f2c168255b41379b7faf5525f02622) to your Notion workspace.

Just click the **Duplicate** button.

### Step 2: Create an integration to get `NOTION_TOKEN`

Follow the steps listed in this [step-1-create-an-integration](https://developers.notion.com/docs#step-1-create-an-integration)

### Step 3: Share the database with your integration

Share the database created on step1 with the integration created on step2. [Share a database with your integration](https://developers.notion.com/docs#step-2-share-a-database-with-your-integration)

### Step 4: Get youdao API

Follow this document [有道云自然语言翻译](https://ai.youdao.com/DOCSIRMA/html/%E8%87%AA%E7%84%B6%E8%AF%AD%E8%A8%80%E7%BF%BB%E8%AF%91/API%E6%96%87%E6%A1%A3/%E6%96%87%E6%9C%AC%E7%BF%BB%E8%AF%91%E6%9C%8D%E5%8A%A1/%E6%96%87%E6%9C%AC%E7%BF%BB%E8%AF%91%E6%9C%8D%E5%8A%A1-API%E6%96%87%E6%A1%A3.html)

### Step5: Config and deploy

Fill in the [`src/config.js`](./src/config.js) with the information obtainded above.

Edit [`serverless.yml`](./serverless.yml) if you use Tencent SCF. This [SCF-config doc](https://github.com/serverless-components/tencent-scf/blob/master/docs/configure.md) may help.

You can also deploy it to other service provider.

If you want to use Github Action, please read [`deploy.yml`](./.github/workflows/deploy.yml) and add required secrets. [Github Actions Secrets doc](https://docs.github.com/en/actions/security-guides/encrypted-secrets) may help.

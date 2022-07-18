# Notion Worklist

自动查词并保存到notion的云函数

[![OSCS Status](https://www.oscs1024.com/platform/badge/yrpang/Wordlist-Notion.svg?size=small)](https://www.oscs1024.com/project/yrpang/Wordlist-Notion?ref=badge_small)

## How to use(Beta)

At this stage, this service may be terminate at any time without notice. If you want to use it for a long time, please deploy it yourself.

### Step 1: Duplicate the template database

Duplicate the [Wordlist template Database](https://yrpang.notion.site/b3e8405329cd4db78ce0ebe45a67b9eb?v=03f2c168255b41379b7faf5525f02622) to your Notion workspace.

> The database ID is the part of the URL after your workspace name (if you have one) and the slash (myworkspace/) and before the question mark (?). The ID is 32 characters long, containing numbers and letters. Copy the ID and paste it somewhere you can easily find later.
>
>  ```
> https://www.notion.so/myworkspace/a8aec43384f447ed84390e8e42c2e089?v=...
>                                   |--------- Database ID --------|
> ```

Click the **Duplicate** button and remember the `database_id` of your database.

### Step 2: Get `access_token`

**Warning: To ensure safety please only give access to the page you created in step1 and keep the `access_token` safe.**

[Login with Notion](https://api.notion.com/v1/oauth/authorize?owner=user&client_id=2cb2df41-a063-4460-b2aa-5d3ed39b4f73&redirect_uri=https%3A%2F%2Fwordlist.lnception.cn%2Fcallback&response_type=code) to give permission to read and write the database created in Setp1.

### Step 3: Download Apple Shortcut and config

Download this [shortcut](https://www.icloud.com/shortcuts/94e92dd6b80948eb8f78a16c0b5b96e3) and fill in the `access_token` and `database_id` obtained above.

# bot for scavenger hunt

## initial setup
1. create a new application for your bot https://discord.com/developers/applications
2. create a config.json
  ```
  {
    "token": "discord bot token",
    "clientId": "discord app id",
    "sheet": "google sheet url -- must be viewable publicly"
  }
  ```

3. add the bot to the server
`https://discord.com/oauth2/authorize?client_id=<clientid>`

## user commands

`/done <week #> <kaya_id>` report by user that they found a climb for a week

`/scoreboard` displays the scoreboard
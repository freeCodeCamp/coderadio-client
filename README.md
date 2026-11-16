![freeCodeCamp.org Social Banner](https://s3.amazonaws.com/freecodecamp/wide-social-banner.png)

## Coderadio Client UI

This repository powers the current client application for the Code Radio at: <https://coderadio.freecodecamp.org>.
Eventually we will move this over to our Gatsby based client application for our curriculum and user profiles.

You can learn more about the coderadio here: <https://www.freecodecamp.org/news/code-radio-24-7>

### Local setup

Use the Node version in `.nvmrc` (`nvm use`), then:

- `npm ci` installs dependencies
- `npm start` runs the dev server on <http://localhost:3001>
- `npm test` runs the unit tests
- `npm run e2e` starts the dev server and runs the Cypress tests
- `npm run lint` checks ESLint and Prettier

To send errors to Sentry: `cp sample.env .env.local` and fill in the Sentry DSN from the project settings. The same file lets you point a local build at a different AzuraCast server.

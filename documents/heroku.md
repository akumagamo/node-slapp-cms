# Command Collection

## Deploying

* initialize git repo `git init .` 
* add heroku remote  `git remote add heroku https://git.heroku.com/****.git`
* add files `git add --all`
* commit all files `git commit -m "deploy"`
* push data to heroku `git push -f heroku master`

## Executing commands

* PSQL: `heroku pg:psql`
* Execute Node commands `heroku run node bin/app.js`

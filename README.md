## Powerplate

### Demo
https://powerplate.herokuapp.com/

## Deployment

### Deploy to Heroku

```bash
# Install Heroku CLI
brew install heroku

# Login to Heroku
heroku login

# Create a Heroku app
heroku apps:create your-app-name

# Add heroku remote
heroku git:remote -a your-app-name

# Set up mLab add-on
heroku addons:create mongolab -a your-app-name

# Deploy your application
git push heroku master
```

### Deploy to Heroku via Docker

#### Preparation

+ Make sure you have a working Docker installation
+ Make sure you’re logged in to Heroku
+ Make sure you're working on Git repository
+ Install the container-registry plugin by running:
```bash
$ heroku plugins:install heroku-container-registry
```
+ Log in to the Heroku container registry:
```bash
$ heroku container:login
```
+ Add the heroku remote of your, in this case it is `powerplate`
```bash
$ heroku git:remote -a powerplate
```
+ Edit the `package.json` and change to your git remote

#### Deploy

Deploy as simple as
```bash
$ npm run heroku-push
```

Everytime you want to update your heroku, just re-run the command

If you want to have multiple environment, follow the example in `package.json`

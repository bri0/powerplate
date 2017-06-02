## Powerplate

Deployment
----------

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
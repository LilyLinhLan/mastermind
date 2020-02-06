
# Dev setups
## Prerequites
Need following software installed on the machine:
* Postgres 12 (On Mac, first install [Homebrew](https://brew.sh/), then run `brew install postgres`, see [here](https://medium.com/@Umesh_Kafle/postgresql-and-postgis-installation-in-mac-os-87fa98a6814d) for more details)
* Python 3 (Run `brew install python3`, and then `alias python=python3`)
## Install requirements
`pip3 install -r requirements.txt`
## Setup enviroment
`export APP_SETTINGS="config.DevelopmentConfig"`

`export DATABASE_URL="postgresql://localhost/mastermind"`
## Setup database
* Create database:

`createdb mastermind`
* Migrate database:

`python manage.py db init`

`python manage.py db migrate`

`python manage.py db upgrade`

# Play game
* Start the server:

`python server.py`

On web browser, open http://localhost:5000/
# Code structure
## Data model
* In `models/*`: Define all entities used for the game: User, Game, and Guess
## Server logic
* In `server.py`: Define all routes supported for clients
## Frontend
* In `templates/*`: Define all html pages for the game
* In `static/*` Define javascript and css files used in browersers.

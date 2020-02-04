
- Install postgres
On Linux: sudo apt-get install postgresql postgresql-contrib
On Mac:
- Create database:
createdb mastermind

- Install virtualenv:
pip install virtualenv

- Create virtual env:
virtualenv env

- Activate virtual env:
source env/bin/activate

- Isntall flask:
pip install flask
pip install flask_sqlalchemy
pip install flask_script
pip install flask_migrate
pip install psycopg2-binary

- Migrate db:
python manage.py db init
python manage.py db migrate
python manage.py db upgrade

- Game: gameid(int), userid(int), pattern(string), status (string)
- Guess: gameid(int), guess_number(int), guess_value (string), no_correct(int), no_partial_correct(int)

Jobs to do:
- Log in page
- Home page/menu
- Game page:
  + Dislay all guesses
  + keyboard to enter guess and submit post request to guess
  + server: route guess: use guess value and game answer to compute no correct and partial correct\
  + Get result, refresh display guesses


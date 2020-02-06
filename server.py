from flask import jsonify, request, make_response, render_template, redirect
from app import db, app
from models.game import Game
from models.guess import Guess
from models.user import User


@app.route("/")
def home():
    cookie_userid = request.cookies.get('userid')
    if cookie_userid:
        return redirect("/new_game")
    else:
        return render_template('login.html')


@app.route('/login', methods=['POST'])
def login():
    name = request.form['username']
    user = User.query.filter_by(username=name).first()
    if not user:
        user = User.new_user(name)

    resp = make_response(redirect("/new_game"))
    resp.set_cookie('userid', str(user.userid))
    return resp


@app.route('/logout')
def logout():
    resp = make_response(render_template('login.html'))
    resp.set_cookie('userid', expires=0)
    return resp


# Creates a new game and redirects to the game html page for the new game
@app.route('/new_game', methods=['GET'])
def new_game():
    userid = request.cookies.get('userid')
    game = Game.new_game(userid=userid)
    return redirect('/game/' + str(game.gameid))


# Creates a new game and returns game id of that game
@app.route('/new_game2', methods=['POST'])
def new_game2():
    userid = request.cookies.get('userid')
    num_code = request.form['num_code']
    game = Game.new_game(userid=userid, num_code=num_code)
    return str(game.gameid)


# Returns the game html page page
@app.route('/game/<gameid>', methods=['GET'])
def get_game(gameid):
    game = Game.query.filter_by(gameid=gameid).first()
    user = User.query.filter_by(userid=game.userid).first()
    return render_template("game.html", gameid=game.gameid, username=user.username)


# Returns a gameinfo JSON object, including game and guesses, so that browser can render the game
@app.route('/gameinfo/<gameid>', methods=['get'])
def game_info(gameid):
    game = Game.query.filter_by(gameid=gameid).first()
    guesses = Guess.query.filter_by(gameid=gameid).all()
    results = game.serialize()
    guess_list = []
    for guess in guesses:
        guess_list.append(guess.serialize())
    results['guesses'] = guess_list
    results['num_codes'] = len(game.secret_code)
    # del results['secret_code']
    return results


@app.route('/guess2', methods=['POST'])
def guess2():
    if request.method == 'POST':
        game_id = int(request.form['gameid'])
        guess_value = request.form['guess_value']
        game = Game.query.filter_by(gameid=game_id).first()
        if game.status == "CREATED":
            guess_number = Guess.query.filter_by(gameid=game_id).count() + 1
            guess = Guess.new_guess(game.gameid, guess_number, guess_value, game.secret_code)
            if guess.no_correct == len(game.secret_code):
                game.status = "WIN"
            elif guess.guess_number == game.max_guess:
                game.status = "LOOSE"
            db.session.commit()
        return redirect('/gameinfo/' + str(game_id))


@app.route('/result', methods=['GET'])
def result():
    gameid = int(request.args['gameid'])
    game = Game.query.filter_by(gameid=gameid).first()
    user = User.query.filter_by(userid=game.userid).first()
    if game.status == 'WIN':
        message = "Congratulations! You won! " + "The secret code was " + game.secret_code + "."
        user.win()
    else:
        message = "You lost! " + "The secret code was " + game.secret_code + "."
        user.lose()
    return render_template('result.html', result_message=message, gameid=gameid)


@app.route('/scores', methods=['GET'])
def scores():
    users = User.query.order_by(User.wins.desc()).limit(10)
    return jsonify([u.serialize() for u in users])


@app.route('/score', methods=['GET'])
def score():
    return render_template('score.html')

if __name__ == '__main__':
    app.run()
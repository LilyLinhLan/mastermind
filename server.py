from flask import jsonify, request
from app import db, app
from models.user import User


@app.route("/")
def hello():
    return "Hello World!"

@app.route("/user/<userid>")
def get_user(userid):
    user = User.query.filter_by(userid=int(userid)).first()
    return user.serialize()

@app.route("/users")
def get_all_users():
    users = User.query.all()
    users.sort(key=lambda user: -user.wins)
    return jsonify([u.serialize() for u in users])
#
# @app.route("/details")
# def get_book_details():
#     author=request.args.get('author')
#     published=request.args.get('published')
#     return "Author : {}, Published: {}".format(author,published)

if __name__ == '__main__':
    app.run()
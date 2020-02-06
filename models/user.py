from app import db

class User(db.Model):
    __tablename__ = 'users'
    userid = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String())
    wins = db.Column(db.Integer)
    looses = db.Column(db.Integer)

    @classmethod
    def new_user(cls, username):
        user = cls(username)
        db.session.add(user)
        db.session.commit()
        return user

    def __init__(self, username):
        self.username = username
        self.wins = 0
        self.looses = 0

    def win(self):
        self.wins += 1
        db.session.commit()

    def lose(self):
        self.looses += 1
        db.session.commit()

    def serialize(self):
        return {
            'userid': self.userid,
            'username': self.username,
            'wins': self.wins,
            'looses': self.looses
        }
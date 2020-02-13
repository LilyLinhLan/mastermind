from app import db


class Guess(db.Model):
    __tablename__ = 'guesses'

    gameid = db.Column(db.Integer, primary_key=True)
    guess_number = db.Column(db.Integer, primary_key=True)
    guess_value = db.Column(db.String())
    no_correct = db.Column(db.Integer)
    no_partial_correct = db.Column(db.Integer)

    @classmethod
    def new_guess(cls, gameid, guess_number, guess_value, secret_code):
        no_correct = 0
        no_partial_correct = 0
        remaining_guess, remaining_result = [], []
        for index, value in enumerate(guess_value):
            if value == secret_code[index]:
                no_correct += 1
            else:
                remaining_guess.append(guess_value[index])
                remaining_result.append(secret_code[index])
        for value in remaining_guess:
            if value in remaining_result:
                no_partial_correct +=1
                remaining_result.remove(value)

        guess = cls(gameid, guess_number, guess_value, no_correct, no_partial_correct)
        db.session.add(guess)
        db.session.commit()
        return guess

    def __init__(self, gameid, guess_number, guess_value, no_correct, no_partial_correct):
        self.gameid = gameid
        self.guess_number = guess_number
        self.guess_value = guess_value
        self.no_correct = no_correct
        self.no_partial_correct = no_partial_correct

    def __repr__(self):
        return '<gameid {}>'.format(self.gameid)

    def serialize(self):
        return {
            'gameid': self.gameid,
            'guess_number': self.guess_number,
            'guess_value': self.guess_value,
            'no_correct': self.no_correct,
            'no_partial_correct': self.no_partial_correct
        }



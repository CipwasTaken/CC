import os
basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    # SQLite DB file in the project directory
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'database.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

from flask import Flask
from sbm.blueprints import mongodb
from sbm.blueprints import www

app = Flask('sbm')

app.register_blueprint(www.bp)
app.register_blueprint(mongodb.bp, url_prefix='/api')

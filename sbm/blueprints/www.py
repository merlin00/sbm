from flask import Blueprint
from flask import render_template

bp = Blueprint('www', __name__)


@bp.route('/')
def index():
    return render_template('index.html')


@bp.route('/entity_view')
def entity_view():
    return render_template('entitylist.html')

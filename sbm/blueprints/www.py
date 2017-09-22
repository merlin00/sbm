from flask import Blueprint

bp = Blueprint('www', __name__)


@bp.route('/')
def index():
    return "www"

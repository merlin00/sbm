from flask import Blueprint

bp = Blueprint('sbm', __name__)


@bp.route('/')
def index():
    return "index"


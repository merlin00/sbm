from flask import Blueprint
from flask import request
from flask import jsonify

from pymongo import MongoClient

from sbm.blueprints import schema
from sbm.blueprints.schema import Entity
from sbm.blueprints.schema import StyleOfCube
from sbm.blueprints.schema import Service

bp = Blueprint('mongo', __name__)
client = MongoClient()

db = client['sbmdb']

schema.init(db)


def json_msg(str):
    return jsonify({'msg': str})


def res_not_json_format():
    return json_msg("Not json format"), 400


def res_wrong_fields_in_json():
    return json_msg("Wrong fields in json"), 405


def res_wrong_parameters():
    return json_msg("Wrong parameters"), 405


def res_succeed_request(id):
    return jsonify({
        'id': id,
        'msg': "Succeed the request"}), 200


@bp.route('/entity', methods=['POST'])
def add_entity():
    # logger = current_app.logger

    if not request.is_json:
        return res_not_json_format()

    doc = request.json

    try:
        entity = Entity(doc['topic'])

        entity.set_network(doc['network']['router'],
                           doc['network']['address'])
    except KeyError:
        return res_wrong_fields_in_json()

    id = entity.insert()
    # TODO: Check whather insert() fails or not

    return res_succeed_request(id)


@bp.route('/entity', methods=['GET'])
def get_entity():
    try:
        id = request.args['id']
    except KeyError:
        return res_wrong_parameters()

    entity = Entity()
    if entity.load(id):
        return jsonify(entity.get_dict()), 200

    return jsonify({}), 204


@bp.route('/entity', methods=['DELETE'])
def del_entity():
    try:
        id = request.args['id']
    except KeyError:
        return res_wrong_parameters()

    entity = Entity()
    
    if entity.load(id):
        entity.delete()
        
    return res_succeed_request(id)


@bp.route('/style_of_cube', methods=['POST'])
def add_style_of_cube():
    if not request.is_json:
        return res_not_json_format()

    doc = request.json

    try:
        style_of_cube = StyleOfCube(doc['color'], doc['size'])
    except KeyError:
        return res_wrong_fields_in_json()

    id = style_of_cube.insert()
    # TODO: Check whather insert() fails or not

    return res_succeed_request(id)


@bp.route('/style_of_cube', methods=['GET'])
def get_style_of_cube():
    try:
        id = request.args['id']
    except KeyError:
        return res_wrong_parameters()

    style_of_cube = StyleOfCube()
    if style_of_cube.load(id):
        return jsonify(style_of_cube.get_dict()), 200

    # the style of cube does not exist in DB.
    return jsonify({}), 204


@bp.route('/style_of_cube', methods=['DELETE'])
def del_style_of_cube():
    try:
        id = request.args['id']
    except KeyError:
        return res_wrong_parameters()

    style_of_cube = StyleOfCube()
    if style_of_cube.load(id):
        style_of_cube.delete()

    return res_succeed_request(id), 200


@bp.route('/service', methods=['POST'])
def add_service():
    if not request.is_json:
        return res_not_json_format()

    doc = request.json

    try:
        style_of_cube = Service(doc['name'])
    except KeyError:
        return res_wrong_fields_in_json()

    id = style_of_cube.insert()
    # TODO: Check whather insert() fails or not

    return res_succeed_request(id)


@bp.route('/service', methods=['GET'])
def get_service():
    try:
        id = request.args['id']
    except KeyError:
        return res_wrong_parameters()

    service = Service()
    if service.load(id):
        return jsonify(service.get_dict()), 200

    # The service does not exist in DB.
    return jsonify({}), 204


@bp.route('/service', methods=['DELETE'])
def del_service():
    try:
        id = request.args['id']
    except KeyError:
        return res_wrong_parameters()

    service = Service()
    if service.load(id):
        service.delete()

    return res_succeed_request(id), 200

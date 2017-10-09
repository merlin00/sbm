from flask import Blueprint
from flask import request
from flask import jsonify

from pymongo import MongoClient
from bson.objectid import ObjectId

from sbm.blueprints import schema
from sbm.blueprints.schema import Entity
from sbm.blueprints.schema import StyleOfCube
from sbm.blueprints.schema import Service


bp = Blueprint('mongo', __name__)
client = MongoClient()

db = client['sbmdb']

schema.init(db)


def json_msg(str_msg):
    return jsonify({'msg': str_msg})


def res_not_json_format():
    return json_msg("Not json format"), 400


def res_wrong_fields_in_json():
    return json_msg("Wrong fields in json"), 405


def res_wrong_parameters():
    return json_msg("Wrong parameters"), 405


def res_succeed_request(oid):
    return jsonify({
        'id': str(oid),
        'msg': "Succeed the request"}), 200


# /api/entity
# POST, GET, DELETE

@bp.route('/entity', methods=['POST'])
def add_entity():
    if not request.is_json:
        return res_not_json_format()

    doc = request.json

    try:
        entity = Entity(doc['topic'])
        entity.set_network(doc['network']['router'],
                           doc['network']['address'])

        if 'inputs' in doc:
            for item in doc['inputs']:
                entity.add('inputs', item['tag'], item['num'])
        if 'outputs' in doc:
            for item in doc['outputs']:
                entity.add('outputs', item['tag'], item['num'])

    except KeyError:
        return res_wrong_fields_in_json()

    oid = entity.insert()

    if not oid:
        # TODO: Check whather insert() fails or not
        pass

    style = StyleOfCube(oid)
    style.insert()

    return res_succeed_request(oid)


@bp.route('/entity', methods=['GET', 'DELETE'])
def get_del_entity():
    try:
        oid = ObjectId(request.args['id'])
    except KeyError:
        return res_wrong_parameters()

    if request.method == 'GET':
        entity = Entity()

        if entity.load(oid):
            doc = entity.get_dict()
            doc['_id'] = str(doc['_id'])
            return jsonify(doc), 200

    elif request.method == 'DELETE':
        entity = Entity()

        if entity.load(oid):
            # Delete the style of cube togetger.
            style = StyleOfCube(oid)
            style.load(oid)

            style.delete()
            entity.delete()

            return res_succeed_request(oid)

    return jsonify({}), 204


@bp.route('/entity/topic', methods=['PUT'])
def rename_topic():
    try:
        oid = ObjectId(request.args['id'])
        topic = request.args['topic']
    except:
        return res_wrong_parameters()

    Entity.update_field(oid, 'topic', topic)
    return res_succeed_request(oid)


@bp.route('/entity/all', method=['GET'])
def get_all_entities():
    return jsonify({}), 204


"""
/api/style_of_cube

POST and DELTE methods are used for test
because when the entity creation request,
cube style is created together.

"""


@bp.route('/style_of_cube', methods=['POST'])
def add_style_of_cube():
    if not request.is_json:
        return res_not_json_format()

    doc = request.json

    try:
        style_of_cube = StyleOfCube(doc['color'], doc['size'])
    except KeyError:
        return res_wrong_fields_in_json()

    oid = style_of_cube.insert()
    # TODO: Check whather insert() fails or not

    return res_succeed_request(oid)


@bp.route('/style_of_cube', methods=['GET', 'DELETE'])
def get_del_style_of_cube():
    try:
        oid = ObjectId(request.args['id'])
    except KeyError:
        return res_wrong_parameters()

    if request.method == 'GET':
        style = StyleOfCube(oid)
        if style.load(oid):
            doc = style.get_dict()
            doc['_id'] = str(doc['_id'])
            return jsonify(doc), 200
    elif request.method == 'DELETE':
        style = StyleOfCube(oid)
        if style.load(oid):
            style.delete()
            return res_succeed_request(oid), 200

    # the style of cube does not exist in DB.
    return jsonify({}), 204


# /api/service
# POST, GET, DELETE


@bp.route('/service', methods=['POST'])
def add_service():
    if not request.is_json:
        return res_not_json_format()

    doc = request.json

    try:
        service = Service(doc['name'])
    except KeyError:
        return res_wrong_fields_in_json()

    oid = service.insert()
    # TODO: Check whather insert() fails or not

    return res_succeed_request(oid)


@bp.route('/service', methods=['GET', 'DELETE'])
def get_del_service():
    try:
        oid = ObjectId(request.args['id'])
    except KeyError:
        return res_wrong_parameters()

    if request.method == 'GET':
        service = Service()
        if service.load(oid):
            return jsonify(service.get_dict()), 200
    elif request.method == 'POST':
        service = Service()
        if service.load(oid):
            service.delete()
            return res_succeed_request(oid), 200

    # The service does not exist in DB.
    return jsonify({}), 204


@bp.route('/service/entity', methods=['POST', 'DELETE'])
def add_and_del_entity_in_service():
    try:
        s_oid = ObjectId(request.args['id'])
        e_oid = ObjectId(request.args['e_id'])
    except KeyError:
        return res_wrong_parameters()

    if request.method == 'POST':
        Service.add_entity(s_oid, e_oid)
    elif request.method == 'DELETE':
        Service.del_entity(s_oid, e_oid)

    return res_succeed_request(s_oid), 200


@bp.route('/service/link', methods=['POST', 'DELETE'])
def add_link():
    try:
        s_oid = ObjectId(request.args['id'])
        out_oid = ObjectId(request.args['out_id'])
        in_oid = ObjectId(request.args['in_id'])
    except KeyError:
        return res_wrong_parameters()

    if request.method == 'POST':
        Service.add_link(s_oid, out_oid, in_oid)
    elif request.method == 'DELETE':
        Service.del_link(s_oid, out_oid, in_oid)

    return res_succeed_request(s_oid), 200

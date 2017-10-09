def init(db):
    Entity.Col = db['entities']
    StyleOfCube.Col = db['style_of_cubes']
    Service.Col = db['services']


def _update_field(col, oid, field, value):
    return col.update_one({'_id': oid},
                          {'$set': {field: value}})


def _push_item(col, oid, field, value):
    return col.update_one({'_id': oid},
                          {'$push': {field: value}})


def _pull_item(col, oid, field, value):
    return col.update_one({'_id': oid},
                          {'$pull': {field: value}})


def get_entities():
    for item in Entity.Col.find():
        print(item)


class BaseMethod:
    def get_dict(self):
        return self._dict

    def load(self, oid):
        self._dict = self.Col.find_one({
            '_id': oid})

        if not self._dict:
            return False

        return True

    def insert(self):
        return self.Col.insert_one(self._dict).inserted_id

    def delete(self):
        ret = self.Col.delete_one({
            '_id': self._dict['_id']})

        return ret.deleted_count > 0

    def update(self):
        ret = self.Col.replace_one(
            {'_id': self._dict['_id']},
            self._dict)
        return ret.matched_count > 0


class Entity(BaseMethod):
    def __init__(self, topic=""):
        self._dict = {}
        self._dict['topic'] = topic
        self._dict['inputs'] = []
        self._dict['outputs'] = []

    def set_topic(self, topic):
        self._dict['topic'] = topic

    def set_network(self, router, address):
        self._dict['network'] = {
            'router': router,
            'address': address}

    def add(self, in_out, tag, num):
        self._dict[in_out].append({
            'tag': tag,
            'num': num})

    def delete_inout(self, in_out, num):
        for item in self._dict[in_out]:
            if item['num'] == num:
                dict[in_out].remove(item)
                break

    @staticmethod
    def update_field(oid, field, value):
        _update_field(Entity.Col,
                      oid,
                      field,
                      value)


class StyleOfCube(BaseMethod):
    def __init__(self, oid, color=0, size=0):
        self._dict = {}
        self._dict['_id'] = oid
        self._dict['color'] = color
        self._dict['size'] = size

    def set_color(self, c):
        self._dict['color'] = c

    def get_color(self):
        return self._dict['color']

    def set_size(self, s):
        self._dict['size'] = s

    def get_size(self):
        return self._dict['size']

    def set_postion(self, x, y, z):
        self._dict['x'] = x
        self._dict['y'] = y
        self._dict['z'] = z

    @staticmethod
    def update_field(oid, field, value):
        _update_field(StyleOfCube.Col,
                      oid,
                      field,
                      value)


class Service(BaseMethod):
    def __init__(self, name=""):
        self._dict = {}
        self._dict['name'] = name
        self._dict['entities'] = []
        self._dict['links'] = []

    def link(self, _out, _in):
        entities = self._dict['entities']

        try:
            entities.index(_out)
        except ValueError:
            entities.append(_out)

        try:
            entities.index(_in)
        except ValueError:
            entities.append(_in)

        self._dict['links'].append({
            'out_oid': _out,
            'in_oid': _in})

    def unlink(self, _out, _in):
        links = self._dict['links']
        for link in links:
            if link['out_oid'] == _out and link['in_oid'] == _in:
                links.remove(link)
                break

    @staticmethod
    def update_field(oid, field, value):
        _update_field(Service.Col,
                      oid,
                      field,
                      value)

    @staticmethod
    def add_link(oid, _out, _in):
        _push_item(Service.Col, oid, 'links', {
            'out_oid': _out,
            'in_oid': _in})

    @staticmethod
    def del_link(oid, _out, _in):
        _pull_item(Service.Col, oid, 'links', {
            'oid_oid': _out,
            'in_oid': _in})

    @staticmethod
    def add_entity(s_oid, e_oid):
        _push_item(Service.Col, s_oid, 'entities', e_oid)

    @staticmethod
    def del_entity(s_oid, e_oid):
        _pull_item(Service.Col, s_oid, 'entities', e_oid)

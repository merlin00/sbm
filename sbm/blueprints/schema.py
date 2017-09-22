def init(db):
    Entity.Collections = db['entities']
    StyleOfCube.Collections = db['style_of_cubes']
    Service.Collections = db['services']


def update_field(col, oid, field, value):
    return col.update_one({
        '_id': oid
    }, {
        '$set': {
            field: value
        }
    })


def update_in_entity(oid, field, value):
    return update_field(Entity.Collections, oid, field, value)


def update_in_style_of_cube(oid, field, value):
    return update_field(StyleOfCube.Collections, oid, field, value)


def update_in_service(oid, field, value):
    return update_field(Service.Collections, oid, field, value)


class BaseMethod:
    def get_dict(self):
        return self._dict

    def load(self, oid):
        self._dict = self.Collections.find_one({
            '_id': oid})

        if not self._dict:
            return False

        return True

    def insert(self):
        return self.Collections.insert_one(self._dict).inserted_id

    def delete(self):
        ret = self.Collections.delete_one({
            '_id': self._dict['_id']})

        return ret.deleted_count > 0

    def update(self):
        ret = self.Collections.replace_one(
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

    def delete(self, in_out, num):
        for item in self._dict[in_out]:
            if item['num'] == num:
                dict[in_out].remove(item)
                break


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


class Service(BaseMethod):
    def __init__(self, name=""):
        self._dict = {}
        self._dict['name'] = name

    def link(self, _out, _in):
        pass

    def unlink(self, _out, _in):
        pass

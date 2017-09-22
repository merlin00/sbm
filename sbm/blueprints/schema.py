from bson.objectid import ObjectId


def init(db):
    Entity.Collections = db['entities']
    StyleOfCube.Collections = db['style_of_cubes']
    Service.Collections = db['services']


class BaseMethod:
    def get_dict(self):
        return self._dict
    
    def load(self, id):
        self._dict = self.Collections.find_one({
            '_id': ObjectId(id) })

        if not self._dict:
            return False

        self._dict['_id'] = str(id)
        
        return True
    
    def insert(self):
        id = self.Collections.insert_one(self._dict).inserted_id
        return str(id)

    def delete(self):
        ret = self.Collections.delete_one({
            '_id': ObjectId(self._dict['_id']) })

        return ret.deleted_count > 0


class Entity(BaseMethod):
    def __init__(self, topic=""):
        self._dict = {}
        self._dict['topic'] = topic

    def set_network(self, router, address):
        self._dict['network'] = {
            'router': router,
            'address': address }


class StyleOfCube(BaseMethod):
    def __init__(self, color=0, size=0):
        self._dict = {}
        self._dict['color'] = color
        self._dict['size'] = size

    def set_color(c):
        self._dict['color'] = c

    def get_color():
        return self._dict['color']

    def set_size(s):
        self._dict['size'] = s

    def get_size():
        return self._dict['size']


class Service(BaseMethod):
    def __init__(self, name=""):
        self._dict = {}
        self._dict['name'] = name


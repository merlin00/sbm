import socket
import logging
import logging.config
import configparser
import json
import requests
import os

post_entity = 'http://{0}:{1}/api/entity'
get_entity = 'http://{0}:{1}/api/entity?id={2}'


class DevRegError(Exception):
    def __init__(self, msg):
        self.msg = msg

    def __str__(self):
        return self.msg


class AtomDevice:
    def __init__(self, device_config_file, logger_config_file):
        if not os.path.exists(device_config_file) or \
           not os.path.exists(logger_config_file):
            pass  # TODO: Add raise code for not existing.

        self.filename = device_config_file

        # load device information.
        config = configparser.ConfigParser()
        config.read(device_config_file)

        if 'DEVICE' in config.keys():
            self.device = config['DEVICE']
        self.config = config

        # load loggger config.
        with open(logger_config_file, 'r') as f:
            logger_config = json.load(f)

        logging.config.dictConfig(logger_config)
        self.logger = logging.getLogger('device')

    def scan_network(self, port):
        logger = self.logger
        sock = socket.socket(socket.AF_INET,
                             socket.SOCK_DGRAM)

        # After 3 seconds, retry to send the hello request packet.
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        sock.settimeout(3)  # 3 seconds

        logger.info("Started scanning mrouter.")

        # Try five times.
        for i in range(0, 5):
            logger.info("{0} : Sent a broadcast packet,'hello'.".format(i + 1))
            sock.sendto(b'hello', ('255.255.255.255', port))
            try:
                data, addr = sock.recvfrom(1024)
                logger.info("Recevied the response from a local mrouter.")
                logger.info("Stopped scanning.")
                sock.close()
                return json.loads(str(data, 'utf-8'))
            except socket.timeout:
                pass

        sock.close()
        logger.info("Not any response for scanning.")
        logger.info("Stopped scanning.")
        raise DevRegError("Timeout")

    def register(self):
        server = self.config['SERVER']
        router = self.config['MROUTER']
        device = self.config['DEVICE']
        logger = self.logger

        url = post_entity.format(server['ip'], int(server['port']))

        data = {}
        data['topic'] = device['topic']
        data['network'] = {
            'router': router['id'],
            'address': router['ip']}

        data['inputs'] = device['input'].split(',')
        data['outputs'] = device['output'].split(',')

        try:
            logger.info("RESTfull request({0})".format(url))
            res = requests.post(url, data=json.dumps(data), timeout=2)
            logger.info("RESTfull respose(id={0})")
            return True
        except:
            logger.info("RESTfull request timeout")
            return False

    def set_server(self, ip, port):
        config = self.config
        if 'SERVER' not in config.keys():
            config['SERVER'] = {}
        config['SERVER']['ip'] = ip
        config['SERVER']['port'] = str(port)

        with open(self.filename, 'w') as f:
            config.write(f)

    def get_server(self):
        config = self.config
        if 'SERVER' not in config.keys():
            return None
        return config['SERVER']

    def set_mrouter(self, id, ip, port):
        config = self.config
        if 'MROUTER' not in config.keys():
            config['MROUTER'] = {}
        config['MROUTER']['id'] = id
        config['MROUTER']['ip'] = ip
        config['MROUTER']['port'] = str(port)

        with open(self.filename, 'w') as f:
            config.write(f)

    def get_mrouter(self):
        config = self.config
        if 'MROUTER' not in config.keys():
            return None
        return config['MROUTER']

    def update(self, info):
        server = self.get_server()
        router = self.get_mrouter()

        if server is None:
            self.set_server(info['server'], 20000)
        elif server['ip'] != info['server']:
            self.set_server(info['server'], 20000)

        if router is None:
            self.set_mrouter(info['id'], info['router'], int(info['port']))
        elif router['id'] != info['id']:
            self.set_mrouter(info['id'], info['router'], int(info['port']))

import socket
import logging
import logging.config
import configparser
import json
import requests
import os

device_config_file = 'device.ini'
logger_config_file = 'logcfg.json'

with open(logger_config_file, 'r') as f:
    logger_config = json.load(f)

logging.config.dictConfig(logger_config)
logger = logging.getLogger('device')


class DevRegError(Exception):
    def __init__(self, msg):
        self.msg = msg

    def __str__(self):
        return self.msg


def scan_mrouter(port):
    c = socket.socket(socket.AF_INET,
                      socket.SOCK_DGRAM)

    # After 3 seconds, retry to send the hello request packet.
    c.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    c.settimeout(3)  # 3 seconds

    logger.info("Started scanning mrouter.")

    # Try five times.
    for i in range(0, 5):
        logger.info("{0} : Sent a broadcast packet, 'hello'.".format(i + 1))
        c.sendto(b'hello', ('255.255.255.255', port))
        try:
            data, addr = c.recvfrom(1024)
            logger.info("Recevied the response from a local mrouter.")
            logger.info("Stopped scanning.")
            c.close()
            return json.loads(str(data, 'utf-8'))
        except socket.timeout:
            pass

    c.close()
    logger.info("Not any response for scanning.")
    logger.info("Stopped scanning.")
    raise DevRegError("Timeout")


def register_dev(svr, dev_info):
    data = ""
    url = 'http://' + svr + '/api/entity'
    requests.post(url, data=data)


post_entity = "http://{0}:{1}/api/entity"


def reg_dev(ip, router, dev):
    url = post_entity.format(ip, 50000) 
    pass


def reset_config(config, new):
    if 'MROUTER' not in config.keys():
        config['MROUTER'] = {}

    if 'SERVER' not in config.keys():
        config['SERVER'] = {}

    config['MROUTER']['id'] = new['id']
    config['MROUTER']['ip'] = new['router']
    config['MROUTER']['port'] = str(new['port'])

    config['SERVER']['ip'] = new['server']

    config['DEV_INFO']['id'] = register_dev(new['server'], config['DEV_INFO'])


# Start a device.
def device_main():
    config = configparser.ConfigParser()

    if os.path.exists(device_config_file):
        config.read(device_config_file)

    try:
        info = scan_mrouter(10000)
        if config['MROUTER']['id'] != info['id']:
            reset_config(config, info)
        else:
            logger.info("Already registered.")
    except KeyError:
        reset_config(config, info)
    except DevRegError as e:
        print(e)

    if 'DEV_INFO' not in config.keys():
        config['DEV_INFO'] = {}

    with open(device_config_file, 'w') as f:
        config.write(f)


if __name__ == '__main__':
    device_main()
    res = requests.get('http://127.0.0.1:5000/api/entity?id=59c89f3b732de96962e9d88b')
    print(res)

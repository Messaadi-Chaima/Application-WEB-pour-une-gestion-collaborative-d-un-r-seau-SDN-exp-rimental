from mininet.net import Mininet
from mininet.node import OVSSwitch
from mininet.link import TCLink
from mininet.cli import CLI

def create_network():
    net = Mininet(switch=OVSSwitch, link=TCLink)

    # Ajoute deux commutateurs
    s1 = net.addSwitch('s1')
    s2 = net.addSwitch('s2')

    # Crée un lien entre les ports spécifiques des deux commutateurs
    net.addLink(s1, s2, port1=1, port2=2)

    # Démarre le réseau
    net.start()

    # Ouvrir l'interface de ligne de commande Mininet pour tester
    CLI(net)

    # Arrête le réseau lorsqu'on quitte la CLI
    net.stop()

if __name__ == '__main__':
    create_network()

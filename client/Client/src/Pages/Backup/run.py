from mininet.net import Mininet
from mininet.node import OVSController
from mininet.cli import CLI
from mininet.log import setLogLevel

def simple_topology():
    net = Mininet(controller=OVSController)

    c0 = net.addController('c0')
    h1 = net.addHost('h1', ip='10.0.0.1/24')
    s1 = net.addSwitch('s1')

    net.addLink(h1, s1)

    net.start()

    # Ajouter un tunnel GRE pour la connexion à la deuxième machine
    s1.cmd('ovs-vsctl add-port s1 gre1 -- set interface gre1 type=gre options:remote_ip=10.0.0.30')

    CLI(net)
    net.stop()

if __name__ == '__main__':
    setLogLevel('info')
    simple_topology()

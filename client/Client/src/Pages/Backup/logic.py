from flask import Flask, jsonify, request
from mininet.net import Mininet
from mininet.topo import Topo
from mininet.node import OVSSwitch, Host, Controller
from mininet.link import TCLink  # Import TCLink to specify link properties
from flask_cors import CORS
from mininet.cli import CLI
import subprocess
import os
from subprocess import Popen, PIPE
import requests
from mininet.clean import cleanup
from mininet.log import setLogLevel, info

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global variables
nodes = []
edges = []
edges_s = []
edges_ovs = []
switch_nodes = {}
host_nodes = {}
host_controller = {}
net = None  # Initialize net as None

@app.route('/test')
def index():
    return "Flask server is up and running!"

@app.route('/restapi/topologies/<int:topo_id>', methods=['POST'])
def create_topology(topo_id):
    global nodes, edges, edges_s, edges_ovs , switch_nodes, host_nodes, host_controller, net
    data = request.get_json()

    # Validate input data
    if not data or 'nodes' not in data or 'edges' not in data or 'edges_s' not in data:
        return jsonify({"error": "Invalid data format, 'nodes', 'edges', and 'edges_s' are required"}), 400

    # Clean up existing topology and resources
    free_topology()
    cleanup()
    print("Cleanup is done!")

    # Reset global variables
    nodes = data['nodes']
    edges = data['edges']
    edges_s = data['edges_s']
    edges_ovs = data['edges_ovs']  # Assign an empty list if 'edges_ovs' doesn't exist in data
    switch_nodes = {}
    host_nodes = {}
    host_controller = {}
    net = Mininet(controller=Controller, link=TCLink)  # Initialize a new Mininet instance with TCLink
    try:
        # Add nodes
        for node_data in data['nodes']:
            node_id = str(node_data['id'])
            if node_data['group'] == 'switch':
                switch_nodes[node_id] = net.addSwitch(node_id)
            elif node_data['group'] == 'host':
                host_ip = None
                for port in node_data.get('ports', []):
                    if 'ip' in port:
                        host_ip = port['ip']
                        break
                host_nodes[node_id] = net.addHost(node_id, ip=host_ip)
            elif node_data['group'] == 'controller':
                host_controller[node_id] = net.addController(node_id)

        # Add host-switch links
        for edge in edges:
            switch_id = edge['switch_id']
            host_id = edge['host_id']
            switch_label = edge['switch_label']
            host_label = edge['host_label']
            bandwidth = int(edge['band_width']) if edge['band_width'] != "None" else None
            if switch_id in switch_nodes and host_id in host_nodes:
                net.addLink(
                    switch_nodes[switch_id], host_nodes[host_id],
                    intfName1=switch_label, intfName2=host_label, bw=bandwidth
                )

        # Add switch-switch links
        for edge in edges_s:
            switch_id1 = edge['switch_id1']
            switch_id2 = edge['switch_id2']
            switch_label1 = edge['switch_label1']
            switch_label2 = edge['switch_label2']

            if switch_id1 in switch_nodes and switch_id2 in switch_nodes:
                net.addLink(
                    switch_nodes[switch_id1], switch_nodes[switch_id2],
                    intfName1=switch_label1, intfName2=switch_label2
                )


        # Start the network
        net.start()
        print(f"Topology with ID {topo_id} created successfully")

         # Add OVS switch-switch GRE tunnels
        for edge in edges_ovs:
            switch_id1 = edge['switch_id1']
            switch_id2 = edge['switch_id2']
            switch_label1 = edge['switch_label1']
            switch_label2 = edge['switch_label2']
            if switch_id1 in switch_nodes or switch_id2 in switch_nodes:
                if switch_id1 in switch_nodes:
                    switch1 = switch_nodes[switch_id1]
                    print(switch1)
                    switch1.cmd(f'ovs-vsctl add-port {switch1} gre-{switch_label1} -- set interface gre-{switch_label1} type=gre options:remote_ip=10.0.0.30')
                    print(f"GRE tunnel created with switch1 {switch1} and remote IP 10.0.0.30")
                elif switch_id2 in switch_nodes:
                    switch2 = switch_nodes[switch_id2]
                    print(switch2)
                    switch2.cmd(f'ovs-vsctl add-port {switch2} gre-{switch_label2} -- set interface gre-{switch_label2} type=gre options:remote_ip=10.0.0.30')
                    print(f"GRE tunnel created with switch2 {switch2} and remote IP 10.0.0.30")

        # Optionally, drop into Mininet CLI for debugging
        CLI(net)
        print("CLI exited")
    except Exception as e:
        print(f"Error creating topology: {e}")
        return jsonify({"error": str(e)}), 500


    return jsonify({"message": f"Topology with ID {topo_id} created and stopped successfully"}), 200

def fetch_and_create_topology():
    global nodes, edges, edges_s, edges_ovs, switch_nodes, host_nodes, host_controller, net

    with app.app_context():
        try:
            INTELLIGENT_SERVER_URL = 'http://10.0.0.55:5000/restapi/topologies/1/config'
            response = requests.get(INTELLIGENT_SERVER_URL)
            response.raise_for_status()
            data = response.json()
            print("Topology data fetched successfully")

            # Validate input data
            if 'nodes' not in data or 'edges' not in data or 'edges_s' not in data:
                return jsonify({"error": "Invalid data format, 'nodes', 'edges', and 'edges_s' are required"}), 400

            # Clean up existing topology and resources
            free_topology()
            cleanup()
            print("Cleanup is done!")

            # Reset global variables
            nodes = data['nodes']
            edges = data['edges']
            edges_s = data['edges_s']
            edges_ovs = data['edges_ovs']
            switch_nodes = {}
            host_nodes = {}
            host_controller = {}
            net = Mininet(controller=Controller, link=TCLink)  # Initialize a new Mininet instance with TCLink

            # Add nodes
            for node_data in data['nodes']:
                node_id = str(node_data['id'])
                if node_data['group'] == 'switch':
                    switch_nodes[node_id] = net.addSwitch(node_id)
                elif node_data['group'] == 'host':
                    host_ip = None
                    for port in node_data.get('ports', []):
                        if 'ip' in port:
                            host_ip = port['ip']
                            break
                    host_nodes[node_id] = net.addHost(node_id, ip=host_ip)
                elif node_data['group'] == 'controller':
                    host_controller[node_id] = net.addController(node_id)

            # Add host-switch links
            for edge in edges:
                switch_id = edge['switch_id']
                host_id = edge['host_id']
                switch_label = edge['switch_label']
                host_label = edge['host_label']
                bandwidth = int(edge['band_width']) if edge['band_width'] != "None" else None
                if switch_id in switch_nodes and host_id in host_nodes:
                    net.addLink(
                        switch_nodes[switch_id], host_nodes[host_id],
                        intfName1=switch_label, intfName2=host_label, bw=bandwidth
                    )

            # Add switch-switch links
            for edge in edges_s:
                switch_id1 = edge['switch_id1']
                switch_id2 = edge['switch_id2']
                switch_label1 = edge['switch_label1']
                switch_label2 = edge['switch_label2']

                if switch_id1 in switch_nodes and switch_id2 in switch_nodes:
                    net.addLink(
                        switch_nodes[switch_id1], switch_nodes[switch_id2],
                        intfName1=switch_label1, intfName2=switch_label2
                    )


            net.start()
            print("Network started successfully")

             # Add OVS switch-switch GRE tunnels
            for edge in edges_ovs:
                switch_id1 = edge['switch_id1']
                switch_id2 = edge['switch_id2']
                switch_label1 = edge['switch_label1']
                switch_label2 = edge['switch_label2']
                if switch_id1 in switch_nodes or switch_id2 in switch_nodes:
                    if switch_id1 in switch_nodes:
                        switch1 = switch_nodes[switch_id1]
                        print(switch1)
                        switch1.cmd(f'ovs-vsctl add-port {switch1} gre1 -- set interface gre1 type=gre options:remote_ip=10.0.0.30')

                        print(f"GRE tunnel created with switch1 {switch1} and remote IP 10.0.0.30")
                    elif switch_id2 in switch_nodes:
                        switch2 = switch_nodes[switch_id2]
                        print(switch2)
                        switch2.cmd(f'ovs-vsctl add-port {switch2} gre1 -- set interface gre1 type=gre options:remote_ip=10.0.0.30')
                        print(f"GRE tunnel created with switch2 {switch2} and remote IP 10.0.0.30")



            
            # Optionally, drop into Mininet CLI for debugging
            CLI(net)

            return jsonify({"message": "Topology created and stopped successfully from fetched data"}), 200

        except requests.exceptions.RequestException as e:
            print(f"HTTP Request failed: {e}")
            return jsonify({"error": str(e)}), 500
        except Exception as e:
            print(f"Error during topology creation: {e}")
            return jsonify({"error": str(e)}), 500
        
def free_topology():
    global nodes, edges, edges_s, edges_ovs , switch_nodes, host_nodes, host_controller, net
    try:
        if net is not None:
            # Delete host-switch links
            for edge in edges:
                switch_id = edge['switch_id']
                host_id = edge['host_id']
                if switch_id in switch_nodes and host_id in host_nodes:
                    net.delLinkBetween(switch_nodes[switch_id], host_nodes[host_id])
                    print(f"Edge Deleted: {switch_nodes[switch_id]} <--> {host_nodes[host_id]}")

            # Delete switch-switch links
            for edge in edges_s:
                switch_id1 = edge['switch_id1']
                switch_id2 = edge['switch_id2']
                if switch_id1 in switch_nodes and switch_id2 in switch_nodes:
                    net.delLinkBetween(switch_nodes[switch_id1], switch_nodes[switch_id2])
                    print(f"Edge Deleted: {switch_nodes[switch_id1]} <--> {switch_nodes[switch_id2]}")

            # Delete all nodes in the topology
            for node in list(net.values()):  # Using list to avoid runtime error due to dynamic changes in net
                net.delNode(node)
                print(f"Node Deleted: {node}")

        # Reset the global variables
        nodes = []
        edges = []
        edges_s = []
        edges_ovs = []
        switch_nodes = {}
        host_nodes = {}
        host_controller = {}

    except Exception as e:
        print(f"Error during topology cleanup: {e}")


if __name__ == '__main__':
    # Ensure Mininet resources are cleaned up before starting the server
    if os.environ.get('WERKZEUG_RUN_MAIN') != 'true':
        fetch_and_create_topology()
        setLogLevel('info')
    # Start the Flask application
    app.run(host='10.0.0.55', port=5002, debug=True)

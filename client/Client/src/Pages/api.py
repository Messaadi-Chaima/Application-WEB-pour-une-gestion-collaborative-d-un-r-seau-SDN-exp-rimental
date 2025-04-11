from flask import Flask, jsonify, request
from mininet.net import Mininet
from mininet.topo import Topo
from mininet.node import OVSSwitch, Host,Controller
from mininet.link import TCLink  # Importez TCLink pour spécifier les propriétés du lien
from mininet.link import Intf
from flask_cors import CORS
from flask import send_from_directory
from mininet.cli import CLI

import json
from subprocess import Popen, PIPE
import os
import pwd
import grp
import subprocess
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


@app.route('/check-connection')
def check_connection():
    return 'Backend en ligne', 200

############################################################################################
topologies = {}
net = Mininet(controller=Controller, switch=OVSSwitch, link=TCLink)
coordinates = {}
intfs= {}
############################################################################################

def save_topology_to_json(topology, topo_id, filename):
    if topo_id in topologies:
        host_switch_links = []
        switch_links = []
        node_coordinates = {}

        topology_config = {
            "topology_id": topo_id,
            "hosts": {},
            "switches": {},
            "links": switch_links,
            "host_switch_links": host_switch_links,
        }
        for host in topology.hosts:
            print(str(host)+"   "+str(host.params['x']))
        for host in topology.hosts:
            host_config = {
                "intfs": [],  
                "position": {"x": host.params['x'], "y": host.params['y']}
            }
            for intf_name, intf_data in host.intf_coordinates.items():
                print("intf_name    "+intf_name)
            for intf_name, intf_data in host.intf_coordinates.items():
                intf_info = {
                    "name": intf_name,
                    "x": intf_data['x'],
                    "y": intf_data['y']
                }
                host_config["intfs"].append(intf_info)
            topology_config["hosts"][host.name] = host_config
            node_coordinates[host.name] = {"x": host.params['x'], "y": host.params['y']}
            for intf in host.intfList():
                if intf.link:
                     link_info = {
                    "host": host.name,
                    "switch": intf.link.intf2.node.name,
                    "host_intf": intf.name,
                    "switch_intf": intf.link.intf2.name
                }
                host_switch_links.append(link_info)


        for switch in topology.switches:
            switch_config = {
                "intfs": [],  
                "position": {"x": switch.params['x'], "y": switch.params['y']}
            }
            for intf_name, intf_data in switch.intf_coordinates.items():
                intf_info = {
                    "name": intf_name,
                    "x": intf_data['x'],
                    "y": intf_data['y']
                }
                switch_config["intfs"].append(intf_info)
            topology_config["switches"][switch.name] = switch_config
            node_coordinates[switch.name] = {"x": switch.params['x'], "y": switch.params['y']}

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(topology_config, f, indent=4)

        os.chmod(filename, 0o644)
        uid = pwd.getpwnam('sysop').pw_uid
        gid = grp.getgrnam('sysop').gr_gid
        os.chown(filename, uid, gid)
    else:
        print(f"Topology with ID {topo_id} not found")




############################################################################################
### a vérifié topologies[topo_id] il faut quelle soit changé a net


@app.route('/restapi/topologies/<int:topo_id>/delete-selected', methods=['POST'])
def delete_selected(topo_id):
    if topo_id in topologies:
        # Récupérer les IDs des nœuds à supprimer depuis la requête
        selected_nodes = request.json.get('selected_nodes', [])
        group =  request.json.get('group')
        print("group:   "+str(group))
        for node_id in selected_nodes:
            # Vérifier si le nœud est un hôte
            if group == 'host' and node_id in topologies[topo_id]:
                print("Deleted Host :   " + node_id)
                node_link = net.get(str(topologies[topo_id].getNodeByName(node_id))).intf()
                if node_link and node_link.link:
                    print("h1 is linked to:", node_link.link.intf1.name)
                    topologies[topo_id].delLink(node_link.link)
                net.delNode(topologies[topo_id].getNodeByName(node_id))
                
                # Supprimer le nœud du fichier JSON
                delete_node_from_topology(node_id)

            # Vérifier si le nœud est un commutateur
            elif group == 'switch' and node_id in topologies[topo_id]:
                print("Deleted Switch :     " + node_id)
                switch = net.get(node_id)
                for intf in switch.intfList():
                    # Get the link connected to the interface
                    link = intf.link
                    if link:
                        print(link)
                        net.delLink(link)
                net.delNode(topologies[topo_id].getNodeByName(node_id))
                # Supprimer le nœud du fichier JSON
                delete_node_from_topology(node_id)
                return jsonify({"error": f"Node with ID {node_id} not found in topology"})
        
        if group == 'links' :
            print("node_id:     "+str(net.get(selected_nodes[0])))
            print("node_id:     "+str(net.get(selected_nodes[1])))
            net.delLinkBetween(net.get(selected_nodes[0]),net.get(selected_nodes[1]))
        
        
            
        CLI(topologies[topo_id])
        return jsonify({"message": "Selected nodes and associated edges deleted successfully"})
    else:
        return jsonify({"error": f"Topology with ID {topo_id} not found"})




# Fonction pour supprimer un nœud du fichier JSON en fonction de son ID
def delete_node_from_topology(node_id):
    # Définition du chemin vers le fichier JSON de la topologie
    topology_file = f"topology_1.json"
    if os.path.exists(topology_file):
        with open(topology_file, "r") as file:
            topology_data = json.load(file)
        
        if node_id in topology_data["hosts"]:
            del topology_data["hosts"][node_id]
        elif node_id in topology_data["switches"]:
            del topology_data["switches"][node_id]

        # Supprimer l'entrée correspondante dans host_switch_links si elle existe
        if "host_switch_links" in topology_data:
            topology_data["host_switch_links"] = [link for link in topology_data["host_switch_links"] 
                                                  if link["host"] != node_id and link["switch"] != node_id]

        # Enregistrer les modifications dans le fichier JSON
        with open(topology_file, "w") as file:
            json.dump(topology_data, file, indent=4)

        # Vérifier si le fichier a bien été modifié
        if os.path.exists(topology_file):
            print(f"Node with ID {node_id} successfully deleted from topology file.")
        else:
            print(f"Failed to delete node with ID {node_id} from topology file.")

############################################################################################    

def load_topology():
    global topologies
    global coordinates

    # Charger les informations de topologie à partir des fichiers JSON
    for filename in os.listdir():
        if filename.startswith("topology_") and filename.endswith(".json"):
            topo_id = int(filename.split("_")[1].split(".")[0])
            with open(filename, 'r') as f:
                topology_config = json.load(f)

            c0 = net.addController('c0')
            topo_id = topology_config.get("topology_id")  # Récupérer l'ID de la topologie à partir du fichier JSON
            topologies[topo_id] = net

            # Charger les commutateurs à partir des informations de configuration
            for switch_name, switch_info in topology_config["switches"].items():
                switch = topologies[topo_id].addSwitch(switch_name, cls=OVSSwitch, x=switch_info["position"]["x"], y=switch_info["position"]["y"])
                if "position" in switch_info:  # Vérifier si les coordonnées x et y sont spécifiées dans les informations du switch
                    x = switch_info["position"]["x"]
                    y = switch_info["position"]["y"]
                    coordinates.setdefault(topo_id, {}).setdefault(switch_name, {"x": x, "y": y})
                if "intfs" in switch_info:  # Vérifier si les interfaces sont spécifiées dans les informations du switch
                    switch.intf_coordinates = {}
                    for intf_info in switch_info["intfs"]:
                        intf_name = intf_info["name"]
                        intf_x = intf_info["x"]
                        intf_y = intf_info["y"]
                        switch.intf_coordinates[intf_name] = {'x': intf_x, 'y': intf_y}

            # Charger les hôtes à partir des informations de configuration
            for host_name, host_info in topology_config["hosts"].items():
                host = topologies[topo_id].addHost(host_name, ip=f"10.0.0.{len(topologies[topo_id].hosts) + 1}", x=host_info["position"]["x"], y=host_info["position"]["y"])
                if "position" in host_info:  # Vérifier si les coordonnées x et y sont spécifiées dans les informations de l'hôte
                    x = host_info["position"]["x"]
                    y = host_info["position"]["y"]
                    coordinates.setdefault(topo_id, {}).setdefault(host_name, {"x": x, "y": y})
                if "intfs" in host_info:  # Vérifier si les interfaces sont spécifiées dans les informations de l'hôte
                    host.intf_coordinates = {}
                    for intf_info in host_info["intfs"]:
                        intf_name = intf_info["name"]
                        intf_x = intf_info["x"]
                        intf_y = intf_info["y"]
                        host.intf_coordinates[intf_name] = {'x': intf_x, 'y': intf_y}

            # Charger les liens entre les hôtes et les commutateurs à partir des informations de configuration
            for link_info in topology_config.get("host_switch_links", []):
                host = topologies[topo_id].get(link_info["host"])
                switch = topologies[topo_id].get(link_info["switch"])
                if host and switch:
                    host_intf = link_info["host_intf"]
                    switch_intf = link_info["switch_intf"]
                    link = topologies[topo_id].addLink(host, switch, intfName1=host_intf, intfName2=switch_intf)

            # Démarrer la topologie et effectuer un pingAll
            topologies[topo_id].start()
            #topologies[topo_id].pingAll()





############################################################################################



@app.route('/restapi/topologies/<int:topo_id>', methods=['POST'])
def create_topology(topo_id):
    global topologies
    if topo_id not in topologies:  # Assurez-vous que l'ID n'est pas déjà utilisé
        
        c0 = net.addController('c0')
        topologies[topo_id] = net
         # Sauvegarder la topologie dans un fichier JSON
        filename = f"topology_{topo_id}.json"
        save_topology_to_json(topologies[topo_id],topo_id, filename)
        return jsonify({"id": topo_id})
    else:
        return jsonify({"error": f"Topology with ID {topo_id} already exists"})

    
############################################################################################


# Route pour créer un switch dans une topologie donnée
@app.route('/restapi/topologies/<int:topo_id>/switches', methods=['POST'])
def create_switch(topo_id):
    global topologies
    global coordinates
    
    if topo_id in topologies:
        switch_id = request.json['switch_id']
        x = request.json['x']
        y = request.json['y']
        ports = request.json.get('ports', [])

        # Création du switch avec les coordonnées spécifiées
        switch = topologies[topo_id].addSwitch(switch_id, cls=OVSSwitch, x=x, y=y)
        if topo_id not in coordinates:
            coordinates[topo_id] = {}
        coordinates[topo_id][switch_id] = {"x": x, "y": y}

        # Enregistrer les informations sur les ports dans un dictionnaire ordinaire
        switch.intf_coordinates = {}
        for port_info in ports:
            intf_name = port_info.get('label')
            intf_x = port_info.get('x')
            intf_y = port_info.get('y')
            switch.intf_coordinates[intf_name] = {'x': intf_x, 'y': intf_y}

        # Enregistrer la configuration de la topologie mise à jour avec la position du switch
        filename = f"topology_{topo_id}.json"
        save_topology_to_json(topologies[topo_id], topo_id, filename)
        
        return jsonify({"message": f"Switch {switch_id} created successfully"})
    else:
        return jsonify({"error": f"Topology with ID {topo_id} not found"})


    

############################################################################################


@app.route('/restapi/topologies/<int:topo_id>/nodes', methods=['GET'])
def get_nodes(topo_id):
    global topologies
    if topo_id in topologies:
        nodes = [{'name': node.name, 'type': type(node).__name__} for node in topologies[topo_id].controllers + topologies[topo_id].switches + topologies[topo_id].hosts]
        return jsonify({"nodes": nodes})
    else:
        return jsonify({"error": f"Topology with ID {topo_id} not found"})




############################################################################################
# Route pour créer un lien entre deux switches dans une topologie donnée
@app.route('/restapi/topologies/<int:topo_id>/switches/link', methods=['POST'])
def create_switch_link(topo_id):
    global topologies
    if topo_id in topologies:
        switch1_id = request.json['switch1_id']
        switch2_id = request.json['switch2_id']
        switch1 = topologies[topo_id].get(switch1_id)
        switch2 = topologies[topo_id].get(switch2_id)
        if switch1 and switch2:
            # Check if the link already exists
            if switch1.connectionsTo(switch2):
                return jsonify({"error": f"Link between Switch {switch1_id} and Switch {switch2_id} already exists"})
            else:
                # Assuming switch1 and switch2 are both switches in the Mininet topology
                link = topologies[topo_id].addLink(switch1, switch2)
                # Sauvegarder la topologie dans un fichier JSON
                filename = f"topology_{topo_id}.json"
                save_topology_to_json(topologies[topo_id],topo_id, filename)
                return jsonify({"message": f"Link between Switch {switch1_id} and Switch {switch2_id} created successfully and topology saved to {filename}"})
        else:
            return jsonify({"error": f"One or both switches not found in topology {topo_id}"})
    else:
        return jsonify({"error": f"Topology with ID {topo_id} not found"})


############################################################################################

@app.route('/restapi/topologies/<int:topo_id>/connect_host_to_switch', methods=['POST'])
def connect_host_to_switch(topo_id):
    global topologies
    if topo_id in topologies:
        switch_id = request.json['switch_id']
        host_id = request.json['host_id']
        switch_eth = request.json['switch_label']
        host_eth = request.json['host_label']
        switch = topologies[topo_id].get(switch_id)
        host = topologies[topo_id].get(host_id)
        if switch:
            if host:
                if host.intfList():
                    return jsonify({"error": f"Host {host_id} is already connected to a switch"})
                switch_intf_num = len(switch.intfList()) + 1
                #host_intf_name = "eth0"
                #switch_intf_name = f"eth{switch_intf_num}"
                link = topologies[topo_id].addLink(host, switch, intfName1=host_eth, intfName2=switch_eth)
                
                # Ajouter les informations sur le lien hôte-commutateur au fichier JSON
                filename = f"topology_{topo_id}.json"
                host_switch_link_info = {
                    "host": host_id,
                    "switch": switch_id,
                    "host_intf": host_eth,
                    "switch_intf": switch_eth
                }
                with open(filename, 'r+') as f:
                    topology_config = json.load(f)
                    if "host_switch_links" in topology_config:
                        topology_config["host_switch_links"].append(host_switch_link_info)
                    else:
                        topology_config["host_switch_links"] = [host_switch_link_info]
                    f.seek(0)
                    json.dump(topology_config, f, indent=4)
                    f.truncate()

                # Enregistrer la topologie mise à jour dans le fichier JSON
                save_topology_to_json(topologies[topo_id],topo_id, filename)

                return jsonify({"message": f"Host {host_id} connected to switch {switch_id} with IP {host.IP()} using interface {host_eth}"})
            else:
                return jsonify({"error": f"Host {host_id} not found in topology {topo_id}"})
        else:
            return jsonify({"error": f"Switch {switch_id} not found in topology {topo_id}"})
    else:
        return jsonify({"error": f"Topology with ID {topo_id} not found"})


############################################################################################



# Route pour créer un hôte dans une topologie donnée
@app.route('/restapi/topologies/<int:topo_id>/hosts', methods=['POST'])
def create_host(topo_id):
    global topologies
    global coordinates
    
    if topo_id in topologies:
        host_id = request.json['host_id']
        x = request.json['x']
        y = request.json['y']
        ports = request.json.get('ports', [])

        host = topologies[topo_id].addHost(host_id, ip=f"10.0.0.{len(topologies[topo_id].hosts) + 1}", x=x, y=y)
        if topo_id not in coordinates:
            coordinates[topo_id] = {}
        coordinates[topo_id][host_id] = {"x": x, "y": y}

        # Enregistrer les informations sur les ports dans un dictionnaire ordinaire
        host.intf_coordinates = {}
        for port_info in ports:
            
            intf_name = port_info.get('label')
            intf_x = port_info.get('x')
            intf_y = port_info.get('y')
            print("INTRF    :"+str(intf_x))
            host.intf_coordinates[intf_name] = {'x': intf_x, 'y': intf_y}

        filename = f"topology_{topo_id}.json"
        save_topology_to_json(topologies[topo_id], topo_id, filename)
        return jsonify({"message": f"Host {host_id} created successfully"})
    else:
        return jsonify({"error": f"Topology with ID {topo_id} not found"})








############################################################################################

@app.route('/restapi/topologies/<int:topo_id>/pingall', methods=['GET'])
def pingall(topo_id):
    global topologies
    if topo_id in topologies:
        output = topologies[topo_id].pingAll()
        return jsonify({"result": output})
    else:
        return jsonify({"error": f"Topology with ID {topo_id} not found"})


############################################################################################


@app.route('/restapi/topologies/<int:topo_id>/ping', methods=['POST'])
def ping_between_hosts(topo_id):
    global topologies
    if topo_id in topologies:
        source_host = request.json['source_host']
        dest_host = request.json['dest_host']
        source_host_obj = topologies[topo_id].getNodeByName(source_host)
        dest_host_obj = topologies[topo_id].getNodeByName(dest_host)
        if source_host_obj and dest_host_obj:
            cmd = f"ping -c 4 {dest_host_obj.IP()}"
            ping_process = Popen(cmd, shell=True, stdout=PIPE, stderr=PIPE)
            stdout, stderr = ping_process.communicate()
            if ping_process.returncode == 0:
                return jsonify({"message": f"Ping successful from {source_host} to {dest_host}"})
            else:
                return jsonify({"error": f"Ping failed from {source_host} to {dest_host}"})
        else:
            return jsonify({"error": "Source or destination host not found in topology"})
    else:
        return jsonify({"error": f"Topology with ID {topo_id} not found"})


############################################################################################


@app.route('/restapi/topologies/<int:topo_id>/hosts/details', methods=['GET'])
def get_hosts_details(topo_id):
    global topologies
    if topo_id in topologies:
        hosts = topologies[topo_id].hosts
        hosts_details = []
        for host in hosts:
            links = []
            for intf in host.intfList():
                link_info = {
                    "port": intf.name,
                    "switch": intf.link.intf2.node.name if intf.link else None,
                    "switch_port": intf.link.intf2.name if intf.link else None
                }
                links.append(link_info)
            host_detail = {
                "name": host.name,
                "links": links,
                "ip": host.IP()
            }
            hosts_details.append(host_detail)
        return jsonify({"hosts": hosts_details})
    else:
        return jsonify({"error": f"Topology with ID {topo_id} not found"})
    

############################################################################################


@app.route('/restapi/topologies/<int:topo_id>/start', methods=['POST'])
def start_topology(topo_id):
    net.start()
    global topologies
    if topo_id in topologies:
        topologies[topo_id].pingAll()
        return jsonify({"message": "Topology started successfully"})
    else:
        return jsonify({"error": f"Topology with ID {topo_id} not found"})


############################################################################################


@app.route('/restapi/topologies/<int:topo_id>/stop', methods=['POST'])
def stop_topology(topo_id):
    global topologies
    if topo_id in topologies:
        topologies[topo_id].stop()
        del topologies[topo_id]
        return jsonify({"message": "Topology stopped successfully"})
    else:
        return jsonify({"error": f"Topology with ID {topo_id} not found"})
    

############################################################################################

@app.route('/restapi/topologies/<int:topo_id>/config', methods=['GET'])
def get_topology_config(topo_id):
    filename = f"topology_{topo_id}.json"
    # Assurez-vous que le fichier existe
    if os.path.exists(filename):
        # Renvoyer le contenu du fichier JSON
        return send_from_directory(os.getcwd(), filename)
    else:
        # Si le fichier n'existe pas, renvoyer une erreur 404
        return jsonify({"error": f"Topology configuration file for ID {topo_id} not found"}), 404
    
############################################################################################
# Route pour supprimer tous les nœuds de la topologie
@app.route('/restapi/topologies/<int:topo_id>/reset-topology', methods=['POST'])
def reset_topology(topo_id):
    global topologies
    try:
        # Supprimer tous les nœuds de la topologie
        for node in topologies[topo_id].values():
            topologies[topo_id].delNode(node)
        
        # Enregistrer la configuration de la topologie mise à jour avec la position du switch
        filename = f"topology_{topo_id}.json"
        save_topology_to_json(topologies[topo_id], topo_id, filename)
       
        # Afficher un message de réussite
        return jsonify({"message": "Topology reset successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to reset topology: {str(e)}"}), 500


############################################################################################

# Définition de la fonction pour nettoyer les ressources Mininet
def clean_mininet():
    try:
        # Exécuter la commande 'sudo mn -c' avec le mot de passe sudo
        process = subprocess.Popen(['sudo', '-S', 'mn', '-c'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        stdout, stderr = process.communicate(input='41ugAFBnxJ\n', timeout=10)
        if process.returncode == 0:
            print("Nettoyage des ressources Mininet réussi.")
        else:
            print("Erreur lors du nettoyage des ressources Mininet:", stderr)
    except Exception as e:
        print("Erreur lors de l'exécution de la commande:", e)

# Appel de la fonction pour nettoyer les ressources Mininet
clean_mininet()

load_topology()


if __name__ == '__main__':
    app.run(host='10.0.0.55', port=5000, debug=True)

from flask import Flask, jsonify, request
from flask_cors import CORS
import requests  # Assurez-vous d'ajouter cette ligne
import socket


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


@app.route('/check-connection')
def check_connection():
    return 'Backend en ligne', 200


# URL du deuxième serveur Flask pour sauvegarder les informations
SECOND_SERVER_URL = 'http://10.0.0.55:5001'
# URL du troisième serveur Flask pour créer la topologie dans Mininet
THIRD_SERVER_URL = 'http://10.0.0.55:5002/restapi/topologies'

@app.route('/restapi/topologies/<int:topo_id>/nodes', methods=['POST'])
def receive_nodes_data(topo_id):
    data = request.get_json()
    # Assurez-vous que les données contiennent à la fois les nœuds et les arêtes
    if 'nodes' not in data or 'edges' not in data:
        return jsonify({"error": "Invalid data format, 'nodes' and 'edges' are required"}), 400
   
    # Envoyer les données au deuxième serveur Flask
    try:
        response = requests.post(f'{SECOND_SERVER_URL}/save_data/{topo_id}', json=data)

        response.raise_for_status()
        print("Nodes and edges data sent successfully to the second server")
    except requests.exceptions.RequestException as e:
        print("Error sending nodes and edges data to the second server:", e)
        return jsonify({"error": "Error sending data to the second server"}), 500


    # Envoyer les données au troisième serveur Flask pour créer la topologie dans Mininet
    try:
        if topo_id==1:
            ip="10.0.0.55"
        elif topo_id==2:
            ip="10.0.0.30"

        response = requests.post(f'http://{ip}:5002/restapi/topologies/{topo_id}', json=data)
        response.raise_for_status()
        print("Topology data sent successfully to the third server")
    except requests.exceptions.RequestException as e:
        print("Error sending topology data to the third server:", e)
        return jsonify({"error": "Error sending data to the third server"}), 500


    return jsonify({"message": "Nodes and edges data received successfully"}), 200


@app.route('/restapi/topologies/<int:topo_id>/cli', methods=['POST'])
def execute_command(topo_id):
    data = request.get_json()
    if data and 'command' in data:
        command = data['command']
        if topo_id==1:
            ip="10.0.0.55"
        elif topo_id==2:
            ip="10.0.0.30"

        try:
            # Envoyer la commande au troisième serveur pour exécution dans Mininet
            response = requests.post(f'http://{ip}:5002/restapi/topologies/cli', json={"command": command})
            response.raise_for_status()
            # Renvoyer la réponse du troisième serveur au client
            return jsonify(response.json()), 200
        except requests.exceptions.RequestException as e:
            print("Error executing command in Mininet:", e)
            return jsonify({"error": "Error executing command in Mininet"}), 500
    else:
        return jsonify({"error": "Invalid data format"}), 400


@app.route('/restapi/topologies/<int:topo_id>/config', methods=['GET'])
def get_topology_config(topo_id):
    try:
        # Envoie une requête au troisième serveur pour récupérer le fichier de configuration
        response = requests.get(f'{SECOND_SERVER_URL}/get_data/{topo_id}')
        if response.status_code == 200:
            # Retourne les données reçues du troisième serveur en tant que réponse au client
            return jsonify(response.json())
        else:
            return jsonify({"error": "Failed to fetch topology configuration"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


@app.route('/get-server-info', methods=['GET'])
def get_server_info():
    """Retrieve server info and send it as JSON response."""
    try:
        response = requests.get(f'{SECOND_SERVER_URL}/get_server_info')
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        print("Error retrieving server info:", e)
        return jsonify({"error": "Error retrieving server info"}), 500



def check_connection(ip_address, port):
    try:
        # Créer une instance de socket
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        # Définir un délai pour la connexion (en secondes)
        s.settimeout(5)
        # Tenter de se connecter au serveur
        s.connect((ip_address, port))
        # Si la connexion réussit, fermer la socket et retourner True
        s.close()
        return True
    except Exception as e:
        # Si une exception se produit, imprimer l'erreur et retourner False
        print(f"Error connecting to {ip_address}:{port}: {e}")
        return False

    
      
@app.route('/receive-server-info', methods=['POST'])
def receive_server_info():
    """Receives server info from another Flask server."""
    data = request.get_json()
    if data and 'hostname' in data and 'ip_address' in data and 'port' in data:
        hostname = data['hostname']
        ip_address = data['ip_address']
        port = data['port']
        print(f"Received server info: hostname = {hostname}, IP address = {ip_address}, Port = {port}")

        if check_connection(ip_address, port):
            print(f"Connection to {ip_address}:{port} successful")
        else:
            print(f"Connection to {ip_address}:{port} failed")

        # Send request to the second server to retrieve VM JSON data
        try:
            SECOND_SERVER_URL = 'http://10.0.0.55:5001/get_server_info'
            response = requests.get(SECOND_SERVER_URL)
            response.raise_for_status()
            vm_data = response.json()
            print(vm_data)
        except requests.exceptions.RequestException as e:
            print("Error retrieving VM data from the second server:", e)
            return jsonify({"error": "Error retrieving VM data"}), 500
        
        # Check if the VM already exists
        new_vm = {"hostname": hostname, "ip_address": ip_address, "port": port}
        vm_exists = False
        for vm_key, vm_info in vm_data.items():
            if new_vm == vm_info:
                vm_exists = True
                break

        if not vm_exists:
            # Add the new VM to the data
            new_vm_key = f"{len(vm_data) + 1}"
            vm_data[new_vm_key] = new_vm
            # Send updated data back to the second server for storage
            try:
                response = requests.post('http://10.0.0.55:5001/save_server_info', json=vm_data)
                response.raise_for_status()
                print("Updated VM data sent successfully to the second server for storage")
            except requests.exceptions.RequestException as e:
                print("Error sending updated VM data to the second server:", e)
                return jsonify({"error": "Error sending updated VM data"}), 500
        
        return jsonify({"message": "Server info received successfully"}), 200
    else:
        return jsonify({"error": "Invalid data format"}), 400

if __name__ == '__main__':
    app.run(host='10.0.0.55', port=5000, debug=True)

from flask import Flask, jsonify, request
from flask_cors import CORS
import requests  # Assurez-vous d'ajouter cette ligne


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


SECOND_SERVER_URLS = {
    1: "http://10.0.0.55:5002/test",
    2: "http://10.0.0.30:5002/test"
}



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
    



if __name__ == '__main__':
    app.run(host='10.0.0.55', port=5000, debug=True)




















    #nodes = data['nodes']
    #print("Nodes received:")
    #for node in nodes:
    #    print(node['id'])  # Affiche uniquement l'ID du nœud
    #edges = data['edges']
    #print("Edges received:")
    #for edge in edges:
    #    switch_id = edge.get('switch_id')
    #    host_id = edge.get('host_id')
    #    switch_label = edge.get('switch_label')
    #    host_label = edge.get('host_label')
    #    print(f"Switch ID: {switch_id}, Host ID: {host_id}, Switch Label: {switch_label}, Host Label: {host_label}")

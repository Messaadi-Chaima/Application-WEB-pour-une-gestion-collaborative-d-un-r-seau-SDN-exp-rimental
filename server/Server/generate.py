from flask import Flask, jsonify, request ,send_file
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)  # Activer CORS pour toutes les routes

# Chemin du fichier JSON pour sauvegarder les informations

JSON_FILE_PATH = 'data_'
JSON_SERVER_PATH = 'server_info.json'

@app.route('/save_data/<int:topology_id>', methods=['POST'])
def save_data(topology_id):
    data = request.get_json()
    # Sauvegarde des données dans le fichier JSON
    with open(JSON_FILE_PATH+f'{topology_id}'+'.json', 'w') as file:
        json.dump(data, file, indent=4)

    return jsonify({"message": "Data saved successfully"}), 200

@app.route('/get_data/<int:topology_id>', methods=['GET'])
def get_data(topology_id):
    try:
        if os.path.exists(JSON_FILE_PATH+f'{topology_id}'+'.json'):
            # Charge le fichier de configuration JSON
            with open(JSON_FILE_PATH+f'{topology_id}'+'.json', 'r') as file:
                config_data = json.load(file)
            return jsonify(config_data)
        else:
            return jsonify({"error": "File doesn't exist"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/save_server_info', methods=['POST'])
def save_server_info():
    """Receives server info from another Flask server and saves it to a JSON file."""
    data = request.get_json()
    if data:
        try:
            # Enregistrement des données dans un fichier JSON
            with open(JSON_SERVER_PATH, 'w') as file:
                json.dump(data, file, indent=4)
            print("Server info saved successfully to server_info.json")
            return jsonify({"message": "Server info saved successfully"}), 200
        except Exception as e:
            print("Error saving server info:", e)
            return jsonify({"error": "Error saving server info"}), 500
    else:
        return jsonify({"error": "No data received"}), 400
    
@app.route('/get_server_info', methods=['GET'])
def get_server_info():
    try:
        if os.path.exists(JSON_SERVER_PATH):
            # Load the server info JSON file
            with open(JSON_SERVER_PATH, 'r') as file:
                config_data = json.load(file)
        else:
            # Initialize the file with an empty dictionary if it doesn't exist
            config_data = {}
            with open(JSON_SERVER_PATH, 'w') as file:
                json.dump(config_data, file, indent=4)
            print("Initialized server_info.json with an empty dictionary")
        
        return jsonify(config_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='10.0.0.55', port=5001, debug=True)

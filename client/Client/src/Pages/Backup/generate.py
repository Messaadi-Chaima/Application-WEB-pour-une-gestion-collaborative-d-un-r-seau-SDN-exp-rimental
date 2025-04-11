from flask import Flask, jsonify, request ,send_file
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)  # Activer CORS pour toutes les routes

# Chemin du fichier JSON pour sauvegarder les informations

JSON_FILE_PATH = 'data_'
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
        
if __name__ == '__main__':
    app.run(host='10.0.0.55', port=5001, debug=True)

# Backend for parsing
from flask import Flask, request, jsonify
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

# Endpoint: /parse
# -- Triggered by pressing the parse button with some content
@app.route("/parse", methods=["POST"])
def parse_vcd():
    recevied = dict(request.get_json())
    file_content = recevied.get('content', )

    if not file_content:
        return jsonify({'error': "No content provided"}), 400

    # Continue to parse the data
    parsed_result = "SUCCESS"
    return jsonify({"data": parsed_result})


if __name__ == "__main__":
    app.run(debug=True, port=5000)

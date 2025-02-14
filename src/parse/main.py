# Backend for parsing
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_caching import Cache
from werkzeug.exceptions import RequestEntityTooLarge
import tempfile
import os
import sys
import vcd_parser

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 1000 * 1024 * 1024
cache_config = {
    "DEBUG": True,
    "CACHE_TYPE": "SimpleCache",
    "CACHE_DEFAULT_TIMEOUT": 300,
}
app.config.from_mapping(cache_config)
cache = Cache(app)
CORS(app)

parser = None
file_name = None
num_pos_cycles = None
num_neg_cycles = None


@app.errorhandler(RequestEntityTooLarge)
def handle_file_too_large(e):
    return jsonify(error="File uploaded is too large"), 413


"""Endpoint: /parse/
-- Triggered by pressing the parse button with some content"""
@app.route("/backend/parse/", methods=["POST"])
def parse_vcd():
    global parser
    global file_name
    global num_pos_cycles
    global num_neg_cycles
    if "file" not in request.files:
        return jsonify({"error": "No content provided"}), 400

    file = request.files["file"]

    # Create a temporary file
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        file.save(temp_file.name)
        temp_file_path = temp_file.name

    try:
        # Process the VCD file
        parser = vcd_parser.VCDParser(temp_file_path)
        file_name = file.name
        num_pos_cycles = parser.get_pos_cycle_numbers()
        num_neg_cycles = parser.get_neg_cycle_numbers()

        # Clean up by deleting the temporary file
        os.remove(temp_file_path)

        return jsonify({"file_name": file.name, "num_pos_cycles": num_pos_cycles, "num_neg_cycles": num_neg_cycles})
    except Exception as e:
        os.remove(temp_file_path)  # Ensure file is deleted even on failure
        return jsonify({"error": f"Parsing failed: {str(e)}"}), 500


"""frontend /debugger calling /backend/<pos/neg>/<cycle_number>/"""
@app.route("/backend/<pos_neg>/<cycle_number>/", methods=["GET"])
def cycle_info(pos_neg, cycle_number):
    # Check if the parser is here
    index = int(cycle_number) << 1 if pos_neg.lower(
    ) == "pos" else int(cycle_number)
    if parser:
        result = parser.query_row(index)
        return jsonify({"data": result})
    else:
        return jsonify({"error": "No avilable parser, needing reparse"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)

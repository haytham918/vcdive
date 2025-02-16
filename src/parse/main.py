# Backend for parsing
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.exceptions import RequestEntityTooLarge
import tempfile
import os
import sys
import vcd_parser
from connect_caen import debug_vcd_on_caen

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 1000 * 1024 * 1024
CORS(app)

parser = None
file_name = None
num_pos_cycles = None
num_neg_cycles = None


@app.errorhandler(RequestEntityTooLarge)
def handle_file_too_large(e):
    return jsonify(error="File uploaded is too large"), 413


@app.route("/backend/caen/", methods=["POST"])
def parse_vcd_on_cane():
    """
    Frontend specify the filename on CAEN and click the button
    Call debug_on_caen method

    REMEMBER: set your environmental variable for your SSH_CAEN_PASSWORD
    REMEMBER: change with your uniqname, and the directory to the repo that includes "vcd" directory (ending with /)
    """
    try:
        data = request.get_json()
        if not data or "file_name" not in data:
            return jsonify({"error": "No data or file_name being sent"}), 400
        caen_file_name = data['file_name']
        debug_vcd_on_caen("yunxuant", "~/eecs470/test_shit/", caen_file_name)
        return jsonify({"message": "Works succesfully on CAEN"})  # It works
    except Exception as e:  # Some error happens
        return jsonify({"error": str(e)}), 500


@app.route("/backend/parse/", methods=["POST"])
def parse_vcd():
    """
    Endpoint: /parse/
    -- Triggered by:
        -- pressing the parse button with some content
        -- pressing the utton to work on CAEN
    """
    global parser
    global file_name
    global num_pos_cycles
    global num_neg_cycles
    if "file" not in request.files:
        return jsonify({"error": "No content provided"}), 400

    file = request.files["file"]
    # If the same file has been parsed
    if file.filename == file_name:
        print("SAME", file=sys.stderr)
        return jsonify({"file_name": file_name, "num_pos_cycles": num_pos_cycles, "num_neg_cycles": num_neg_cycles})

    # Create a temporary file
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        file.save(temp_file.name)
        temp_file_path = temp_file.name

    try:
        # Process the VCD file
        parser = vcd_parser.VCDParser(temp_file_path)
        file_name = file.filename
        num_pos_cycles = parser.get_pos_cycle_numbers()
        num_neg_cycles = parser.get_neg_cycle_numbers()

        # Clean up by deleting the temporary file
        os.remove(temp_file_path)

        return jsonify({"file_name": file_name, "num_pos_cycles": num_pos_cycles, "num_neg_cycles": num_neg_cycles})
    except Exception as e:
        os.remove(temp_file_path)  # Ensure file is deleted even on failure
        return jsonify({"error": f"Parsing failed: {str(e)}"}), 500


@app.route("/backend/file_metadata", methods=["GET"])
def get_metadata():
    """
    This is the endpoint when the front-end loads the /debugger page
    It will try to fetch metadata about the file (if available on python)
    This is useful if we forward from ssh, and then directly navigate to the page
    """
    # If there is file_name available, we have parsed something
    if (file_name):
        return jsonify({"file_name": file_name, "num_pos_cycles": num_pos_cycles, "num_neg_cycles": num_neg_cycles})
    else:
        return jsonify({"error": "No available parsed file"}), 500


@app.route("/backend/<pos_neg>/<cycle_number>/", methods=["GET"])
def cycle_info(pos_neg, cycle_number):
    """
    Frontend /debugger calling /backend/<pos/neg>/<cycle_number>/
    pos_neg: pos => only positive cycles, neg => all cycles including neg
    cycle_number: the relative cycle number we fetching information from
    """
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

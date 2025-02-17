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
num_pos_clocks = None
num_neg_clocks = None


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
        debug_vcd_on_caen(
            "yunxuant", "~/eecs470/p4-w25.group11/", caen_file_name)
        return jsonify({"message": "Works succesfully on CAEN"})  # It works
    except Exception as e:  # Some error happens
        return jsonify({"error": str(e)}), 500


@app.route("/backend/local/", methods=["POST"])
def parse_vcd_from_local():
    """
    Front end specify the filename inside the inputs directory

    run the parse here
    """
    global file_name
    global parser
    global num_pos_clocks
    global num_neg_clocks
    try:
        data = request.get_json()
        # Check if data is sent and there is file_name
        if not data or "file_name" not in data:
            return jsonify({"error": "No data or file_name"}), 400

        # Sanitize the filename to prevent directory traversal
        fetch_file_name = os.path.basename(data["file_name"])
        # Construct the full file path
        file_path = os.path.join("../../inputs", fetch_file_name)
        # Check if the file actually exists
        is_existed = os.path.isfile(file_path)
        if not is_existed:
            return jsonify({"error": "No such file in /inputs/ "}), 400

        # Parse the vcd contents if not same
        if file_name != data["file_name"]:
            file_name = data["file_name"]
            parser = vcd_parser.VCDParser(file_path)
            num_pos_clocks = parser.get_pos_clock_numbers()
            num_neg_clocks = parser.get_neg_clock_numbers()

        return jsonify({"file_name": file_name, "num_pos_clocks": num_pos_clocks, "num_neg_clocks": num_neg_clocks})
    except Exception as e:
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
    global num_pos_clocks
    global num_neg_clocks
    if "file" not in request.files:
        return jsonify({"error": "No content provided"}), 400

    file = request.files["file"]
    # If the same file has been parsed
    if file.filename == file_name:
        return jsonify({"file_name": file_name, "num_pos_clocks": num_pos_clocks, "num_neg_clocks": num_neg_clocks})

    # Create a temporary file
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        file.save(temp_file.name)
        temp_file_path = temp_file.name

    try:
        # Process the VCD file
        parser = vcd_parser.VCDParser(temp_file_path)
        file_name = file.filename
        num_pos_clocks = parser.get_pos_clock_numbers()
        num_neg_clocks = parser.get_neg_clock_numbers()

        # Clean up by deleting the temporary file
        os.remove(temp_file_path)

        return jsonify({"file_name": file_name, "num_pos_clocks": num_pos_clocks, "num_neg_clocks": num_neg_clocks})
    except Exception as e:
        os.remove(temp_file_path)  # Ensure file is deleted even on failure
        return jsonify({"error": f"Parsing failed: {str(e)}"}), 500


@app.route("/backend/file_metadata/", methods=["GET"])
def get_metadata():
    """
    This is the endpoint when the front-end loads the /debugger page
    It will try to fetch metadata about the file (if available on python)
    This is useful if we forward from ssh, and then directly navigate to the page
    """
    # If there is file_name available, we have parsed something
    if (file_name):
        return jsonify({"file_name": file_name, "num_pos_clocks": num_pos_clocks, "num_neg_clocks": num_neg_clocks})
    else:
        return jsonify({"error": "No available parsed file"}), 500


@app.route("/backend/<pos_neg>/<cycle_number>/", methods=["GET"])
def cycle_info(pos_neg, cycle_number):
    """
    Frontend /debugger calling /backend/<pos/neg>/<cycle_number>/
    pos_neg: pos => only positive clocks, neg => all clocks including neg
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

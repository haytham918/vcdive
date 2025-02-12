# Backend for parsing
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.exceptions import RequestEntityTooLarge
import tempfile
import os
import sys
import vcd_parser

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 1000 * 1024 * 1024
CORS(app)

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.errorhandler(RequestEntityTooLarge)
def handle_file_too_large(e):
    return jsonify(error="File uploaded is too large"), 413


"""Endpoint: /parse
-- Triggered by pressing the parse button with some content"""
@app.route("/backend/parse/", methods=["POST"])
def parse_vcd():
    if 'file' not in request.files:
        return jsonify({'error': "No content provided"}), 400
    
    file = request.files['file']
    filename = request.form.get("filename")
    part = request.form.get("part")
    
    if not filename or part is None:
        return jsonify({"erorr": "Missing filename or part number"}), 400
    
    file_path = os.path.join(UPLOAD_DIR, filename)
    # Append chunk to file
    with open(file_path, "ab") as f:
        f.write(file.read())
    
    ## If this is the last chunk, process the complete file
    if request.form.get("final") == "true":
        try:
            parser = vcd_parser.VCDParser(file_path)
            row = parser.query_row(0)
            print(row)
            os.remove(file_path)  # Delete file after processing
            return jsonify({"data": row})
        except Exception as e:
            return jsonify({"error": f"Parsing failed: {str(e)}"}), 500
    return jsonify({"message": f"Chunk {part} uploaded successfully"}), 200


"""frontend /debugger calling /backend/(cycle_number)"""


@app.route("/backend/(cycle_number)", methods=["GET"])
def cycle_info():
    pass


if __name__ == "__main__":
    app.run(debug=True, port=5000)

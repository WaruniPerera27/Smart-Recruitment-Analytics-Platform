from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load environment variables FIRST
load_dotenv()

# Initialise Flask
app = Flask(__name__)
CORS(app)

# ── Import routes ──
from routes.auth_routes      import auth_bp
from routes.job_routes       import job_bp
from routes.candidate_routes import candidate_bp
from routes.bias_routes      import bias_bp

# ── Register blueprints ──
app.register_blueprint(auth_bp,      url_prefix='/api/auth')
app.register_blueprint(job_bp,       url_prefix='/api/jobs')
app.register_blueprint(candidate_bp, url_prefix='/api/candidates')
app.register_blueprint(bias_bp,      url_prefix='/api/bias')

# ── Health check ──
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message' : 'Smart Recruitment Analytics Platform API',
        'status'  : 'running',
        'version' : '1.0.0'
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
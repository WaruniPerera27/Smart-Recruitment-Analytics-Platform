# CV Upload, Rankings & Detail
from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId
import os
import jwt
import datetime
from ml_pipeline import process_cv

load_dotenv()

candidate_bp = Blueprint('candidates', __name__)

# MongoDB connection
client         = MongoClient(os.getenv('MONGO_URI'))
db             = client['smart_recruitment']
candidates_col = db['candidates']
jobs_col       = db['jobs']

SECRET_KEY = os.getenv('JWT_SECRET')

# ── Helper: verify JWT token ──
def verify_token(request):
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        return None
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return decoded
    except:
        return None

# ── Upload CVs & Score ──
@candidate_bp.route('/upload/<job_id>', methods=['POST'])
def upload_cvs(job_id):
    try:
        # Verify token
        user = verify_token(request)
        if not user:
            return jsonify({
                'success' : False,
                'message' : 'Unauthorised — please login'
            }), 401

        # Get job details
        job = jobs_col.find_one({'_id': ObjectId(job_id)})
        if not job:
            return jsonify({
                'success' : False,
                'message' : 'Job not found'
            }), 404

        job_description = job['description']

        # Get uploaded PDF files
        files = request.files.getlist('cvs')
        if not files:
            return jsonify({
                'success' : False,
                'message' : 'No CV files uploaded'
            }), 400

        results = []

        for file in files:
            if file.filename == '':
                continue

            # Read PDF bytes
            pdf_bytes = file.read()

            # Run full ML pipeline
            result = process_cv(pdf_bytes, job_description)

            # Save candidate to MongoDB
            candidate = {
                'job_id'               : job_id,
                'filename'             : file.filename,
                'cv_text_preview'      : result['cv_text'],
                'features'             : result['features'],
                'xgb_prediction'       : result['xgb_prediction'],
                'xgb_probability'      : result['xgb_probability'],
                'ann_prediction'       : result['ann_prediction'],
                'ann_probability'      : result['ann_probability'],
                'embedding_similarity' : result['embedding_similarity'],
                'keyword_score'        : result['keyword_score'],
                'final_score'          : result['final_score'],
                'match_badge'          : result['match_badge'],
                'shap_explanation'     : result['shap_explanation'],
                'uploaded_at'          : datetime.datetime.utcnow()
            }

            saved = candidates_col.insert_one(candidate)
            result['candidate_id'] = str(saved.inserted_id)
            result['filename']     = file.filename
            results.append(result)

        # Sort by final score
        results = sorted(
            results,
            key    = lambda x: x['final_score'],
            reverse= True
        )

        return jsonify({
            'success'    : True,
            'message'    : f'{len(results)} CVs processed successfully',
            'candidates' : results
        }), 200

    except Exception as e:
        return jsonify({
            'success' : False,
            'message' : str(e)
        }), 500


# ── Get All Candidates for a Job (Rankings) ──
@candidate_bp.route('/rankings/<job_id>', methods=['GET'])
def get_rankings(job_id):
    try:
        # Verify token
        user = verify_token(request)
        if not user:
            return jsonify({
                'success' : False,
                'message' : 'Unauthorised — please login'
            }), 401

        # Get all candidates for this job
        candidates = list(candidates_col.find(
            {'job_id': job_id}
        ).sort('final_score', -1))

        # Convert ObjectId to string
        for c in candidates:
            c['_id']         = str(c['_id'])
            c['uploaded_at'] = str(c['uploaded_at'])

        return jsonify({
            'success'    : True,
            'candidates' : candidates,
            'count'      : len(candidates)
        }), 200

    except Exception as e:
        return jsonify({
            'success' : False,
            'message' : str(e)
        }), 500


# ── Get Single Candidate Detail ──
@candidate_bp.route('/detail/<candidate_id>', methods=['GET'])
def get_candidate_detail(candidate_id):
    try:
        # Verify token
        user = verify_token(request)
        if not user:
            return jsonify({
                'success' : False,
                'message' : 'Unauthorised — please login'
            }), 401

        candidate = candidates_col.find_one(
            {'_id': ObjectId(candidate_id)}
        )
        if not candidate:
            return jsonify({
                'success' : False,
                'message' : 'Candidate not found'
            }), 404

        candidate['_id']         = str(candidate['_id'])
        candidate['uploaded_at'] = str(candidate['uploaded_at'])

        return jsonify({
            'success'   : True,
            'candidate' : candidate
        }), 200

    except Exception as e:
        return jsonify({
            'success' : False,
            'message' : str(e)
        }), 500
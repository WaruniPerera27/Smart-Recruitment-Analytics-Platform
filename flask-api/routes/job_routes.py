
# Create & Get Jobs

from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId
import os
import jwt
import datetime

load_dotenv()

job_bp = Blueprint('jobs', __name__)

# MongoDB connection
client   = MongoClient(os.getenv('MONGO_URI'))
db       = client['smart_recruitment']
jobs_col = db['jobs']

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

# ── Create Job ──
@job_bp.route('/create', methods=['POST'])
def create_job():
    try:
        # Verify token
        user = verify_token(request)
        if not user:
            return jsonify({
                'success' : False,
                'message' : 'Unauthorised — please login'
            }), 401

        data            = request.get_json()
        title           = data.get('title')
        description     = data.get('description')
        required_skills = data.get('required_skills', [])

        if not title or not description:
            return jsonify({
                'success' : False,
                'message' : 'Job title and description are required'
            }), 400

        # Save job to MongoDB
        job = {
            'title'           : title,
            'description'     : description,
            'required_skills' : required_skills,
            'recruiter_id'    : user['user_id'],
            'recruiter_email' : user['email'],
            'created_at'      : datetime.datetime.utcnow()
        }
        result = jobs_col.insert_one(job)

        return jsonify({
            'success' : True,
            'message' : 'Job created successfully',
            'job_id'  : str(result.inserted_id)
        }), 201

    except Exception as e:
        return jsonify({
            'success' : False,
            'message' : str(e)
        }), 500


# ── Get All Jobs ──
@job_bp.route('/all', methods=['GET'])
def get_all_jobs():
    try:
        # Verify token
        user = verify_token(request)
        if not user:
            return jsonify({
                'success' : False,
                'message' : 'Unauthorised — please login'
            }), 401

        # Get jobs for this recruiter
        jobs = list(jobs_col.find(
            {'recruiter_id': user['user_id']}
        ).sort('created_at', -1))

        # Convert ObjectId to string
        for job in jobs:
            job['_id'] = str(job['_id'])
            job['created_at'] = str(job['created_at'])

        return jsonify({
            'success' : True,
            'jobs'    : jobs,
            'count'   : len(jobs)
        }), 200

    except Exception as e:
        return jsonify({
            'success' : False,
            'message' : str(e)
        }), 500


# ── Get Single Job ──
@job_bp.route('/<job_id>', methods=['GET'])
def get_job(job_id):
    try:
        # Verify token
        user = verify_token(request)
        if not user:
            return jsonify({
                'success' : False,
                'message' : 'Unauthorised — please login'
            }), 401

        job = jobs_col.find_one({'_id': ObjectId(job_id)})
        if not job:
            return jsonify({
                'success' : False,
                'message' : 'Job not found'
            }), 404

        job['_id']        = str(job['_id'])
        job['created_at'] = str(job['created_at'])

        return jsonify({
            'success' : True,
            'job'     : job
        }), 200

    except Exception as e:
        return jsonify({
            'success' : False,
            'message' : str(e)
        }), 500


# ── Delete Job ──
@job_bp.route('/delete/<job_id>', methods=['DELETE'])
def delete_job(job_id):
    try:
        # Verify token
        user = verify_token(request)
        if not user:
            return jsonify({
                'success' : False,
                'message' : 'Unauthorised — please login'
            }), 401

        result = jobs_col.delete_one({'_id': ObjectId(job_id)})
        if result.deleted_count == 0:
            return jsonify({
                'success' : False,
                'message' : 'Job not found'
            }), 404

        return jsonify({
            'success' : True,
            'message' : 'Job deleted successfully'
        }), 200

    except Exception as e:
        return jsonify({
            'success' : False,
            'message' : str(e)
        }), 500
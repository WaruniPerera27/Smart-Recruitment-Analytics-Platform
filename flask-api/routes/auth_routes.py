
# Auth Routes - routes/auth_routes.py
# Register & Login


from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import bcrypt
import jwt
import datetime

load_dotenv()

auth_bp = Blueprint('auth', __name__)

# MongoDB connection
client    = MongoClient(os.getenv('MONGO_URI'))
db        = client['smart_recruitment']
users_col = db['users']

SECRET_KEY = os.getenv('JWT_SECRET')
# ── Register ──
@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data     = request.get_json()
        name     = data.get('name')
        email    = data.get('email')
        password = data.get('password')

        # Check all fields provided
        if not name or not email or not password:
            return jsonify({
                'success' : False,
                'message' : 'Name, email and password are required'  }), 400
        # Check if email already exists
        existing_user = users_col.find_one({'email': email})
        if existing_user:
            return jsonify({
                'success' : False,
         'message' : 'Email already registered'}), 409

        # Hash password
        hashed_password = bcrypt.hashpw(
            password.encode('utf-8'),
            bcrypt.gensalt() )
        # Save user to MongoDB
        user = {
            'name'       : name,
            'email'      : email,
            'password'   : hashed_password,
            'created_at' : datetime.datetime.utcnow() }
        result = users_col.insert_one(user)
        # Generate JWT token
        token = jwt.encode({
            'user_id' : str(result.inserted_id),
            'email'   : email,
            'exp'     : datetime.datetime.utcnow() +
                        datetime.timedelta(days=7)
        }, SECRET_KEY, algorithm='HS256')
        return jsonify({
            'success' : True,
            'message' : 'Registration successful',
            'token'   : token,
            'user'    : {
                'name'  : name,
                'email' : email  } }), 201
    except Exception as e:
        return jsonify({
            'success' : False,
            'message' : str(e) }), 500


# ── Login ──
@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data     = request.get_json()
        email    = data.get('email')
        password = data.get('password')

        # Check all fields provided
        if not email or not password:
            return jsonify({
                'success' : False,
                'message' : 'Email and password are required'
            }), 400

        # Find user in MongoDB
        user = users_col.find_one({'email': email})
        if not user:
            return jsonify({
                'success' : False,
                'message' : 'Invalid email or password'
            }), 401

        # Verify password
        password_match = bcrypt.checkpw(
            password.encode('utf-8'),
            user['password'] )
        if not password_match:
            return jsonify({
                'success' : False,
                'message' : 'Invalid email or password'  }), 401

        # Generate JWT token
        token = jwt.encode({
            'user_id' : str(user['_id']),
            'email'   : email,
            'exp'     : datetime.datetime.utcnow() +
                        datetime.timedelta(days=7)
        }, SECRET_KEY, algorithm='HS256')

        return jsonify({
            'success' : True,
            'message' : 'Login successful',
            'token'   : token,
            'user'    : {
                'name'  : user['name'],
                'email' : email  }  }), 200

    except Exception as e:
        return jsonify({
            'success' : False,
            'message' : str(e)   }), 500
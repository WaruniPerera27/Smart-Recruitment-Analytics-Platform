from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId
import os
import jwt
import numpy as np
import pandas as pd
import joblib

load_dotenv()

bias_bp = Blueprint('bias', __name__)

# MongoDB connection
client         = MongoClient(os.getenv('MONGO_URI'))
db             = client['smart_recruitment']
candidates_col = db['candidates']
reports_col    = db['fairness_reports']

SECRET_KEY = os.getenv('JWT_SECRET')

# Load scaler
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, '..', 'models')
xgb_scaler = joblib.load(os.path.join(MODELS_DIR, 'xgb_scaler.pkl'))

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

#  Manual Fairness Metrics 
def calculate_disparate_impact(df, label_col, group_col):
    unprivileged = df[df[group_col] == 0][label_col].mean()
    privileged   = df[df[group_col] == 1][label_col].mean()
    if privileged == 0:
        return 1.0
    return round(float(unprivileged / privileged), 4)

def calculate_spd(df, label_col, group_col):
    unprivileged = df[df[group_col] == 0][label_col].mean()
    privileged   = df[df[group_col] == 1][label_col].mean()
    return round(float(unprivileged - privileged), 4)

def apply_reweighing(df, label_col, group_col):

    # Reweighing — adjust weights to reduce bias
    n         = len(df)
    n_pos     = df[label_col].sum()
    n_neg     = n - n_pos
    n_unpriv  = (df[group_col] == 0).sum()
    n_priv    = (df[group_col] == 1).sum()

    weights = []
    for _, row in df.iterrows():
        if row[group_col] == 0 and row[label_col] == 1:
            w = (n_pos * n_unpriv) / (n * df[(df[group_col]==0) & (df[label_col]==1)].shape[0] + 1e-10)
        elif row[group_col] == 0 and row[label_col] == 0:
            w = (n_neg * n_unpriv) / (n * df[(df[group_col]==0) & (df[label_col]==0)].shape[0] + 1e-10)
        elif row[group_col] == 1 and row[label_col] == 1:
            w = (n_pos * n_priv)   / (n * df[(df[group_col]==1) & (df[label_col]==1)].shape[0] + 1e-10)
        else:
            w = (n_neg * n_priv)   / (n * df[(df[group_col]==1) & (df[label_col]==0)].shape[0] + 1e-10)
        weights.append(w)

    df['weight'] = weights

    # Weighted hire rates
    unpriv_df = df[df[group_col] == 0]
    priv_df   = df[df[group_col] == 1]

    unpriv_rate = (unpriv_df[label_col] * unpriv_df['weight']).sum() / unpriv_df['weight'].sum()
    priv_rate   = (priv_df[label_col]   * priv_df['weight']).sum()   / priv_df['weight'].sum()

    di_after  = round(float(unpriv_rate / priv_rate) if priv_rate > 0 else 1.0, 4)
    spd_after = round(float(unpriv_rate - priv_rate), 4)

    return di_after, spd_after

# ── Generate Bias Report ──
@bias_bp.route('/report/<job_id>', methods=['GET'])
def get_bias_report(job_id):
    try:
        user = verify_token(request)
        if not user:
            return jsonify({
                'success' : False,
                'message' : 'Unauthorised — please login'
            }), 401

        candidates = list(candidates_col.find({'job_id': job_id}))

        if len(candidates) < 5:
            return jsonify({
                'success' : False,
                'message' : 'At least 5 candidates required for fairness analysis'
            }), 400

        # Build dataframe
        rows = []
        for c in candidates:
            f = c.get('features', {})
            rows.append({
                'Experience (Years)' : f.get('Experience (Years)', 0),
                'Decision_Label'     : c.get('xgb_prediction', 0)
            })

        df = pd.DataFrame(rows)

        # Protected attribute — Junior vs Senior
        median_exp             = df['Experience (Years)'].median()
        df['Experience_Group'] = (df['Experience (Years)'] > median_exp).astype(int)

        # Metrics BEFORE mitigation
        di_before  = calculate_disparate_impact(df, 'Decision_Label', 'Experience_Group')
        spd_before = calculate_spd(df, 'Decision_Label', 'Experience_Group')

        # Metrics AFTER reweighing
        di_after, spd_after = apply_reweighing(df, 'Decision_Label', 'Experience_Group')

        report = {
            'job_id'            : job_id,
            'total_candidates'  : len(candidates),
            'median_experience' : float(median_exp),
            'junior_count'      : int((df['Experience_Group'] == 0).sum()),
            'senior_count'      : int((df['Experience_Group'] == 1).sum()),
            'before_mitigation' : {
                'disparate_impact'              : di_before,
                'statistical_parity_difference' : spd_before,
                'di_status'  : 'Fair' if 0.8 <= di_before  <= 1.2 else 'Biased',
                'spd_status' : 'Fair' if -0.1 <= spd_before <= 0.1 else 'Biased'
            },
            'after_mitigation'  : {
                'disparate_impact'              : di_after,
                'statistical_parity_difference' : spd_after,
                'di_status'  : 'Fair' if 0.8 <= di_after  <= 1.2 else 'Biased',
                'spd_status' : 'Fair' if -0.1 <= spd_after <= 0.1 else 'Biased'
            },
            'generated_at' : str(pd.Timestamp.now())
        }

        reports_col.update_one(
            {'job_id': job_id},
            {'$set': report},
            upsert=True
        )

        return jsonify({
            'success' : True,
            'report'  : report
        }), 200

    except Exception as e:
        return jsonify({
            'success' : False,
            'message' : str(e)
        }), 500
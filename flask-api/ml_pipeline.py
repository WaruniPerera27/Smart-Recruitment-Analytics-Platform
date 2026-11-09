import joblib, json, os, warnings
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras import layers, Sequential
import xgboost as xgb
import spacy
import fitz
import shap
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
warnings.filterwarnings('ignore')

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')

FEATURES = [
    'Experience (Years)', 'Education_Label',
    'Skill_Count', 'Has_Certification', 'JobRole_Label'
]

print('Loading ML models...')

xgb_model = xgb.XGBClassifier()
xgb_model.load_model(os.path.join(MODELS_DIR, 'xgb_model_new.json'))
print('XGBoost loaded!')

xgb_scaler = joblib.load(os.path.join(MODELS_DIR, 'xgb_scaler.pkl'))
print('XGBoost scaler loaded!')

ann_model = Sequential([
    layers.Input(shape=(5,)),
    layers.Dense(64, activation='relu'),
    layers.BatchNormalization(),
    layers.Dropout(0.3),
    layers.Dense(32, activation='relu'),
    layers.BatchNormalization(),
    layers.Dropout(0.2),
    layers.Dense(16, activation='relu'),
    layers.Dense(1, activation='sigmoid')
])

with open(os.path.join(MODELS_DIR, 'ann_weights.json'), 'r') as f:
    weights_list = json.load(f)
ann_model.set_weights([np.array(w) for w in weights_list])
print('ANN loaded!')

ann_scaler = joblib.load(os.path.join(MODELS_DIR, 'ann_scaler.pkl'))
print('ANN scaler loaded!')

nlp = spacy.load('en_core_web_sm')
print('All models ready!')

def extract_text_from_pdf(pdf_bytes):
    text = ''
    with fitz.open(stream=pdf_bytes, filetype='pdf') as doc:
        for page in doc:
            text += page.get_text()
    return text.strip()

def extract_cv_features(cv_text):
    doc = nlp(cv_text.lower())
    experience_years = 0
    for token in doc:
        if token.like_num and token.i + 1 < len(doc):
            if 'year' in doc[token.i + 1].text or 'yr' in doc[token.i + 1].text:
                try:
                    experience_years = float(token.text)
                except:
                    pass
    edu = {'phd':4,'doctorate':4,'master':3,'msc':3,'mba':3,
           'bachelor':2,'bsc':2,'degree':2,'diploma':1,'certificate':1}
    education_label = 0
    for k, v in edu.items():
        if k in cv_text.lower():
            education_label = max(education_label, v)
    skills = ['python','java','javascript','sql','machine learning',
              'deep learning','react','node','mongodb','flask',
              'tensorflow','keras','nlp','data analysis','excel',
              'communication','leadership','teamwork','problem solving',
              'project management','agile','scrum','git','docker']
    skill_count = sum(1 for s in skills if s in cv_text.lower())
    certs = ['certified','certification','certificate','aws','pmp','cissp']
    has_certification = int(any(c in cv_text.lower() for c in certs))
    return {
        'Experience (Years)': experience_years,
        'Education_Label'   : education_label,
        'Skill_Count'       : skill_count,
        'Has_Certification' : has_certification,
        'JobRole_Label'     : 0
    }

def calculate_embedding_similarity(cv_text, job_description):
    try:
        vec = TfidfVectorizer(stop_words='english')
        m   = vec.fit_transform([cv_text, job_description])
        return float(cosine_similarity(m[0:1], m[1:2])[0][0])
    except:
        return 0.0

def calculate_keyword_score(cv_text, job_description):
    jd = set(job_description.lower().split())
    cv = set(cv_text.lower().split())
    return float(len(jd & cv) / len(jd)) if jd else 0.0

def score_with_xgboost(features):
    df  = pd.DataFrame([features], columns=FEATURES)
    sc  = pd.DataFrame(xgb_scaler.transform(df), columns=FEATURES)
    return int(xgb_model.predict(sc)[0]), float(xgb_model.predict_proba(sc)[0][1])

def score_with_ann(features):
    df  = pd.DataFrame([features], columns=FEATURES)
    sc  = ann_scaler.transform(df)
    prob = float(ann_model.predict(sc, verbose=0)[0][0])
    return int(prob >= 0.5), prob

def generate_shap_explanation(features):
    try:
        df  = pd.DataFrame([features], columns=FEATURES)
        sc  = pd.DataFrame(xgb_scaler.transform(df), columns=FEATURES)
        exp = shap.TreeExplainer(xgb_model)
        sv  = exp.shap_values(sc)
        return {f: round(float(v), 4) for f, v in zip(FEATURES, sv[0])}
    except:
        return {f: 0.0 for f in FEATURES}

def process_cv(pdf_bytes, job_description, job_role_label=0):
    cv_text  = extract_text_from_pdf(pdf_bytes)
    features = extract_cv_features(cv_text)
    features['JobRole_Label'] = job_role_label
    xgb_pred, xgb_prob  = score_with_xgboost(features)
    ann_pred, ann_prob   = score_with_ann(features)
    emb_sim  = calculate_embedding_similarity(cv_text, job_description)
    kw_score = calculate_keyword_score(cv_text, job_description)
    shap_exp = generate_shap_explanation(features)
    final    = round((xgb_prob + ann_prob + emb_sim + kw_score) / 4, 4)
    badge    = 'Strong Match' if final >= 0.7 else 'Partial Match' if final >= 0.4 else 'Weak Match'
    return {
        'cv_text'              : cv_text[:500],
        'features'             : features,
        'xgb_prediction'       : xgb_pred,
        'xgb_probability'      : round(xgb_prob, 4),
        'ann_prediction'       : ann_pred,
        'ann_probability'      : round(ann_prob, 4),
        'embedding_similarity' : round(emb_sim,  4),
        'keyword_score'        : round(kw_score, 4),
        'final_score'          : final,
        'match_badge'          : badge,
        'shap_explanation'     : shap_exp
    }
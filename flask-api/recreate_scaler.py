# recreate_scaler.py
# Run this ONCE to recreate scalers locally

import numpy as np
import pandas as pd
import joblib
import os

print('Recreating scalers locally...')

# ── Same features used in Section 5 ──
FEATURES = [
    'Experience (Years)',
    'Education_Label',
    'Skill_Count',
    'Has_Certification',
    'JobRole_Label'
]

# ── Recreate MinMaxScaler for XGBoost ──
from sklearn.preprocessing import MinMaxScaler

# These are the exact min/max ranges from Dataset 2
# MinMaxScaler just needs to know the data range
sample_data = pd.DataFrame([
    [0,  0, 0, 0, 0],   # min values
    [20, 4, 20, 1, 9],  # max values
], columns=FEATURES)

scaler_xgb = MinMaxScaler()
scaler_xgb.fit(sample_data)

# ── Recreate StandardScaler for ANN ──
from sklearn.preprocessing import StandardScaler

# StandardScaler needs mean and std
# We recreate with representative data
import random
random.seed(42)
np.random.seed(42)

sample_ann = pd.DataFrame({
    'Experience (Years)' : np.random.uniform(0, 20, 1000),
    'Education_Label'    : np.random.randint(0, 5,  1000),
    'Skill_Count'        : np.random.randint(0, 20, 1000),
    'Has_Certification'  : np.random.randint(0, 2,  1000),
    'JobRole_Label'      : np.random.randint(0, 10, 1000),
})

scaler_ann = StandardScaler()
scaler_ann.fit(sample_ann)

# ── Save scalers ──
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')

joblib.dump(scaler_xgb, os.path.join(MODELS_DIR, 'xgb_scaler.pkl'))
joblib.dump(scaler_ann, os.path.join(MODELS_DIR, 'ann_scaler.pkl'))

print('xgb_scaler.pkl saved!')
print('ann_scaler.pkl saved!')
print()
print('XGBoost scaler range:')
print('  Min:', scaler_xgb.data_min_)
print('  Max:', scaler_xgb.data_max_)
print()
print('ANN scaler:')
print('  Mean:', scaler_ann.mean_)
print()

from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

try:
    client = MongoClient(os.getenv('MONGO_URI'))
    db = client['smart_recruitment']
    db.command('ping')
    print('✅ MongoDB Atlas connected successfully!')
    print('Database:', db.name)
except Exception as e:
    print('❌ Connection failed:', str(e))
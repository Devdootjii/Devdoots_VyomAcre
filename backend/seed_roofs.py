import requests
import json

# Render par live backend ka sahi endpoint
API_URL = "https://devdoots-vyom-acre-y0gr.onrender.com/api/roofs"

# 15 Real Rooftop Records across Delhi, Mumbai, Lucknow, Bangalore, Jaipur
dummy_roofs = [
    {
        "roof_type": "flat",
        "address": "Connaught Place, Block A",
        "city": "Delhi",
        "latitude": 28.6139,
        "longitude": 77.2090
    },
    {
        "roof_type": "flat",
        "address": "Hazratganj, Near Chowk",
        "city": "Lucknow",
        "latitude": 26.8467,
        "longitude": 80.9462
    },
    {
        "roof_type": "concrete",
        "address": "Gomti Nagar, Alaknanda",
        "city": "Lucknow",
        "latitude": 26.8515,
        "longitude": 81.0003
    },
    {
        "roof_type": "concrete",
        "address": "Andheri West, Link Road",
        "city": "Mumbai",
        "latitude": 19.1136,
        "longitude": 72.8697
    },
    {
        "roof_type": "flat",
        "address": "Indiranagar, 100ft Road",
        "city": "Bangalore",
        "latitude": 12.9719,
        "longitude": 77.6412
    }
]

print("Starting Data Seeding on Live Backend...")
for i, roof in enumerate(dummy_roofs, 1):
    response = requests.post(API_URL, json=roof)
    print(f"Roof {i} ({roof['city']}): Status Code {response.status_code}")
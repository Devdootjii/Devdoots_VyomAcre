"""
VyomAcre — Lease Request Identity & Privacy Fix — Automated Test Script
=======================================================================
Pehle server chalu rakho:  uvicorn main:app --reload
Phir run karo:            python test_lease_flow.py

Ye script poora 9-step flow khud test karegi aur PASS/FAIL print karegi.
Screenshot ke liye terminal ka output kaafi hai.
"""

import time
import requests

BASE = "http://127.0.0.1:8000"
run_id = str(int(time.time()))  # unique banane ke liye — baar baar chala sakte ho

results = []


def check(name, passed, detail=""):
    results.append((name, passed))
    line = ("[PASS] " if passed else "[FAIL] ") + name
    if detail:
        line += "  -> " + str(detail)[:180]
    print(line)


def find_first_id(obj):
    """Response JSON me pehla 'id' field dhundta hai (nested bhi)."""
    if isinstance(obj, dict):
        if "id" in obj and obj["id"]:
            return obj["id"]
        for v in obj.values():
            found = find_first_id(v)
            if found:
                return found
    elif isinstance(obj, list):
        for v in obj:
            found = find_first_id(v)
            if found:
                return found
    return None


print("=" * 64)
print("VYOMACRE LEASE FIX TESTS | run id:", run_id)
print("=" * 64)

# ---------------------------------------------------------------
# 1) OWNER signup
# ---------------------------------------------------------------
r = requests.post(f"{BASE}/api/auth/signup", json={
    "name": f"Test Owner {run_id}",
    "email": f"owner.{run_id}@vyomacre.test",
    "phone": "9" + run_id[-9:],
    "password": "OwnerTest@123",
    "role": "owner",
})
owner = r.json().get("data", {})
owner_token = owner.get("token")
owner_user_id = owner.get("user_id")
check("1. Owner signup (201)",
      r.status_code == 201 and owner_token,
      f"code={r.status_code} user_id={owner_user_id}")

# ---------------------------------------------------------------
# 2) SEEKER signup
# ---------------------------------------------------------------
r = requests.post(f"{BASE}/api/auth/signup", json={
    "name": f"Test Seeker {run_id}",
    "email": f"seeker.{run_id}@vyomacre.test",
    "phone": "8" + run_id[-9:],
    "password": "SeekerTest@123",
    "role": "seeker",
})
seeker = r.json().get("data", {})
seeker_token = seeker.get("token")
seeker_user_id = seeker.get("user_id")
check("2. Seeker signup (201)",
      r.status_code == 201 and seeker_token,
      f"code={r.status_code} user_id={seeker_user_id}")

# ---------------------------------------------------------------
# 3) Owner ek roof add karta hai
# ---------------------------------------------------------------
r = requests.post(f"{BASE}/api/roofs/add",
                  headers={"Authorization": f"Bearer {owner_token}"},
                  json={
                      "roof_type": "flat",
                      "address": f"Test Street {run_id}, Sector 21",
                      "city": "Lucknow",
                      "latitude": 26.8500 + (int(run_id[-3:]) % 50) / 10000,
                      "longitude": 80.9500 + (int(run_id[-2:]) % 50) / 10000,
                  })
roof_id = find_first_id(r.json().get("data"))
check("3. Roof add by owner (200)",
      r.status_code == 200 and roof_id,
      f"code={r.status_code} roof_id={roof_id}")

# ---------------------------------------------------------------
# 4) Seeker lease request bhejta hai
# ---------------------------------------------------------------
r = requests.post(f"{BASE}/api/lease-requests",
                  headers={"Authorization": f"Bearer {seeker_token}"},
                  json={"roof_id": roof_id, "company_name": "Devdoots Test Solar"})
lease_id = find_first_id(r.json().get("data"))
check("4. Lease request by seeker (200)",
      r.status_code == 200 and lease_id,
      f"code={r.status_code} lease_id={lease_id}")

# ---------------------------------------------------------------
# 5) [KEY] GET /mine — seeker apni requests dekhe, seeker_id match
# ---------------------------------------------------------------
r = requests.get(f"{BASE}/api/lease-requests/mine",
                 headers={"Authorization": f"Bearer {seeker_token}"})
mine = r.json().get("data", [])
mine_ok = (
    r.status_code == 200
    and isinstance(mine, list)
    and len(mine) >= 1
    and str(mine[0].get("seeker_id")) == str(seeker_user_id)
)
check("5. [KEY] GET /mine returns own request with matching seeker_id",
      mine_ok,
      f"code={r.status_code} got={len(mine) if isinstance(mine, list) else mine} "
      f"seeker_id={mine[0].get('seeker_id') if mine else None} expected={seeker_user_id}")

# ---------------------------------------------------------------
# 6) /mine bina token — fail hona chahiye
# ---------------------------------------------------------------
r = requests.get(f"{BASE}/api/lease-requests/mine")
check("6. GET /mine without token -> 401/403",
      r.status_code in (401, 403),
      f"code={r.status_code}")

# ---------------------------------------------------------------
# 7) Owner apni lease requests dekhe (token se, no param)
# ---------------------------------------------------------------
r = requests.get(f"{BASE}/api/lease-requests",
                 headers={"Authorization": f"Bearer {owner_token}"})
check("7. GET /api/lease-requests as owner (200, token se)",
      r.status_code == 200,
      f"code={r.status_code}")

# ---------------------------------------------------------------
# 8) [KEY] GET /api/lease-requests BINA token — privacy fix
# ---------------------------------------------------------------
r = requests.get(f"{BASE}/api/lease-requests")
check("8. [KEY] GET /api/lease-requests without token -> 401/403 (PRIVACY FIX)",
      r.status_code in (401, 403),
      f"code={r.status_code}  (pehle ye khula tha!)")

# ---------------------------------------------------------------
# 9) PATCH accept by owner — regression check
# ---------------------------------------------------------------
r = requests.patch(f"{BASE}/api/lease-requests/{lease_id}",
                   headers={"Authorization": f"Bearer {owner_token}"},
                   json={"status": "accepted"})
check("9. PATCH accept by owner (200)",
      r.status_code == 200,
      f"code={r.status_code} body={str(r.json().get('data'))[:120]}")

# ---------------------------------------------------------------
# Bonus: roof ab 'leased' hai?
# ---------------------------------------------------------------
r = requests.get(f"{BASE}/api/roofs/{roof_id}")
roof_data = r.json().get("data", {})
status_val = None
if isinstance(roof_data, dict):
    status_val = roof_data.get("status") or (roof_data.get("roof") or {}).get("status")
check("Bonus: roof status now 'leased'",
      status_val == "leased",
      f"status={status_val}")

# ---------------------------------------------------------------
# SUMMARY
# ---------------------------------------------------------------
print("=" * 64)
passed = sum(1 for _, p in results if p)
total = len(results)
print(f"RESULT: {passed}/{total} PASSED")
if passed == total:
    print("SAB PASS — fix verified. Ab live Render pe migration + push.")
else:
    print("KUCH FAIL — jo fail hua uska detail upar hai, bhejo mujhe.")
print("=" * 64)

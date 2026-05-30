"""Backend API tests for flicksfromnai photographer portfolio."""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://nai-lens.preview.emergentagent.com').rstrip('/')
ADMIN_KEY = "flicksfromnai-admin-2025"
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


# ---------- Photos: read ----------
class TestPhotosRead:
    def test_list_all(self, s):
        r = s.get(f"{API}/photos", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 15, f"Expected >=15 seeded photos, got {len(data)}"
        # Validate shape
        sample = data[0]
        for k in ("id", "title", "category", "image_url", "featured"):
            assert k in sample
        # ensure no Mongo _id leaks
        assert "_id" not in sample

    def test_filter_portrait(self, s):
        r = s.get(f"{API}/photos", params={"category": "portrait"}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 3
        assert all(p["category"] == "portrait" for p in data)

    def test_filter_featured(self, s):
        r = s.get(f"{API}/photos", params={"featured": "true"}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) > 0
        assert all(p["featured"] is True for p in data)

    def test_filter_all_keyword(self, s):
        r = s.get(f"{API}/photos", params={"category": "all"}, timeout=30)
        assert r.status_code == 200
        assert len(r.json()) >= 15


# ---------- Admin auth ----------
class TestAdminVerify:
    def test_verify_correct(self, s):
        r = s.post(f"{API}/admin/verify", json={"key": ADMIN_KEY}, timeout=30)
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_verify_wrong(self, s):
        r = s.post(f"{API}/admin/verify", json={"key": "wrong"}, timeout=30)
        assert r.status_code == 401


# ---------- Photos: write (auth) ----------
class TestPhotosCRUD:
    created_id = None

    def test_create_without_key_401(self, s):
        r = s.post(f"{API}/photos", json={"category": "portrait", "image_url": "https://x/y.jpg"}, timeout=30)
        assert r.status_code == 401

    def test_create_wrong_key_401(self, s):
        r = s.post(f"{API}/photos",
                   headers={"X-Admin-Key": "bad"},
                   json={"category": "portrait", "image_url": "https://x/y.jpg"},
                   timeout=30)
        assert r.status_code == 401

    def test_create_with_key(self, s):
        payload = {
            "title": "TEST_Photo",
            "caption": "test caption",
            "category": "portrait",
            "image_url": "https://images.unsplash.com/photo-1532170579297-281918c8ae72?w=600",
            "featured": False,
            "order": 99,
        }
        r = s.post(f"{API}/photos", headers={"X-Admin-Key": ADMIN_KEY}, json=payload, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["title"] == "TEST_Photo"
        assert data["category"] == "portrait"
        assert "id" in data
        TestPhotosCRUD.created_id = data["id"]

        # Verify persistence via GET
        r2 = s.get(f"{API}/photos", timeout=30)
        ids = [p["id"] for p in r2.json()]
        assert data["id"] in ids

    def test_patch_toggle_featured(self, s):
        assert TestPhotosCRUD.created_id, "create test must run first"
        pid = TestPhotosCRUD.created_id
        r = s.patch(f"{API}/photos/{pid}",
                    headers={"X-Admin-Key": ADMIN_KEY},
                    json={"featured": True},
                    timeout=30)
        assert r.status_code == 200
        assert r.json()["featured"] is True

        # Verify via list featured filter
        r2 = s.get(f"{API}/photos", params={"featured": "true"}, timeout=30)
        assert any(p["id"] == pid for p in r2.json())

    def test_patch_without_key_401(self, s):
        pid = TestPhotosCRUD.created_id
        r = s.patch(f"{API}/photos/{pid}", json={"featured": False}, timeout=30)
        assert r.status_code == 401

    def test_delete_without_key_401(self, s):
        pid = TestPhotosCRUD.created_id
        r = s.delete(f"{API}/photos/{pid}", timeout=30)
        assert r.status_code == 401

    def test_delete_with_key(self, s):
        pid = TestPhotosCRUD.created_id
        r = s.delete(f"{API}/photos/{pid}", headers={"X-Admin-Key": ADMIN_KEY}, timeout=30)
        assert r.status_code == 200

        # Verify gone
        r2 = s.get(f"{API}/photos", timeout=30)
        ids = [p["id"] for p in r2.json()]
        assert pid not in ids

    def test_delete_missing_404(self, s):
        r = s.delete(f"{API}/photos/nonexistent-id", headers={"X-Admin-Key": ADMIN_KEY}, timeout=30)
        assert r.status_code == 404

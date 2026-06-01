import pytest

URL = "/api/v1/auth/me/profile"


@pytest.mark.django_db
class TestProfileUpdate:
    def test_anonymous_401(self, api_client):
        res = api_client.patch(URL, {"grade": 8}, format="json")
        assert res.status_code == 401
        assert res.data["error"]["code"] == "not_authenticated"

    def test_single_field_patch(self, auth_client):
        res = auth_client.patch(URL, {"grade": 8}, format="json")
        assert res.status_code == 200, res.data
        assert res.data["grade"] == 8

    def test_all_fields_patch(self, auth_client):
        body = {
            "grade": 10,
            "board": "cbse",
            "subjects": ["math", "science"],
            "lang": "hi",
            "learning_style": "visual",
            "goals": ["exam_prep"],
        }
        res = auth_client.patch(URL, body, format="json")
        assert res.status_code == 200
        for key, value in body.items():
            assert res.data[key] == value

    def test_partial_preserves_other_fields(self, auth_client):
        auth_client.patch(URL, {"grade": 7, "board": "icse"}, format="json")
        res = auth_client.patch(URL, {"grade": 8}, format="json")
        assert res.status_code == 200
        assert res.data["grade"] == 8
        assert res.data["board"] == "icse"  # unchanged

    def test_invalid_board_400(self, auth_client):
        res = auth_client.patch(URL, {"board": "not-a-board"}, format="json")
        assert res.status_code == 400

    def test_invalid_learning_style_400(self, auth_client):
        res = auth_client.patch(URL, {"learning_style": "telepathic"}, format="json")
        assert res.status_code == 400

    def test_subjects_must_be_list(self, auth_client):
        res = auth_client.patch(URL, {"subjects": "math,science"}, format="json")
        assert res.status_code == 400

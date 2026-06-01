import pytest

URL = "/api/v1/auth/me/learning-style-quiz"


@pytest.mark.django_db
class TestLearningStyleQuiz:
    def test_anonymous_401(self, api_client):
        res = api_client.post(URL, {"answers": ["visual"] * 4}, format="json")
        assert res.status_code == 401

    def test_all_visual(self, auth_client):
        res = auth_client.post(URL, {"answers": ["visual"] * 4}, format="json")
        assert res.status_code == 200, res.data
        assert res.data["learning_style"] == "visual"
        assert res.data["scores"] == {"visual": 4, "auditory": 0, "kinesthetic": 0}

    def test_mixed_clear_winner(self, auth_client):
        res = auth_client.post(
            URL,
            {"answers": ["auditory", "auditory", "auditory", "visual"]},
            format="json",
        )
        assert res.status_code == 200
        assert res.data["learning_style"] == "auditory"
        assert res.data["scores"]["auditory"] == 3

    def test_tie_breaks_visual_over_auditory(self, auth_client):
        # 2-2 visual/auditory → visual wins per documented priority
        res = auth_client.post(
            URL,
            {"answers": ["visual", "visual", "auditory", "auditory"]},
            format="json",
        )
        assert res.status_code == 200
        assert res.data["learning_style"] == "visual"

    def test_tie_breaks_auditory_over_kinesthetic(self, auth_client):
        res = auth_client.post(
            URL,
            {"answers": ["auditory", "auditory", "kinesthetic", "kinesthetic"]},
            format="json",
        )
        assert res.status_code == 200
        assert res.data["learning_style"] == "auditory"

    def test_wrong_length_400(self, auth_client):
        res = auth_client.post(URL, {"answers": ["visual", "visual"]}, format="json")
        assert res.status_code == 400

    def test_invalid_choice_400(self, auth_client):
        res = auth_client.post(URL, {"answers": ["visual", "visual", "visual", "nope"]}, format="json")
        assert res.status_code == 400

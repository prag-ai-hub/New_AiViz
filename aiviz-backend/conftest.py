"""Top-level pytest fixtures shared by all apps' tests."""

import pytest


@pytest.fixture
def api_client():
    from rest_framework.test import APIClient

    return APIClient()


@pytest.fixture
def auth_client(api_client, db):
    from apps.accounts.services import issue_tokens
    from apps.accounts.tests.factories import UserFactory

    user = UserFactory()
    tokens = issue_tokens(user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
    api_client.user = user
    return api_client

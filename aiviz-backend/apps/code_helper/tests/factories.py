import factory
from factory.django import DjangoModelFactory

from apps.accounts.tests.factories import UserFactory
from apps.code_helper.constants import CodeAction, CodeLanguage
from apps.code_helper.models import CodeRequest


class CodeRequestFactory(DjangoModelFactory):
    class Meta:
        model = CodeRequest

    user = factory.SubFactory(UserFactory)
    action = CodeAction.EXPLAIN
    language = CodeLanguage.PYTHON
    code = "print('hello')"
    extra = ""

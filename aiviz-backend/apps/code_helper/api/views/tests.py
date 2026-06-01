from apps.code_helper.constants import CodeAction

from ._base import BaseCodeActionView


class TestsView(BaseCodeActionView):
    __test__ = False  # not a pytest test class
    action = CodeAction.TESTS

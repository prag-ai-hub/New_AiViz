from apps.code_helper.constants import CodeAction

from ._base import BaseCodeActionView


class ExplainView(BaseCodeActionView):
    action = CodeAction.EXPLAIN

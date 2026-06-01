from apps.code_helper.constants import CodeAction

from ._base import BaseCodeActionView


class DebugView(BaseCodeActionView):
    action = CodeAction.DEBUG

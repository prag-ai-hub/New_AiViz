from apps.code_helper.constants import CodeAction

from ._base import BaseCodeActionView


class SuggestView(BaseCodeActionView):
    action = CodeAction.SUGGEST

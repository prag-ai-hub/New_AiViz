from rest_framework_simplejwt.views import TokenRefreshView


class RefreshView(TokenRefreshView):
    """Lives under our auth namespace; simplejwt handles rotation + blacklisting per settings."""
    pass

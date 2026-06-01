from django.db import models


class Role(models.TextChoices):
    STUDENT = "student", "Student"
    PARENT = "parent", "Parent"
    TEACHER = "teacher", "Teacher"
    ADMIN = "admin", "Admin"


SIGNUP_ALLOWED_ROLES = {Role.STUDENT, Role.PARENT}

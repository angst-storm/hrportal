from django.conf import settings
from django.db import models

from .activity import Activity, ActivityStatus
from .resume import Resume, PDFResume
from .user import User
from .vacancy import Vacancy

NOTIFICATION_CHOICES = [
    ('RESUME-RESPONSE', 'Отклик на резюме'),
    ('VACANCY-RESPONSE', 'Отклик на вакансию'),
    ('ACTIVITY-TO-REVIEW', 'Активность отправлена на согласование'),
    ('ACTIVITY-REVIEW-DECISION', 'Решение по результатам согласования')
]


class Notification(models.Model):
    owner = models.ForeignKey(to=User, on_delete=models.CASCADE)
    type = models.CharField(max_length=255, choices=NOTIFICATION_CHOICES)
    value = models.JSONField()
    read = models.BooleanField(default=False)
    notify_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Notification({self.type}, {self.owner})'

    @staticmethod
    def resume_response(resume: Resume, manager: User):
        notification = Notification(
            owner=resume.employee,
            type=NOTIFICATION_CHOICES[0][0],
            value={
                'manager': manager.id,
                'department': manager.department.id,
                'employee': resume.employee.id
            }
        )
        notification.save()
        return notification

    @staticmethod
    def vacancy_response(vacancy: Vacancy, manager: User, employee: User, resume: PDFResume):
        notification = Notification(
            owner=manager,
            type=NOTIFICATION_CHOICES[1][0],
            value={
                'employee': employee.id,
                'department': vacancy.department.id,
                'vacancy': vacancy.id,
                'resume': resume.file.url[len(settings.MEDIA_URL):]
            })
        notification.save()
        return notification

    @staticmethod
    def activity_to_review(manager: User, employee: User, activity: Activity):
        notification = Notification(
            owner=manager,
            type=NOTIFICATION_CHOICES[2][0],
            value={
                'employeeId': employee.id,
                'activityId': activity.id
            })
        notification.save()
        return notification

    @staticmethod
    def activity_review_decision(employee: User, manager: User, activity: Activity, decision: ActivityStatus):
        notification = Notification(
            owner=employee,
            type=NOTIFICATION_CHOICES[3][0],
            value={
                'managerId': manager.id,
                'activityId': activity.id,
                'decision': decision.value
            })
        notification.save()
        return notification

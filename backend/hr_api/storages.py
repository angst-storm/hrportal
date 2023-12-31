from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage, S3StaticStorage


class MediaStorage(S3Boto3Storage):
    bucket_name = settings.MEDIA_BUCKET_NAME
    custom_domain = settings.MEDIA_BUCKET_URL


class StaticStorage(S3StaticStorage):
    bucket_name = settings.STATIC_BUCKET_NAME
    custom_domain = settings.STATIC_BUCKET_URL

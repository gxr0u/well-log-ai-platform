import os
from pathlib import Path
from urllib.parse import quote

import boto3
from botocore.exceptions import BotoCoreError, ClientError


def upload_file_to_s3(file_path: str, filename: str) -> str | None:
    """Upload file to S3 and return object URL, or None when S3 is not configured."""
    access_key = os.getenv("AWS_ACCESS_KEY_ID")
    secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    region = os.getenv("AWS_REGION")
    bucket_name = os.getenv("S3_BUCKET_NAME")

    if not all([access_key, secret_key, region, bucket_name]):
        return None

    # Keep object keys under a predictable prefix.
    object_key = f"las/{Path(filename).name}"

    try:
        client = boto3.client(
            "s3",
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region,
        )
        client.upload_file(file_path, bucket_name, object_key)
    except (BotoCoreError, ClientError, OSError):
        return None

    encoded_key = quote(object_key)
    return f"https://{bucket_name}.s3.{region}.amazonaws.com/{encoded_key}"

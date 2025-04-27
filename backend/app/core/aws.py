import boto3
from botocore.exceptions import ClientError
from .logging import setup_logger
from config import settings

aws_logger = setup_logger("aws")

S3_BUCKET_NAME = settings.S3_BUCKET_NAME
AWS_ACCESS_KEY_ID = settings.AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY = settings.AWS_SECRET_ACCESS_KEY
AWS_REGION = settings.AWS_REGION

try:
    s3_client = boto3.client(
        's3',
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION
    )
    aws_logger.info(f"S3 client initialized with region: {AWS_REGION}")
except Exception as e:
    aws_logger.error(f"Failed to initialize S3 client: {str(e)}")
    raise

def get_s3_client():
    """Returns the configured S3 client instance"""
    return s3_client

def upload_to_s3(file_content, key, content_type=None):
    """
    Upload a file to S3 with detailed logging
    
    Args:
        file_content: The binary content of the file
        key: The S3 key to use
        content_type: The content type of the file
    
    Returns:
        bool: True if successful, False otherwise
    """
    aws_logger.info(f"Starting S3 upload: key={key}, size={len(file_content)} bytes, type={content_type}")
    
    try:
        # Try to validate the bucket first
        response = s3_client.head_bucket(Bucket=S3_BUCKET_NAME)
    except ClientError as e:
        aws_logger.error(f"Bucket validation failed: {e.response['Error']['Message']}")
        if e.response['Error']['Code'] == '404':
            aws_logger.error(f"Bucket {S3_BUCKET_NAME} does not exist")
        elif e.response['Error']['Code'] == '403':
            aws_logger.error(f"No permission to access bucket {S3_BUCKET_NAME}")
        return False
    
    # Proceed with upload
    try:
        params = {
            'Bucket': S3_BUCKET_NAME,
            'Key': key,
            'Body': file_content
        }
        
        if content_type:
            params['ContentType'] = content_type
        
        response = s3_client.put_object(**params)
        aws_logger.info(f"S3 upload successful: {key}")
        return True
        
    except ClientError as e:
        aws_logger.error(f"S3 upload failed: {str(e)}")
        return False
    except Exception as e:
        aws_logger.error(f"Unexpected error during S3 upload: {str(e)}", exc_info=True)
        return False

def generate_presigned_url(key, expires_in=3600, original_filename=None):
    """
    Generate a presigned URL for the given S3 key
    
    Args:
        key: The S3 key of the object
        expires_in: URL expiration time in seconds
        original_filename: If provided, will be used for Content-Disposition
    """
    aws_logger.info(f"Generating presigned URL for key: {key}")
    
    params = {
        'Bucket': S3_BUCKET_NAME,
        'Key': key
    }
    
    # If original filename is provided, set Content-Disposition header
    if original_filename:
        params['ResponseContentDisposition'] = f'attachment; filename="{original_filename}"'
    
    try:
        url = s3_client.generate_presigned_url(
            'get_object',
            Params=params,
            ExpiresIn=expires_in
        )
        aws_logger.info(f"Generated presigned URL for {key}")
        return url
    except ClientError as e:
        aws_logger.error(f"Failed to generate presigned URL: {str(e)}")
        return None 
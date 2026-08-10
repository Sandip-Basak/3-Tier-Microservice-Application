resource "random_string" "s3_suffix" {
  length  = 6
  special = false
  upper   = false
}

resource "aws_s3_bucket" "food_images" {
  bucket        = "${var.project_name}-images-${random_string.s3_suffix.result}"
  force_destroy = true

  tags = {
    Name = "${var.project_name}-food-images"
  }
}

resource "aws_s3_bucket_ownership_controls" "food_images" {
  bucket = aws_s3_bucket.food_images.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_public_access_block" "food_images" {
  bucket = aws_s3_bucket.food_images.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_cors_configuration" "food_images" {
  bucket = aws_s3_bucket.food_images.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_policy" "food_images_public_read" {
  depends_on = [aws_s3_bucket_public_access_block.food_images]
  bucket     = aws_s3_bucket.food_images.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.food_images.arn}/*"
      }
    ]
  })
}

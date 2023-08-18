provider "aws" {
  region = var.aws_region
}

resource "aws_s3_bucket" "this" {
  bucket_prefix = "dokchat-s3-"

  lifecycle {
    # WARNING: REMOVING prevent_destroy IS GOING TO
    # REMOVE ALL USER ATTACHMENTS
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_public_access_block" "this" {
  bucket                  = aws_s3_bucket.this.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

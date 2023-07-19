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



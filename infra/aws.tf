provider "aws" {
  region  = var.aws_region
  profile = "default"
}

resource "aws_s3_bucket" "this" {
  bucket_prefix = "dokchat-s3-"
}



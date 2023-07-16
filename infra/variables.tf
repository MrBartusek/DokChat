variable "key_name" {
  description = "Key to access the EC2 instance"
  type        = string
  default     = "dokchat"
}

variable "aws_region" {
  description = "AWS Region to base all services in"
  type        = string
  default     = "eu-central-1"
}


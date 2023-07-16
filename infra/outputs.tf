output "ec2_instance_public_ips" {
  description = "Public IP addresses of EC2 instances"
  value       = aws_eip.lb.public_ip
}

output "s3_bucket_arn" {
  description = "Name of S3 Attachments bucket"
  value       = aws_s3_bucket.this.arn
}

output "ec2_instance_public_ips" {
  description = "Public IP addresses of EC2 instances"
  value       = aws_eip.lb.public_ip
}

output "aws_region" {
  description = "AWS region for all services"
  value       = var.aws_region
}

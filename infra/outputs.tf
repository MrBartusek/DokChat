output "ec2_instance_public_ip" {
  description = "Public IP addresses of EC2 instances"
  value       = aws_eip.lb.public_ip
}

output "google_credentials_url" {
  description = "Google Cloud Console URL to configure Google OAuth"
  value       = "https://console.cloud.google.com/apis/credentials?project=${var.google_project}"
}

output "aws_ses_identities_url" {
  description = "AWS Console URL to create identities"
  value       = "https://${var.aws_region}.console.aws.amazon.com/ses/home?region=${var.aws_region}#/verified-identities"
}

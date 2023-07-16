provider "aws" {
  region  = var.aws_region
  profile = "default"
}

data "aws_ami" "amazon_linux_2" {
  most_recent = true

  filter {
    name   = "owner-alias"
    values = ["amazon"]
  }


  filter {
    name   = "name"
    values = ["amzn2-ami-hvm*"]
  }
}

resource "aws_instance" "ec2_instance" {
  ami                    = data.aws_ami.amazon_linux_2.id
  instance_type          = "t2.micro"
  vpc_security_group_ids = [aws_security_group.http_https_ssh.id]
  key_name               = var.key_name
  user_data              = file("userdata.tpl")

  tags = {
    Name = "DokChat - Web Server"
  }
}

resource "aws_default_vpc" "default" {}

resource "aws_security_group" "http_https_ssh" {
  vpc_id = aws_default_vpc.default.id

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "DokChat - Allow HTTP & HTTPS & SSH"
  }
}

resource "aws_eip" "lb" {
  depends_on = [aws_default_vpc.default]
  instance   = aws_instance.ec2_instance.id
  domain     = "vpc"
}

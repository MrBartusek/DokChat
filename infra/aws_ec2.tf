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

resource "random_password" "jwt_1" {
  length  = 64
  special = false
}

resource "random_password" "jwt_2" {
  length  = 64
  special = false
}

resource "random_password" "jwt_3" {
  length  = 64
  special = false
}

resource "random_password" "jwt_4" {
  length  = 64
  special = false
}

resource "aws_instance" "ec2_instance" {
  ami                    = data.aws_ami.amazon_linux_2.id
  instance_type          = "t2.micro"
  vpc_security_group_ids = [aws_security_group.http_https_ssh.id]
  key_name               = var.key_name
  user_data = templatefile("userdata.tftpl", {
    s3_bucket_name       = aws_s3_bucket.this.id
    aws_region           = var.aws_region,
    jwt_secret_1         = random_password.jwt_1.result,
    jwt_secret_2         = random_password.jwt_2.result,
    jwt_secret_3         = random_password.jwt_3.result,
    jwt_secret_4         = random_password.jwt_4.result,
    sqs_complaints_queue = aws_sqs_queue.ses_complaints.url,
    sqs_bounces_queue    = aws_sqs_queue.ses_bounces.url,
    access_key_id        = aws_iam_access_key.this.id,
    access_key_secret    = aws_iam_access_key.this.secret,
    tenor_apikey         = google_apikeys_key.tenor.key_string,
    sqs_config_set       = aws_ses_configuration_set.this.name
  })

  tags = {
    Name = "DokChat - Web server"
  }

  lifecycle {
    ignore_changes = [
      user_data # user data runs only after the initial launch of instance
    ]

    # WARNING: REMOVING prevent_destroy IS GOING TO
    # REMOVE YOUR DATABASE, CONFIGURATION FILE AND
    # ALL OTHER DOKCHAT DATA
    prevent_destroy = true
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

  tags = {
    Name = "DokChat - Web server Elastic IP"
  }
}

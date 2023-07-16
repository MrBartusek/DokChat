#!/bin/bash

# Update System
sudo yum update -y

# Instal NGINX
sudo amazon-linux-extras install nginx1 -y
sudo amazon-linux-extras enable nginx1
sudo systemctl enable nginx
sudo systemctl start nginx

# Install Docker
sudo amazon-linux-extras install docker
sudo service docker start
sudo usermod -a -G docker ec2-user
sudo chkconfig docker on # Docker autostart

# Install Compose
sudo curl -L https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Deploy own DokChat instance

DokChat is quite extensive project that uses a multitude of AWS and Google Cloud service to
function hence, it is not trivial to set up. Fortunately, we have configured Docker,
Terraform and other similar tools so this process is highly automated.

You can divide this process into three main steps:
- **Infrastructure Prerequisites** - Create AWS account and Google Cloud project
- **Tools Prerequisites** - Install required tools on Your PC
- **Infrastructure Deploy** - Deploy required AWS Services using Terraform
- **Optional Modules and Configuration** - Enable E-Mails, reCAPTCHA, TLS and Security Measures

## Step 1 - Infrastructure Prerequisites

Before going forward, you need to set up our two cloud providers AWS and Google Cloud

1. Create account on [Amazon Web Services](aws.amazon.com). You will be required to input
   your credit card information but, don't worry. DokChat operates within 12-month free
   tier boundaries.
2. Create new [EC2 Key Pair](https://eu-central-1.console.aws.amazon.com/ec2/homeCreateKeyPair:)
   You will need it to SSH into your instance, save it somewhere safe.
3. Create Access Key for AWS and store it somewhere safe.
   You can do it through [IAM Dashboard](https://aws.amazon.com/iam/).
4. Create account on [Google Cloud](https://cloud.google.com). You don't need to set up a
   billing account here.
5. [Create new Google Cloud project](https://console.cloud.google.com/projectcreate). You 
   can choose  any project name. Note the Project ID that you have been assigned, you will
   need it for later.

You are now ready to install the required tools!

## Step 2 - Tools Prerequisites

Now that you have both AWS and Google Cloud accounts you can can now download their
respective CLI Tools and [Terraform](https://www.terraform.io) it is a Infrastructure
as Code tool that will set up most of the infrastructure for you, automatically.

1. Download and install the following tools:
   - [git](https://git-scm.com)
   - [Terraform](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli)
   - [gcloud CLI](https://cloud.google.com/sdk/gcloud)
   - [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
2. Run `aws configure` and input Access Key that you created earlier
3. Run `gcloud init` to initialize **gcloud CLI** via browser
4. Run `gcloud auth application-default login` to initialize **Google Auth Libiary** via browser

You are now ready to deploy infrastructure

## Step 3 - Infrastructure Deploy

Now that you have everything configured, you can provision your whole infrastructure using
Terraform.

1. Clone this repo to wherever you want
   ```sh
   git clone https://github.com/MrBartusek/DokChat.git
   ```
2. Go into the infrastructure folder
   ```sh
   cd DokChat/infra
   ```
3. Create `terraform.tfvars` in the infra folder, it should look something like this:
    ```conf
    key_name       = "YOUR_SSH_KEY_NAME_HERE"
    google_project = "YOUR_GOOGLE_PROJECT_ID_HERE"
    ```
4. Run Terraform
   ```sh
   terraform apply
   ```
5. Terraform will show you the planned infrastructure, accept it.
6. After deploying Terrafrom will output `ec2_instance_public_ip` this is your EC2 Elastic IP,
   it won't work for couple of minutes. It will most likely return NGINX 502 or won't work at
   all. After around 5 minutes it will finish set up and show your new DokChat instance

At this point, you have your very own DokChat instance. You may now wish to finish
optional set up.

## Step 4 - Optional Modules and Configuration

### Google reCAPTCHA v2

TODO

### Google and Facebook OAuth Social Login

TODO

### Email Service

TODO

### Set up TLS (HTTPS) and enable Helmet

TODO

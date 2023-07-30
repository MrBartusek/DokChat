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
5. Enable [Cloud Resource Manager API](https://console.cloud.google.com/marketplace/product/google/cloudresourcemanager.googleapis.com) on Google Cloud Project. It is required in order for
   Terraform to menage Google Cloud.


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

Next steps are optional modules, they are not required however, it's recommended to setup
all of them. Every step till this point was highly automated but now, you need to do some
manual labor. Before we begin, you need to connect to your instancies to edit configuration
file. There are multiple ways to do it:

- **SSH** You can SSH to your instancies using key that you've created:
   ```sh
   ssh ec2-user@PUBLIC_IP -i PATH_TO_PEM_FILE
   ```
- **SFTP** You can SFTP protocol and login using user: `ec-user` and key that you've created
- **EC2 Instance Connect** - Navigate to EC2, select your instance and click connect.

### Google reCAPTCHA v2

DokChat uses Invisible reCAPTCHA to detect and block bots.

1. Create new [Google reCAPTCHA](https://www.google.com/recaptcha/admin/create) project.
2. Input any label, for type select Challenge (v2) → Invisible reCAPTCHA badge and input your
   domain or EC2 Instance IP
3. After creating project you can now see your reCAPTCHA site key and secret key.
4. Connect to your instancies - [See this section introduction](#step-4---optional-modules-and-configuration)
5. Edit `~/DokChat/.env` file
6. Change reCAPTCHA section to:
   ```conf
   ENABLE_RECAPTCHA = true
   RECAPTCHA_SITE_KEY = "<YOUR-SITE-KEY>"
   RECAPTCHA_SECRET = "<YOUR-SECRET-KEY>"
   ```
7. Restart DokChat - In `~/DokChat` directory run
   ```sh
   docker-compose -f docker-compose.yaml -f docker-compose.prod.yaml up -d
   ```

### Google and Facebook OAuth Social Login

TODO

### Email Service

Default DokChat Terraform have set up most of the email system for you. You now only need
to create an identity and enable it.

1. After running `terraform apply` Terraform has generated `aws_ses_identities_url`, as
   output, navigate to this URL.
2. Create and verify **BOTH** Domain and Email address. You are by default put in SES
   sandbox and you will be able to only send emails from verified domains to verified
   email addresses.
3. Connect to your instancies - [See this section introduction](#step-4---optional-modules-and-configuration)
4. Edit `~/DokChat/.env` file
5. Change Email Service section to
   ```conf
   ENABLE_EMAIL_SERVICE = true
   SES_EMAIL_SENDER = "DokChat <no-reply@YOUR_VERIFIED_DOMAIN>"
   SES_CONFIGURATION_SET_NAME = "dokchat-configuration-set"
   ```

You would probably also want to enable email bounces/complaints handling system. It is
not required. If you want to leave SES Sandbox you are reqired to properly handle Bounces
and Complaints to maintain good sender reputation. You can read more about that in
[AWS Guide](https://docs.aws.amazon.com/ses/latest/dg/send-email-concepts-deliverability.html).

If you want to enable this module just change `ENABLE_SNS_BOUNCES_HANDLING` to `true`. Everything
else should be setup by Terraform:
```conf
ENABLE_SNS_BOUNCES_HANDLING = true
```

### Set up TLS (HTTPS) and enable Helmet

Default DokChat Terraform setup have partially configured NGINX and certbot for you. For
this step you need to have a domain name registered.

1. Connect to your instancies - [See this section introduction](#step-4---optional-modules-and-configuration)
2. Rename `/etc/nginx/dokchat.dokurno.dev.conf` to match your domain name like: 
   `/etc/nginx/example.com.conf`
3. In this file change this line:
   ```conf
   server_name _;
   ```
   To match your domain, for example:
   ```conf
   server_name wwww.example.com example.com;
   ```
4. Run the following command to generate certificates with the Cerbot NGINX plug‑in:
   ```sh
   sudo certbot --nginx -d example.com -d www.example.com
   ```
5. Respond to prompts from certbot to configure your HTTPS settings, which involves
   entering your email address and agreeing to the Let’s Encrypt terms of service.
6. You have now successfully setup certificate for the next 90 days. You can see that your
   `/etc/nginx/example.com.conf` file have been modified.
7. To enable automatic renew, you need to add new crontab entry, type following command:
   ```sh
   crontab -e
   ``
8. Add certbot to run daily
   ```conf
   0 12 * * * /usr/bin/certbot renew --quiet
   ```
9. Save and close the file. All installed certificates will be automatically renewed and reloaded.
10. Now you have TLS working, can enable additional security measures, edit `~/DokChat/.env` file
11. Change `ENABLE_HELMET = false` to `ENABLE_HELMET = true`
12. Restart DokChat - In `~/DokChat` directory run
   ```sh
   docker-compose -f docker-compose.yaml -f docker-compose.prod.yaml up -d
   ```

## Common instancies management

Congratulations! You are now proud owner of DokChat Instance. There are some useful
administrative actions that you can do!

### Start up the instancies

Run this from `~/DokChat` directory:
```sh
docker-compose -f docker-compose.yaml -f docker-compose.prod.yaml up -d
```

### Stop the instancies

Run this from `~/DokChat` directory:
```sh
docker-compose -f docker-compose.yaml -f docker-compose.prod.yaml stop
```

### Pull new pre-built image version

Terraform deploy use [mrbartusek/dokchat:latest](https://hub.docker.com/r/mrbartusek/dokchat/tags)
image which is pre-built by [Github Actions](https://github.com/MrBartusek/DokChat/actions/workflows/ci.yaml)
on every commit. If you wish to update your image you need to run:

```sh
docker-compose -f docker-compose.yaml -f docker-compose.prod.yaml pull
```

### Remove whole deployment

You can as simply as terraform provisioned infrastructure for you, it can also destroy it but, it takes a little more work.
You can't just simply remove the infrastructure by using `terraform destroy` since EC2
instance is protected by `prevent_destroy` flag. Before proceeding forward you need to understand
**that his process will remove all DokChat data** including: database, .env configuration file,
attachment, logs and any other user data. **There is no going back**.

> **Warning**
> Removing `prevent_destroy` lifecycle tags is going to remove your database,
> .env configuration file, attachment, logs and any other user data. **There is no going back**.

Navigate to [infra/aws_ec2.tf](./infra/aws_ec2.tf) and remove following:

```diff
 resource "aws_s3_bucket" "this" {
   ...

   lifecycle {
-     # WARNING: REMOVING prevent_destroy IS GOING TO
-     # REMOVE ALL USER ATTACHMENTS
-     prevent_destroy = true
   }
 }

```

Navigate to [infra/aws_ec2.tf](./infra/aws_ec2.tf) and remove following:

```diff
 resource "aws_instance" "ec2_instance" {
   ...

   lifecycle {
     ignore_changes = [
       user_data # user data runs only after the initial launch of instance
     ]

-    # WARNING: REMOVING prevent_destroy IS GOING TO
-    # REMOVE YOUR DATABASE, CONFIGURATION FILE AND
-    # ALL OTHER DOKCHAT DATA
-    prevent_destroy = true
   }
}
```

Say you final goodbyes and run:

```sh
terraform destroy
```

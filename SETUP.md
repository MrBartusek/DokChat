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

TODO

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

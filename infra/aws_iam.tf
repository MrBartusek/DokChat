data "aws_caller_identity" "current" {}

resource "aws_iam_user" "main" {
  name = "dokchat-server-TERRAFORM"
}

resource "aws_iam_access_key" "this" {
  user = aws_iam_user.main.name
}

data "aws_iam_policy_document" "s3" {
  statement {
    effect  = "Allow"
    actions = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"]
    resources = [
      aws_s3_bucket.this.arn
    ]
  }
}

data "aws_iam_policy_document" "ses" {
  statement {
    effect  = "Allow"
    actions = ["ses:SendEmai", "ses:SendTemplatedEmail", "ses:SendRawEmail"]
    resources = [
      aws_ses_configuration_set.this.arn,
      "arn:aws:ses:${var.aws_region}:${data.aws_caller_identity.current.account_id}:template/dokchat*",
      "arn:aws:ses:${var.aws_region}:${data.aws_caller_identity.current.account_id}:identity/*"
    ]
  }
}

data "aws_iam_policy_document" "sqs" {
  statement {
    effect  = "Allow"
    actions = ["sqs:DeleteMessage", "sqs:ReceiveMessage"]
    resources = [
      aws_sqs_queue.ses_bounces.arn,
      aws_sqs_queue.ses_complaints.arn
    ]
  }
}

resource "aws_iam_user_policy" "s3" {
  name   = "dokchat-s3-policy-TERRAFORM"
  user   = aws_iam_user.main.name
  policy = data.aws_iam_policy_document.s3.json
}

resource "aws_iam_user_policy" "ses" {
  name   = "dokchat-ses-policy-TERRAFORM"
  user   = aws_iam_user.main.name
  policy = data.aws_iam_policy_document.ses.json
}

resource "aws_iam_user_policy" "sqs" {
  name   = "dokchat-sqs-policy-TERRAFORM"
  user   = aws_iam_user.main.name
  policy = data.aws_iam_policy_document.sqs.json
}


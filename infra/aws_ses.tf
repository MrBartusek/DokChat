resource "aws_ses_configuration_set" "this" {
  name = "dokchat-config-set-TERRAFORM"
}

resource "aws_ses_event_destination" "sns_bounces" {
  name                   = "dokchat-ses-bounces-destination-TERRAFORM"
  configuration_set_name = aws_ses_configuration_set.this.name
  enabled                = true
  matching_types         = ["bounce"]

  sns_destination {
    topic_arn = aws_sns_topic.ses_bounces.arn
  }
}

resource "aws_ses_event_destination" "sns_complaints" {
  name                   = "dokchat-ses-complaints-destination-TERRAFORM"
  configuration_set_name = aws_ses_configuration_set.this.name
  enabled                = true
  matching_types         = ["complaint"]

  sns_destination {
    topic_arn = aws_sns_topic.ses_complaints.arn
  }
}

resource "aws_sns_topic" "sns_bounces" {
  name = "dokchat-ses-bounces-topic-TERRAFORM"
}

resource "aws_sns_topic" "ses_complaints" {
  name = "dokchat-ses-complaints-topic-TERRAFORM"
}

resource "aws_sqs_queue" "ses_bounces" {
  name                       = "dokchat-ses-bounces-queuee-TERRAFORM"
  message_retention_seconds  = 7 * 24 * 60 * 60
  visibility_timeout_seconds = 30
}

resource "aws_sqs_queue" "ses_complaints" {
  name                       = "dokchat-ses-bounces-queuee-TERRAFORM"
  message_retention_seconds  = 7 * 24 * 60 * 60
  visibility_timeout_seconds = 30
}

resource "aws_sns_topic_subscription" "ses_bounces" {
  topic_arn = aws_sns_topic.sns_bounces.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.ses_bounces.arn
}

resource "aws_sns_topic_subscription" "ses_complaints" {
  topic_arn = aws_sns_topic.ses_complaints.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.ses_complaints.arn
}


resource "aws_ses_template" "dokchat-account-deleted" {
  name    = "dokchat-account-deleted-TERRAFORM"
  subject = jsondecode(file("../src/server/email/account-deleted.json")).Template.SubjectPart
  html    = jsondecode(file("../src/server/email/account-deleted.json")).Template.HtmlPart
}

resource "aws_ses_template" "dokchat-account-deleted" {
  name    = "dokchat-confirm-email-TERRAFORM"
  subject = jsondecode(file("../src/server/email/confirm-email.json")).Template.SubjectPart
  html    = jsondecode(file("../src/server/email/confirm-email.json")).Template.HtmlPart
}

resource "aws_ses_template" "dokchat-account-deleted" {
  name    = "dokchat-email-changed-TERRAFORM"
  subject = jsondecode(file("../src/server/email/email-changed.json")).Template.SubjectPart
  html    = jsondecode(file("../src/server/email/email-changed.json")).Template.HtmlPart
}

resource "aws_ses_template" "dokchat-account-deleted" {
  name    = "dokchat-password-reset-TERRAFORM"
  subject = jsondecode(file("../src/server/email/password-reset.json")).Template.SubjectPart
  html    = jsondecode(file("../src/server/email/password-reset.json")).Template.HtmlPart
}

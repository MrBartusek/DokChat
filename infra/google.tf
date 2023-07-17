provider "google" {
  region                = var.google_region
  project               = var.google_project
  user_project_override = true
}

resource "google_project_service" "tenor" {
  service = "tenor.googleapis.com"
}

resource "google_project_service" "apikeys" {
  service = "apikeys.googleapis.com"
}

resource "random_string" "random_suffix" {
  length  = 8
  special = false
  upper   = false
}

resource "google_apikeys_key" "tenor" {
  name         = "tenor-picker-${random_string.random_suffix.result}"
  display_name = "Tenor GIF picker"
  depends_on   = [google_project_service.apikeys]

  restrictions {
    api_targets {
      service = "tenor.googleapis.com"
    }
  }
}

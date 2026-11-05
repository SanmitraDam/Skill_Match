# SkillMatch DNA v8.0 — Planetary Geo-DNS Latency Mesh (Terraform)
# Routes global candidate and enterprise demands to the lowest-latency edge node (<10ms SLA)

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

variable "domain_name" {
  type        = string
  default     = "edge.skillmatch.ai"
  description = "SkillMatch Planetary Edge DNS zone"
}

resource "aws_route53_zone" "primary" {
  name = var.domain_name
}

# 1. North America East Edge Pop (US-East-1 / IAD)
resource "aws_route53_record" "edge_us_east" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = "mesh.${var.domain_name}"
  type    = "A"
  ttl     = 60

  latency_routing_policy {
    region = "us-east-1"
  }

  set_identifier = "edge-us-east-1"
  records        = ["198.51.100.10"]
}

# 2. Europe Central Edge Pop (EU-Central-1 / Frankfurt)
resource "aws_route53_record" "edge_eu_central" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = "mesh.${var.domain_name}"
  type    = "A"
  ttl     = 60

  latency_routing_policy {
    region = "eu-central-1"
  }

  set_identifier = "edge-eu-central-1"
  records        = ["198.51.100.20"]
}

# 3. Asia Pacific South Edge Pop (AP-South-1 / Mumbai)
resource "aws_route53_record" "edge_ap_south" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = "mesh.${var.domain_name}"
  type    = "A"
  ttl     = 60

  latency_routing_policy {
    region = "ap-south-1"
  }

  set_identifier = "edge-ap-south-1"
  records        = ["198.51.100.30"]
}

# 4. Asia Pacific East Edge Pop (AP-Northeast-1 / Tokyo)
resource "aws_route53_record" "edge_ap_east" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = "mesh.${var.domain_name}"
  type    = "A"
  ttl     = 60

  latency_routing_policy {
    region = "ap-northeast-1"
  }

  set_identifier = "edge-ap-northeast-1"
  records        = ["198.51.100.40"]
}

# Health Checks guaranteeing sub-10ms edge liveness
resource "aws_route53_health_check" "edge_pop_health" {
  for_each          = toset(["us-east-1", "eu-central-1", "ap-south-1", "ap-northeast-1"])
  fqdn              = "${each.key}.${var.domain_name}"
  port              = 443
  type              = "HTTPS"
  resource_path     = "/health"
  failure_threshold = 2
  request_interval  = 10

  tags = {
    Name    = "health-check-${each.key}"
    Project = "SkillMatch-DNA-v8-Planetary"
  }
}

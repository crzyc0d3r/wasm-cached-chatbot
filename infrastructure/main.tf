terraform {
  required_version = ">= 1.5, < 2.0"
  required_providers {
    linode = {
      source  = "linode/linode"
      version = "~> 3.0"
    }
  }
}

provider "linode" {}

resource "linode_firewall" "inference" {
  label           = "${var.name}-inference"
  inbound_policy  = "DROP"
  outbound_policy = "ACCEPT"
  inbound {
    label    = "admin-ssh"
    protocol = "TCP"
    action   = "ACCEPT"
    ports    = "22"
    ipv4     = [var.admin_cidr]
  }
  inbound {
    label    = "functions-inference"
    protocol = "TCP"
    action   = "ACCEPT"
    ports    = "11434"
    ipv4     = var.inference_cidrs
  }
}

resource "linode_instance" "gpu" {
  label           = var.name
  image           = "linode/ubuntu24.04"
  region          = var.region
  type            = var.gpu_type
  root_pass       = var.root_password
  authorized_keys = [var.ssh_public_key]
  firewall_id     = linode_firewall.inference.id
  metadata {
    user_data = base64encode(templatefile("${path.module}/cloud-init.yaml.tftpl", { model = var.model }))
  }
}

output "ollama_url" {
  value = "http://${tolist(linode_instance.gpu.ipv4)[0]}:11434"
}


variable "name" {
  type    = string
  default = "wasm-chatbot-inference"
}
variable "region" {
  type    = string
  default = "us-sea"
}
variable "gpu_type" {
  type    = string
  default = "g2-gpu-rtx4000a1-m"
}
variable "model" {
  type    = string
  default = "qwen2.5:7b"
  validation {
    condition     = can(regex("^[a-zA-Z0-9_.:/-]+$", var.model))
    error_message = "Use an Ollama model identifier without shell metacharacters."
  }
}
variable "root_password" {
  type        = string
  sensitive   = true
  description = "Set TF_VAR_root_password in the environment; state contains this value."
}
variable "ssh_public_key" {
  type        = string
  description = "Public SSH key, never a private key."
}
variable "admin_cidr" {
  type = string
  validation {
    condition     = can(cidrnetmask(var.admin_cidr)) && var.admin_cidr != "0.0.0.0/0"
    error_message = "Provide your trusted administrator IPv4 CIDR."
  }
}
variable "inference_cidrs" {
  type        = list(string)
  description = "Trusted runtime egress IPv4 ranges allowed to reach Ollama."
  validation {
    condition     = length(var.inference_cidrs) > 0 && alltrue([for cidr in var.inference_cidrs : can(cidrnetmask(cidr)) && cidr != "0.0.0.0/0"])
    error_message = "Provide explicit trusted runtime egress CIDRs; world-open inference is disallowed."
  }
}


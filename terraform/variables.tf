variable "aws_region" {
  description = "AWS Region where resources will be provisioned"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment name (e.g., dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name used for tagging and prefixing resource names"
  type        = string
  default     = "food-delivery-3tier"
}

variable "vpc_cidr" {
  description = "CIDR block for the AWS VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of Availability Zones for VPC subnets"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "eks_cluster_name" {
  description = "Name of the AWS EKS Cluster"
  type        = string
  default     = "food-delivery-eks"
}

variable "eks_cluster_version" {
  description = "Kubernetes version for the EKS Cluster"
  type        = string
  default     = "1.35"
}

variable "node_group_instance_types" {
  description = "EC2 instance types for EKS managed node group"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "node_group_desired_size" {
  description = "Desired number of worker nodes in EKS node group"
  type        = number
  default     = 2
}

variable "node_group_min_size" {
  description = "Minimum number of worker nodes in EKS node group"
  type        = number
  default     = 2
}

variable "node_group_max_size" {
  description = "Maximum number of worker nodes in EKS node group"
  type        = number
  default     = 4
}

output "aws_region" {
  description = "AWS Region of provisioned infrastructure"
  value       = var.aws_region
}

output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_public_subnets" {
  description = "IDs of the public subnets"
  value       = [aws_subnet.public_1.id, aws_subnet.public_2.id]
}

output "vpc_private_subnets" {
  description = "IDs of the private subnets"
  value       = [aws_subnet.private_1.id, aws_subnet.private_2.id]
}

output "eks_cluster_name" {
  description = "Name of the EKS Cluster"
  value       = aws_eks_cluster.main.name
}

output "eks_cluster_endpoint" {
  description = "Endpoint URL for the EKS Cluster API server"
  value       = aws_eks_cluster.main.endpoint
}

output "s3_bucket_name" {
  description = "Name of the AWS S3 Bucket created for food image uploads"
  value       = aws_s3_bucket.food_images.id
}

output "s3_bucket_arn" {
  description = "ARN of the AWS S3 Bucket"
  value       = aws_s3_bucket.food_images.arn
}

output "backend_irsa_role_arn" {
  description = "IAM Role ARN to annotate on backend Kubernetes ServiceAccount (IRSA)"
  value       = aws_iam_role.backend_irsa_role.arn
}

output "ebs_csi_irsa_role_arn" {
  description = "IAM Role ARN for EBS CSI Driver ServiceAccount (IRSA)"
  value       = aws_iam_role.ebs_csi_irsa_role.arn
}

output "configure_kubectl_command" {
  description = "AWS CLI command to update local kubeconfig for cluster access"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${aws_eks_cluster.main.name}"
}

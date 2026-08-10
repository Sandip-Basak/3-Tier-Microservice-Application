# 3-Tier Food Delivery Microservice Application

A full-stack, 3-tier microservice food delivery application designed for cloud-native deployment on **AWS EKS (Elastic Kubernetes Service)** using **Docker**, **Kubernetes**, **AWS S3**, **Helm**, and **Terraform**.

---

## 🏗️ Architecture Overview

The application consists of 4 core components:

1. **Frontend (`/frontend`)**: A React + Vite web application for customers to browse food items, manage cart items, and place orders.
2. **Admin Panel (`/admin`)**: A React + Vite administrative dashboard to view orders, add new food items with image uploads, and update order statuses.
3. **Backend (`/backend`)**: An Express.js Node.js REST API providing authentication, product catalog, cart management, Stripe integration, and AWS S3 object storage integration.
4. **Database (`MongoDB`)**: Stateful database storing food items, user accounts, orders, and cart states (configured for Kubernetes Persistent Volumes).

---

## 💻 How to Run Locally

You can run this application locally using either **Docker Compose** (recommended) or **NPM/Node.js**.

### Method 1: Running with Docker Compose (Recommended)

Running with Docker Compose sets up MongoDB, Backend, Frontend, and Admin services inside isolated containers.

#### Prerequisites
- Docker Engine / Docker Desktop installed and running (`docker --version`).
- Docker Compose installed (`docker-compose --version`).

#### Step-by-Step Instructions

1. **Navigate to the root directory**:
   ```bash
   cd /home/sandip/Documents/AWS/EKS/3-tier-application
   ```

2. **Start all services with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

3. **Verify running services**:
   - **Frontend App (Customer UI)**: [http://localhost:5173](http://localhost:5173)
   - **Admin Dashboard**: [http://localhost:5174](http://localhost:5174)
   - **Backend API**: [http://localhost:4000](http://localhost:4000)
   - **MongoDB Database**: `localhost:27017`

4. **Stop the environment**:
   ```bash
   docker-compose down
   ```
   *(To remove persistent data volumes as well, run `docker-compose down -v`)*.

---

### Method 2: Running Services Individually (NPM / Node.js)

Useful if you want to modify code live during local development without rebuilding Docker containers.

#### Prerequisites
- Node.js (v18+) and NPM installed.
- A local MongoDB instance running on `mongodb://localhost:27017` or a MongoDB Atlas URI.

#### Step-by-Step Instructions

1. **Start MongoDB**:
   Ensure MongoDB service is active on `localhost:27017`.

2. **Start Backend Service**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *Backend will start on `http://localhost:4000`.*

3. **Start Frontend Application**:
   Open a new terminal window:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Frontend will start on `http://localhost:5173`.*

4. **Start Admin Dashboard**:
   Open a third terminal window:
   ```bash
   cd admin
   npm install
   npm run dev
   ```
   *Admin panel will start on `http://localhost:5174`.*

---

## 🔄 Code Updates & Communication Fixes

To allow seamless communication between microservices across local containers and Kubernetes pods, hardcoded URLs were refactored to use dynamic environment variables with sensible defaults:

### 1. Backend Service
- **`backend/config/db.js`**: Refactored `mongoose.connect()` to read `process.env.MONGO_URI`, falling back to `mongodb://mongodb-service:27017/food-del`.
- **`backend/server.js`**:
  - Updated port listening logic to respect `process.env.PORT` (defaults to `4000`).
  - Added smart `/images/*` route middleware that automatically redirects requests to AWS S3 (`https://<bucket>.s3.<region>.amazonaws.com/<key>`) when S3 is enabled, falling back to local static `/uploads` serving otherwise.
- **`backend/controllers/orderController.js`**: Updated Stripe redirect URL (`frontend_url`) to utilize `process.env.FRONTEND_URL` (defaults to `http://localhost:5173`).
- **`backend/config/s3.js` & `backend/controllers/foodController.js`**:
  - Integrated `@aws-sdk/client-s3` for food image uploads and deletions.
  - Implemented `uploadToS3()` and `deleteFromS3()` helper routines.
  - **AWS EKS Native Support**: Supports **IRSA (IAM Roles for Service Accounts)** so Kubernetes pods automatically authenticate with S3 without hardcoded AWS keys, while still allowing fallback to explicit `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` or local disk uploads.

### 2. Frontend Web Application
- **`frontend/src/context/StoreContext.jsx`**: Updated backend base API URL to read `import.meta.env.VITE_BACKEND_URL` (defaults to `http://localhost:4000`).
- **`frontend/src/components/FoodItem/FoodItem.jsx` & `frontend/src/pages/Cart/Cart.jsx`**: Enhanced image rendering logic to render both direct S3 URLs and backend `/images` relative paths cleanly.

### 3. Admin Dashboard
- **`admin/src/App.jsx`**: Updated backend base API URL to read `import.meta.env.VITE_BACKEND_URL` (defaults to `http://localhost:4000`).
- **`admin/src/pages/List/List.jsx`**: Enhanced image rendering to handle direct S3 image URLs alongside relative paths.

---

## ☁️ AWS S3 Storage Integration

Food item images uploaded via the Admin dashboard are stored in AWS S3:

- **Upload Flow**: When an image is added via `/api/food/add`, the backend streams the file to the configured AWS S3 bucket (`AWS_S3_BUCKET_NAME`) and saves the S3 object key/URL to MongoDB.
- **Deletion Flow**: When a food item is removed via `/api/food/remove`, `deleteFromS3()` removes the corresponding image object from the AWS S3 bucket.
- **EKS IAM Authentication (IRSA)**: In EKS, the pod's service account assumes an IAM role (`IAM Role for Service Accounts`), allowing zero-credential SDK authentication.

---

## 🐳 Containerization & Web Server Configuration

- **`backend/Dockerfile`**: Lightweight `node:18-alpine` production container on port `4000`.
- **`frontend/Dockerfile` & `frontend/nginx.conf`**: Multi-stage build (`Node.js build` -> `Nginx Alpine`) with SPA fallback routing on port `80`.
- **`admin/Dockerfile` & `admin/nginx.conf`**: Multi-stage build (`Node.js build` -> `Nginx Alpine`) with SPA fallback routing on port `80`.
- **`docker-compose.yml`**: Root multi-container orchestration for MongoDB, Backend, Frontend, and Admin.

---

## 🚀 Environment Variables Summary

| Service | Variable Name | Purpose | Default / Fallback |
| :--- | :--- | :--- | :--- |
| **Backend** | `MONGO_URI` | MongoDB connection string | `mongodb://mongodb-service:27017/food-del` |
| **Backend** | `PORT` | Express server port | `4000` |
| **Backend** | `FRONTEND_URL` | Stripe redirect destination URL | `http://localhost:5173` |
| **Backend** | `JWT_SECRET` | Secret token signing key | `your_jwt_secret_key` |
| **Backend** | `AWS_S3_BUCKET_NAME` | AWS S3 Bucket name for food images | *(Optional: Local disk fallback if empty)* |
| **Backend** | `AWS_REGION` | AWS Region for S3 Bucket | `us-east-1` |
| **Backend** | `AWS_ACCESS_KEY_ID` | AWS Access Key ID (for local testing) | *(Optional if using IRSA in EKS)* |
| **Backend** | `AWS_SECRET_ACCESS_KEY` | AWS Secret Access Key (for local testing) | *(Optional if using IRSA in EKS)* |
| **Frontend** | `VITE_BACKEND_URL` | Backend REST API endpoint | `http://localhost:4000` |
| **Admin** | `VITE_BACKEND_URL` | Backend REST API endpoint | `http://localhost:4000` |

---

## 🗺️ AWS EKS & Terraform Deployment Plan

The deployment roadmap consists of 3 distinct phases:

- [x] **Phase 1: Application Updates, Local Containerization & Docker Compose**
- [x] **Phase 2: Infrastructure as Code (IaC) with Terraform & AWS ECR Setup**
  - Provision AWS VPC (2 Public / 2 Private Subnets, NAT Gateway, Route Tables).
  - Create AWS ECR Repositories for microservice container images (`backend`, `frontend`, `admin`).
  - Provision AWS S3 Bucket for food image uploads with public read CORS policy.
  - Provision AWS EKS Cluster (v1.30) and Managed Node Group (`t3.medium`).
  - Configure OIDC Provider and IAM Role for Service Account (IRSA) for backend S3 access.
- [x] **Phase 3: Kubernetes Deployment via Unified Helm Chart**
  - Unified Helm Chart (`/helm`) containing templates for MongoDB, Backend, Frontend, and Admin.
  - MongoDB StatefulSet with PersistentVolumeClaim (`5Gi`).
  - Backend API Deployment, ServiceAccount with IRSA annotation, and LoadBalancer Service (`4000`).
  - Frontend Customer UI Deployment and LoadBalancer Service (`80`).
  - Admin Dashboard Deployment and LoadBalancer Service (`80`).

---

## 🛠️ Phase 2: Infrastructure as Code (IaC) with Terraform & AWS ECR Setup

Phase 2 provisions the required cloud infrastructure on AWS using **native Terraform resources (`resource`)** — without third-party modules — and sets up container registries using the AWS CLI.

### 📁 Terraform Directory Structure (`/terraform`)

```text
terraform/
├── providers.tf            # Provider setup (AWS ~> 5.0, TLS, Random) & default tags
├── variables.tf            # Input variables (region, cluster name, node count, instance types)
├── vpc.tf                  # Native AWS VPC, Internet Gateway, 2 Public/Private subnets, NAT Gateway, Route Tables
├── s3.tf                   # Native AWS S3 Bucket for food images with CORS & public read policy
├── eks.tf                  # Native AWS EKS Cluster (v1.30), Control Plane IAM Role, Managed Node Group & Worker IAM Roles
├── iam.tf                  # Native AWS OIDC Provider (data.tls_certificate), S3 IAM Policy, and IRSA Role for backend-sa
├── outputs.tf              # Terraform outputs (EKS endpoint, S3 bucket name, IRSA ARN, kubectl command)
└── terraform.tfvars.example # Example variable values file
```

---

## ☸️ Phase 3: Kubernetes Deployment via Unified Helm Chart

Phase 3 package all microservice Kubernetes manifests into a single, highly configurable **unified Helm chart** located in `/helm`.

### 📁 Helm Directory Structure (`/helm`)

```text
helm/
├── Chart.yaml                  # Chart metadata (food-delivery v0.1.0)
├── values.yaml                 # Central configuration for ECR images, S3 bucket, IRSA ARN, and microservices
└── templates/
    ├── _helpers.tpl            # Template helper functions & common labels
    ├── mongodb-pvc.yaml        # PersistentVolumeClaim (5Gi storage for database)
    ├── mongodb-statefulset.yaml # MongoDB StatefulSet
    ├── mongodb-service.yaml    # ClusterIP Service (mongodb-service:27017)
    ├── backend-serviceaccount.yaml # ServiceAccount (backend-sa) with IRSA role annotation
    ├── backend-deployment.yaml # Backend API Deployment (port 4000)
    ├── backend-service.yaml    # Backend LoadBalancer Service
    ├── frontend-deployment.yaml# Frontend App Deployment (port 80)
    ├── frontend-service.yaml   # Frontend LoadBalancer Service
    ├── admin-deployment.yaml   # Admin Dashboard Deployment (port 80)
    └── admin-service.yaml      # Admin LoadBalancer Service
```

---

## 🚀 Master Step-by-Step Execution Guide (Phases 2 & 3)

Follow this complete step-by-step procedure to provision your infrastructure on AWS, build and push container images to AWS ECR, and deploy the entire 3-tier food delivery application to AWS EKS using Helm.

### Prerequisites

Ensure the following tools are installed on your local machine:
- **AWS CLI v2** (`aws --version`)
- **Terraform CLI (v1.3+)** (`terraform --version`)
- **Docker Engine** (`docker --version`)
- **kubectl** (`kubectl version --client`)
- **Helm CLI (v3+)** (`helm version`)

---

### Step 1: Provision AWS Infrastructure with Terraform

1. Navigate to the `terraform` directory:
   ```bash
   cd /home/sandip/Documents/AWS/EKS/3-tier-application/terraform
   ```

2. Initialize Terraform:
   ```bash
   terraform init
   ```

3. Review the execution plan:
   ```bash
   terraform plan
   ```

4. Provision all AWS resources (VPC, Subnets, EKS Cluster, Node Group, S3 Bucket, IRSA IAM Role):
   ```bash
   terraform apply
   ```
   *(Type `yes` to confirm execution).*

5. **Record Terraform Output Values**:
   Upon completion, note the outputs printed in your terminal:
   - `s3_bucket_name` (e.g. `food-delivery-3tier-images-abcdef`)
   - `backend_irsa_role_arn` (e.g. `arn:aws:iam::123456789012:role/food-delivery-3tier-backend-irsa-role`)
   - `eks_cluster_name` (`food-delivery-eks`)

---

### Step 2: Configure `kubectl` & Enable Storage on EKS

1. Update local kubeconfig to connect `kubectl` to the EKS cluster:
   ```bash
   aws eks update-kubeconfig --region us-east-1 --name food-delivery-eks
   ```

2. Verify EKS cluster node connectivity:
   ```bash
   kubectl get nodes
   ```

3. **Install AWS EBS CSI Driver Addon** (required for MongoDB PersistentVolumeClaim storage):
   ```bash
   aws eks create-addon --cluster-name food-delivery-eks --addon-name aws-ebs-csi-driver --region us-east-1
   ```

---

### Step 3: Create AWS ECR Repositories & Log In

1. Export environment variables:
   ```bash
   export AWS_REGION="us-east-1"
   export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
   export ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
   ```

2. Create 3 ECR repositories for container storage:
   ```bash
   aws ecr create-repository --repository-name food-delivery/backend --region ${AWS_REGION}
   aws ecr create-repository --repository-name food-delivery/frontend --region ${AWS_REGION}
   aws ecr create-repository --repository-name food-delivery/admin --region ${AWS_REGION}
   ```

3. Log in to AWS ECR registry:
   ```bash
   aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}
   ```

---

### Step 4: Build & Push Backend Image and Deploy Initial Stack

1. **Build and push Backend API container**:
   ```bash
   cd /home/sandip/Documents/AWS/EKS/3-tier-application
   docker build -t food-delivery/backend:latest ./backend
   docker tag food-delivery/backend:latest ${ECR_REGISTRY}/food-delivery/backend:latest
   docker push ${ECR_REGISTRY}/food-delivery/backend:latest
   ```

2. **Configure `helm/values.yaml`**:
   Open `helm/values.yaml` and update the following values with your AWS Account ID, S3 Bucket name, and IRSA Role ARN from Step 1:
   - `aws.accountId`: `<YOUR_AWS_ACCOUNT_ID>`
   - `aws.ebsCsiIrsaRoleArn`: `<ebs_csi_irsa_role_arn>`
   - `backend.image.repository`: `<YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/food-delivery/backend`
   - `backend.serviceAccount.irsaRoleArn`: `<backend_irsa_role_arn>`
   - `backend.env.s3BucketName`: `<s3_bucket_name>`
   - `frontend.image.repository`: `<YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/food-delivery/frontend`
   - `admin.image.repository`: `<YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/food-delivery/admin`

3. **Deploy Helm Chart to EKS**:
   ```bash
   helm install food-delivery ./helm
   ```

4. **Retrieve Backend LoadBalancer Endpoint**:
   ```bash
   kubectl get svc backend-service
   ```
   *(Note the `EXTERNAL-IP` / LoadBalancer DNS name of `backend-service`, e.g. `a1b2c3d4-xxxx.us-east-1.elb.amazonaws.com`).*

---

### Step 5: Build & Push Frontend and Admin Images with Backend Endpoint

1. **Export Backend Endpoint URL**:
   ```bash
   export BACKEND_URL="http://<YOUR_BACKEND_LOADBALANCER_EXTERNAL_IP>:4000"
   ```

2. **Build and Push Frontend Application**:
   ```bash
   docker build --build-arg VITE_BACKEND_URL=${BACKEND_URL} -t food-delivery/frontend:latest ./frontend
   docker tag food-delivery/frontend:latest ${ECR_REGISTRY}/food-delivery/frontend:latest
   docker push ${ECR_REGISTRY}/food-delivery/frontend:latest
   ```

3. **Build and Push Admin Dashboard**:
   ```bash
   docker build --build-arg VITE_BACKEND_URL=${BACKEND_URL} -t food-delivery/admin:latest ./admin
   docker tag food-delivery/admin:latest ${ECR_REGISTRY}/food-delivery/admin:latest
   docker push ${ECR_REGISTRY}/food-delivery/admin:latest
   ```

4. **Upgrade Helm Deployment**:
   ```bash
   helm upgrade food-delivery ./helm 
   ```
   OR to be sure the new image is pulled:
   ```bash
   kubectl rollout restart deployment backend-app frontend-app admin-app
   ```

---

### Step 6: Verify Deployment & Access Web Applications

1. Check pod status across all services:
   ```bash
   kubectl get pods -w
   ```
   *(Ensure all pods transition to `Running` status).*

2. Get LoadBalancer public URLs for all services:
   ```bash
   kubectl get svc
   ```

3. Access your microservices in the browser:
   - **Frontend App (Customer UI)**: `http://<frontend-service-EXTERNAL-IP>`
   - **Admin Dashboard**: `http://<admin-service-EXTERNAL-IP>`
   - **Backend REST API**: `http://<backend-service-EXTERNAL-IP>:4000`

---

### Step 7: Managing Database Users & Promoting Account to Admin

You can connect directly to the MongoDB instance running inside the EKS cluster to grant administrator privileges (`admin: true`) to a user account registered via the application.

#### Method 1: Single One-Liner Terminal Command (Recommended)
Run the following command in your terminal, replacing `your-email@example.com` with the target account email:
```bash
kubectl exec -it mongodb-0 -- mongosh food-del --eval 'db.users.updateOne({ email: "your-email@example.com" }, { $set: { admin: true } })'
```

#### Method 2: Interactive MongoDB Terminal Shell (`mongosh`)
1. Connect directly to the MongoDB shell inside the pod:
   ```bash
   kubectl exec -it mongodb-0 -- mongosh food-del
   ```

2. Update the user account to admin:
   ```javascript
   db.users.updateOne({ email: "your-email@example.com" }, { $set: { admin: true } })
   ```

3. Verify the user update:
   ```javascript
   db.users.find({ email: "your-email@example.com" })
   ```

4. Exit the shell:
   ```javascript
   exit
   ```

#### 🔍 Verification Command
To view all registered users and their admin status:
```bash
kubectl exec -it mongodb-0 -- mongosh food-del --eval 'db.users.find({}, { name: 1, email: 1, admin: 1 })'
```

---

### 🧹 Infrastructure Cleanup & Teardown

When you are done testing, run the following cleanup commands to destroy all AWS resources and stop hourly cloud billing:

1. **Uninstall Helm Chart**:
   ```bash
   helm uninstall food-delivery
   ```

2. **Destroy AWS Infrastructure via Terraform**:
   ```bash
   cd /home/sandip/Documents/AWS/EKS/3-tier-application/terraform
   terraform destroy
   ```
   *(Type `yes` when prompted to confirm infrastructure destruction).*



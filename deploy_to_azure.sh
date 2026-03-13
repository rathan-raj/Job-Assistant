#!/bin/bash
# Azure Deployment Script for Job Assistant

# Variables
RESOURCE_GROUP="job-assistant-rg"
LOCATION="eastus"
TAG=$RANDOM
ACR_NAME="jobassistantacr$TAG"
ENV_NAME="job-assistant-env"
DB_SERVER="jobassistantdb$TAG"

echo "========================================="
echo "Deploying Job Assistant to Azure"
echo "========================================="

# 1. Login to Azure
echo "1. Logging into Azure..."
echo "Please follow the instructions in your terminal to log in."
az login

# 2. Create Resource Group
echo "2. Creating Resource Group $RESOURCE_GROUP in $LOCATION..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# 3. Create Azure Container Registry (ACR)
echo "3. Creating Azure Container Registry $ACR_NAME..."
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true

# 4. Build and Push Backend and AI Images to ACR
echo "4. Building and Pushing Backend and AI Images to ACR..."
az acr build --registry $ACR_NAME --image job-assistant-backend:latest .
az acr build --registry $ACR_NAME --image job-assistant-ai:latest ./ai-engine

# 5. Create Azure PostgreSQL Flexible Server
echo "5. Creating PostgreSQL Database ($DB_SERVER)..."
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER \
  --location $LOCATION \
  --admin-user dbadmin \
  --admin-password "StrongPassword123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --public-access "0.0.0.0" \
  --database-name job_assistant

# 6. Create Azure Container Apps Environment
echo "6. Creating Azure Container Apps Environment $ENV_NAME..."
az containerapp env create --name $ENV_NAME --resource-group $RESOURCE_GROUP --location $LOCATION

# 7. Deploy AI Engine
echo "7. Deploying AI Engine..."
az containerapp create \
  --name ai-engine \
  --resource-group $RESOURCE_GROUP \
  --environment $ENV_NAME \
  --image $ACR_NAME.azurecr.io/job-assistant-ai:latest \
  --target-port 8000 \
  --ingress external \
  --registry-server $ACR_NAME.azurecr.io

# Get AI Engine URL
AI_URL=$(az containerapp show --name ai-engine --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv)
echo "AI Engine running at: https://$AI_URL"

# 8. Deploy Spring Boot Backend
echo "8. Deploying Spring Boot Backend..."
az containerapp create \
  --name backend \
  --resource-group $RESOURCE_GROUP \
  --environment $ENV_NAME \
  --image $ACR_NAME.azurecr.io/job-assistant-backend:latest \
  --target-port 8080 \
  --ingress external \
  --registry-server $ACR_NAME.azurecr.io \
  --env-vars SPRING_DATASOURCE_URL="jdbc:postgresql://$DB_SERVER.postgres.database.azure.com:5432/job_assistant" SPRING_DATASOURCE_USERNAME=dbadmin SPRING_DATASOURCE_PASSWORD="StrongPassword123!" NLP_SERVICE_URL="https://$AI_URL"

# Get Backend URL
BACKEND_URL=$(az containerapp show --name backend --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv)
echo "Backend running at: https://$BACKEND_URL"

# 9. Build and Deploy React Frontend
echo "9. Building and Deploying React Frontend..."
az acr build --registry $ACR_NAME \
  --image job-assistant-frontend:latest \
  --build-arg VITE_JAVA_API_URL="https://$BACKEND_URL" \
  --build-arg VITE_PYTHON_API_URL="https://$AI_URL" \
  ./frontend

az containerapp create \
  --name frontend \
  --resource-group $RESOURCE_GROUP \
  --environment $ENV_NAME \
  --image $ACR_NAME.azurecr.io/job-assistant-frontend:latest \
  --target-port 80 \
  --ingress external \
  --registry-server $ACR_NAME.azurecr.io

# Get Frontend URL
FRONTEND_URL=$(az containerapp show --name frontend --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv)

echo "========================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "Your application is fully live on Azure:"
echo "Frontend Dashboard: https://$FRONTEND_URL"
echo "Java Backend API: https://$BACKEND_URL/swagger-ui.html"
echo "Python AI Microservice: https://$AI_URL/docs"
echo "========================================="

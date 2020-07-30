# Classic
func init
func new --language JavaScript --template "Azure Service Bus Queue trigger" --name funcServiceBusToDBPusherDemo

# Utilities
func templates list      # Lists all templates
func start               # Executes the function locally
az aks install-cli       # Installs kubectl on local machine (sudo required)
az aks get-credentials --name "aks-keda-test" --resource-group "aks-keda-test" 

# Install Helm on local machine
curl https://helm.baltorepo.com/organization/signing.asc | sudo apt-key add -
echo "deb https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
sudo apt update
sudo apt install helm

# Install KEDA on AKS (Helm method -- Not recommended)
helm repo add kedacore https://kedacore.github.io/charts
helm repo update
kubectl create namespace keda
helm install keda kedacore/keda --namespace keda

# Install KEDA on AKS (func CLI method)
func kubernetes install --namespace keda --dry-run > kedaDeploy.yml
## Modify the YAML to correct the separator --- problem
## https://github.com/Azure/azure-functions-core-tools/issues/1883
kubectl apply -f kedaDeploy.yml

# Container
func init --docker --worker-runtime node --language javascript
func new --language JavaScript --template "Azure Service Bus Queue trigger" --name funcServiceBusToDBPusherDemo
npm install tedious

az acr login --name akskedatest
func kubernetes deploy --name "func-service-bus-to-db-pusher" --namespace "aks-keda-test" --registry "akskedatest.azurecr.io"

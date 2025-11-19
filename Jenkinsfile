pipeline {
    agent any

    environment {
        AWS_REGION     = 'ap-south-1'
        AWS_ACCOUNT_ID = '198146918171'
        ECR_REPO_NAME  = 'aws-ci-cd-demo'
        ECR_REPO_URI   = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/willseyyyy/aws-ci-cd-demo.git'
            }
        }

        stage('Install & Test') {
    steps {
        sh '''
          npm install
          chmod +x node_modules/.bin/jest || true
          npx jest
        '''
            }
        }


        stage('Build Docker Image') {
            steps {
                sh """
                docker build -t ${ECR_REPO_NAME}:${BUILD_NUMBER} .
                docker tag ${ECR_REPO_NAME}:${BUILD_NUMBER} ${ECR_REPO_URI}:${BUILD_NUMBER}
                docker tag ${ECR_REPO_NAME}:${BUILD_NUMBER} ${ECR_REPO_URI}:latest
                """
            }
        }

        stage('Login to ECR & Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'aws-cli-creds',
                    usernameVariable: 'AWS_ACCESS_KEY_ID',
                    passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                )]) {
                    sh """
                    aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
                    aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
                    aws configure set default.region ${AWS_REGION}

                    aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

                    docker push ${ECR_REPO_URI}:${BUILD_NUMBER}
                    docker push ${ECR_REPO_URI}:latest
                    """
                }
            }
        }

        stage('Deploy to ECS') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'aws-cli-creds',
                    usernameVariable: 'AWS_ACCESS_KEY_ID',
                    passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                )]) {
                    sh """
                    aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
                    aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
                    aws configure set default.region ${AWS_REGION}

                    aws ecs update-service \
                      --cluster aws-ci-cd-cluster \
                      --service aws-ci-cd-service \
                      --force-new-deployment \
                      --region ${AWS_REGION}
                    """
                }
            }
        }
    }

    post {
        success {
            echo "Build & deploy succeeded!"
        }
        failure {
            echo "Build or deploy failed. Check logs."
        }
    }
}

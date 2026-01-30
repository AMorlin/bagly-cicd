pipeline {
    agent any

    environment {
        REGISTRY = 'localhost:5000'
        IMAGE_TAG = "v1.0.${BUILD_NUMBER}"
        BACKEND_IMAGE = "${REGISTRY}/bagly-backend"
        FRONTEND_IMAGE = "${REGISTRY}/bagly-frontend"
    }

    // Node.js, Docker CLI e Trivy já estão instalados na imagem customizada do Jenkins
    // Ver: infra/jenkins/Dockerfile

    stages {
        // =============================================
        // STAGE 1: Checkout
        // =============================================
        stage('Checkout') {
            steps {
                checkout scm
                sh 'git --version'
                sh 'node --version'
                sh 'npm --version'
            }
        }

        // =============================================
        // STAGE 2: Build (Install Dependencies + Compile)
        // =============================================
        stage('Build') {
            parallel {
                stage('Build Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                            sh 'npm run build'
                        }
                    }
                }
                stage('Build Backend') {
                    steps {
                        dir('backend') {
                            sh 'npm ci'
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        // =============================================
        // STAGE 3: Unit Tests (with coverage)
        // =============================================
        stage('Unit Tests') {
            parallel {
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh 'npm run test:coverage -- --run'
                        }
                    }
                    post {
                        always {
                            publishHTML(target: [
                                allowMissing: true,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'frontend/coverage',
                                reportFiles: 'index.html',
                                reportName: 'Frontend Coverage Report'
                            ])
                        }
                    }
                }
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            sh 'npm run test:coverage -- --run'
                        }
                    }
                    post {
                        always {
                            publishHTML(target: [
                                allowMissing: true,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'backend/coverage',
                                reportFiles: 'index.html',
                                reportName: 'Backend Coverage Report'
                            ])
                        }
                    }
                }
            }
        }

        // =============================================
        // STAGE 4: SonarQube Scan (with coverage)
        // =============================================
        stage('SonarQube Scan') {
            environment {
                SONAR_TOKEN = credentials('sonar-token')
            }
            stages {
                stage('Backend Sonar') {
                    steps {
                        dir('backend') {
                            withSonarQubeEnv('SonarQube') {
                                sh '''
                                    sonar-scanner \
                                        -Dsonar.projectKey=bagly-backend \
                                        -Dsonar.projectName="Bagly Backend" \
                                        -Dsonar.sources=src \
                                        -Dsonar.tests=src \
                                        -Dsonar.test.inclusions=**/*.test.ts \
                                        -Dsonar.exclusions=**/node_modules/**,**/*.test.ts,**/coverage/**,**/prisma/**,**/*.routes.ts,**/config/env.ts,**/config/redis.ts,**/lib/** \
                                        -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info
                                '''
                            }
                        }
                    }
                    post {
                        always {
                            timeout(time: 10, unit: 'MINUTES') {
                                waitForQualityGate abortPipeline: true
                            }
                        }
                    }
                }
                stage('Frontend Sonar') {
                    steps {
                        dir('frontend') {
                            withSonarQubeEnv('SonarQube') {
                                sh '''
                                    sonar-scanner \
                                        -Dsonar.projectKey=bagly-frontend \
                                        -Dsonar.projectName="Bagly Frontend" \
                                        -Dsonar.sources=src \
                                        -Dsonar.tests=src \
                                        -Dsonar.test.inclusions=**/*.test.ts,**/*.test.tsx \
                                        -Dsonar.exclusions=**/node_modules/**,**/*.test.ts,**/*.test.tsx,**/coverage/**,**/components/**,**/pages/** \
                                        -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info \
                                        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                                '''
                            }
                        }
                    }
                    post {
                        always {
                            timeout(time: 10, unit: 'MINUTES') {
                                waitForQualityGate abortPipeline: true
                            }
                        }
                    }
                }
            }
        }

        // =============================================
        // STAGE 5: Trivy Repo Scan (filesystem)
        // =============================================
        stage('Trivy Repo Scan') {
            steps {
                sh '''
                    echo "Scanning repository for vulnerabilities..."
                    trivy fs . \
                        --exit-code 1 \
                        --severity HIGH,CRITICAL \
                        --ignore-unfixed \
                        --no-progress \
                        --format table
                '''
            }
        }

        // =============================================
        // STAGE 6: Docker Build
        // =============================================
        stage('Docker Build') {
            parallel {
                stage('Docker Frontend') {
                    steps {
                        dir('frontend') {
                            sh "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest ."
                        }
                    }
                }
                stage('Docker Backend') {
                    steps {
                        dir('backend') {
                            sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ."
                        }
                    }
                }
            }
        }

        // =============================================
        // STAGE 7: Trivy Image Scan
        // =============================================
        stage('Trivy Image Scan') {
            parallel {
                stage('Scan Frontend Image') {
                    steps {
                        sh """
                            echo "Scanning frontend image for vulnerabilities..."
                            trivy image \
                                --exit-code 1 \
                                --severity HIGH,CRITICAL \
                                --ignore-unfixed \
                                --no-progress \
                                --format table \
                                ${FRONTEND_IMAGE}:${IMAGE_TAG}
                        """
                    }
                }
                stage('Scan Backend Image') {
                    steps {
                        sh """
                            echo "Scanning backend image for vulnerabilities..."
                            trivy image \
                                --exit-code 1 \
                                --severity HIGH,CRITICAL \
                                --ignore-unfixed \
                                --no-progress \
                                --format table \
                                ${BACKEND_IMAGE}:${IMAGE_TAG}
                        """
                    }
                }
            }
        }

        // =============================================
        // STAGE 8: Push to Registry + Create Git Tag
        // =============================================
        stage('Push & Tag') {
            when {
                allOf {
                    branch 'main'
                    not { changeRequest() }
                }
            }
            stages {
                stage('Push to Registry') {
                    steps {
                        sh """
                            docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                            docker push ${FRONTEND_IMAGE}:latest
                            docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                            docker push ${BACKEND_IMAGE}:latest
                        """
                    }
                }
                stage('Create Git Tag') {
                    steps {
                        withCredentials([usernamePassword(
                            credentialsId: 'github-credentials',
                            usernameVariable: 'GIT_USER',
                            passwordVariable: 'GIT_TOKEN'
                        )]) {
                            sh '''
                                git config user.email "jenkins@bagly.com.br"
                                git config user.name "Jenkins CI"
                                git tag -a ${IMAGE_TAG} -m "Release ${IMAGE_TAG} - Build #${BUILD_NUMBER}"
                                git push https://${GIT_USER}:${GIT_TOKEN}@github.com/${GIT_USER}/bagly-cicd.git ${IMAGE_TAG}
                            '''
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            // Limpar imagens locais para economizar espaço
            sh '''
                docker image prune -f || true
            '''
            cleanWs()
        }
        success {
            echo "Pipeline concluído com sucesso!"
            echo "Imagens geradas: ${FRONTEND_IMAGE}:${IMAGE_TAG}, ${BACKEND_IMAGE}:${IMAGE_TAG}"
        }
        failure {
            echo "Pipeline falhou! Verifique os logs acima."
        }
    }
}

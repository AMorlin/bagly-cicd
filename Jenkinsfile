pipeline {
    agent any

    environment {
        NODEJS_VERSION = '20'
        SONAR_HOST_URL = 'http://192.168.1.16:9000'
        APP_SERVER = '192.168.1.14'
        APP_PATH = '/var/www/bagly.amorlin.dev'
        DEPLOY_USER = 'deploy_ci'
    }

    tools {
        nodejs "${NODEJS_VERSION}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'git --version'
                sh 'node --version'
                sh 'npm --version'
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }

        stage('Lint') {
            parallel {
                stage('Frontend Lint') {
                    steps {
                        dir('frontend') {
                            sh 'npm run lint'
                        }
                    }
                }
                stage('Backend Lint') {
                    steps {
                        dir('backend') {
                            sh 'npm run lint'
                        }
                    }
                }
            }
        }

        stage('Type Check') {
            parallel {
                stage('Frontend Type Check') {
                    steps {
                        dir('frontend') {
                            sh 'npm run type-check'
                        }
                    }
                }
                stage('Backend Type Check') {
                    steps {
                        dir('backend') {
                            sh 'npm run type-check'
                        }
                    }
                }
            }
        }

        stage('Unit Tests') {
            parallel {
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh 'npm run test:coverage'
                        }
                    }
                    post {
                        always {
                            publishHTML(target: [
                                allowMissing: true,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'frontend/coverage/lcov-report',
                                reportFiles: 'index.html',
                                reportName: 'Frontend Coverage Report'
                            ])
                        }
                    }
                }
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            sh 'npm run test:coverage'
                        }
                    }
                    post {
                        always {
                            publishHTML(target: [
                                allowMissing: true,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'backend/coverage/lcov-report',
                                reportFiles: 'index.html',
                                reportName: 'Backend Coverage Report'
                            ])
                        }
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            environment {
                SONAR_TOKEN = credentials('sonarqube-token')
            }
            parallel {
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
                                        -Dsonar.test.inclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx \
                                        -Dsonar.exclusions=**/node_modules/**,**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx,**/coverage/** \
                                        -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info \
                                        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                                '''
                            }
                        }
                    }
                }
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
                                        -Dsonar.test.inclusions=**/*.test.ts,**/*.spec.ts \
                                        -Dsonar.exclusions=**/node_modules/**,**/*.test.ts,**/*.spec.ts,**/coverage/**,**/prisma/** \
                                        -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info
                                '''
                            }
                        }
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build') {
            parallel {
                stage('Build Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm run build'
                        }
                    }
                }
                stage('Build Backend') {
                    steps {
                        dir('backend') {
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Docker Build') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            parallel {
                stage('Docker Frontend') {
                    steps {
                        dir('frontend') {
                            sh "docker build -t bagly-frontend:${BUILD_NUMBER} -t bagly-frontend:latest ."
                        }
                    }
                }
                stage('Docker Backend') {
                    steps {
                        dir('backend') {
                            sh "docker build -t bagly-backend:${BUILD_NUMBER} -t bagly-backend:latest ."
                        }
                    }
                }
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                echo 'Deploying to staging environment...'
                // sh 'docker-compose -f docker-compose.staging.yml up -d'
            }
        }

        stage('Deploy to Production') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                echo 'Deploying to production environment...'
                sshagent(credentials: ['app-server-ssh']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${APP_SERVER} '
                            cd ${APP_PATH}

                            # Clone or pull repository (using SSH)
                            if [ ! -d ".git" ]; then
                                git clone git@gitlab.amorlin.dev:devops/bagly.git .
                            else
                                git fetch origin
                                git reset --hard origin/main
                            fi

                            # Create .env if not exists
                            if [ ! -f ".env" ]; then
                                cp .env.production.example .env
                                echo "WARNING: .env created from example. Please configure it!"
                            fi

                            # Build and deploy with force-recreate to apply env changes
                            docker compose -f docker-compose.prod.yml down
                            docker compose -f docker-compose.prod.yml build --no-cache
                            docker compose -f docker-compose.prod.yml up -d --force-recreate

                            # Cleanup old images
                            docker image prune -f

                            # Show status
                            docker compose -f docker-compose.prod.yml ps
                        '
                    """
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
            // Notificar via Slack/Email em caso de sucesso
        }
        failure {
            echo 'Pipeline failed!'
            // Notificar via Slack/Email em caso de falha
        }
        unstable {
            echo 'Pipeline is unstable!'
        }
    }
}

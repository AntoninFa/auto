import dotenv from 'dotenv';
import process from 'node:process';
import scanner from 'sonarqube-scanner';

dotenv.config();
const sonarToken = process.env.SONAR_TOKEN;

scanner(
    {
        serverUrl: 'http://localhost:9000',
        options: {
            'sonar.projectName': 'auto',
            'sonar.projectDescription': 'Auto Server',
            'sonar.projectVersion': '2023.1.0',
            'sonar.sources': 'src',
            'sonar.tests': '__tests__',
            'sonar.token': sonarToken,
            'sonar.scm.disabled': 'true',
            'sonar.javascript.environments': 'node',
        },
    },
    () => process.exit(),
);

# 1. Node.js 18 버전 기반 이미지 사용
FROM node:18

# 2. 작업 디렉토리 설정
WORKDIR /usr/src/app

# 3. package.json과 package-lock.json 복사 (캐시 효율을 위해 먼저 함)
COPY package*.json ./

# 4. 의존성 설치
RUN npm install

# 5. 소스 코드 전체 복사
COPY . .

# 6. 포트 열기 (Express 포트)
EXPOSE 3000

# 7. 서버 실행 명령어
CMD ["npm", "start"]
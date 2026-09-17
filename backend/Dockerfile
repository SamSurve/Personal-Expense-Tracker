# Lightweight Dockerfile for Core Java HttpServer Backend
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Copy backend sources and library dependencies
COPY . .

# Support build context from either root or backend subfolder
RUN if [ -d "backend/src" ]; then cp -r backend/src ./src && cp -r backend/lib ./lib && cp backend/schema.sql ./schema.sql; fi

# Compile Java source files to bin directory
RUN mkdir -p bin && javac -cp "lib/*" -d bin $(find src -name "*.java")

# Expose default port 8080 (overridden dynamically via PORT environment variable)
EXPOSE 8080

# Launch Core Java HttpServer App
CMD ["java", "-cp", "bin:lib/*", "com.expensetracker.api.HttpServerApp"]

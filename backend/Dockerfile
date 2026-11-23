# Multi-stage Docker build for Spring Boot Kotlin backend
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /workspace

# Copy gradle wrapper and config
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts settings.gradle.kts ./

# Make gradlew executable
RUN chmod +x ./gradlew

# Download dependencies
RUN ./gradlew dependencies --no-daemon || true

# Copy source code and build executable jar
COPY src src
RUN ./gradlew bootJar --no-daemon -x test

# Runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Run as non-root user
RUN addgroup -S taskflow && adduser -S taskflow -G taskflow
USER taskflow

COPY --from=builder /workspace/build/libs/*.jar app.jar

ENV PORT=5000
EXPOSE 5000

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]

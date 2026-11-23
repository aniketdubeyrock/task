package com.taskflow.domain

enum class Role {
    USER,
    ADMIN,
    SUPERADMIN
}

enum class TaskStatus {
    TODO,
    IN_PROGRESS,
    DONE
}

enum class TaskPriority {
    LOW,
    MEDIUM,
    HIGH
}

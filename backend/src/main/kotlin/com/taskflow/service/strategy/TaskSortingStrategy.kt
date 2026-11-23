package com.taskflow.service.strategy

import org.springframework.data.domain.Sort
import org.springframework.stereotype.Component

interface TaskSortingStrategy {
    fun getSort(direction: Sort.Direction = Sort.Direction.ASC): Sort
    fun supports(sortBy: String?): Boolean
}

@Component
class DueDateSortingStrategy : TaskSortingStrategy {
    override fun getSort(direction: Sort.Direction): Sort = Sort.by(direction, "dueDate")
    override fun supports(sortBy: String?): Boolean = sortBy?.equals("dueDate", ignoreCase = true) == true
}

@Component
class PrioritySortingStrategy : TaskSortingStrategy {
    override fun getSort(direction: Sort.Direction): Sort = Sort.by(direction, "priority")
    override fun supports(sortBy: String?): Boolean = sortBy?.equals("priority", ignoreCase = true) == true
}

@Component
class DefaultSortingStrategy : TaskSortingStrategy {
    override fun getSort(direction: Sort.Direction): Sort = Sort.by(direction, "createdAt")
    override fun supports(sortBy: String?): Boolean =
        sortBy.isNullOrBlank() || sortBy.equals("createdAt", ignoreCase = true)
}

@Component
class TaskSortingContext(
    private val strategies: List<TaskSortingStrategy>
) {
    fun resolveSort(sortBy: String?, order: String? = "asc"): Sort {
        val direction = if (order?.equals("desc", ignoreCase = true) == true) {
            Sort.Direction.DESC
        } else {
            Sort.Direction.ASC
        }
        val strategy = strategies.find { it.supports(sortBy) } ?: strategies.first { it is DefaultSortingStrategy }
        return strategy.getSort(direction)
    }
}

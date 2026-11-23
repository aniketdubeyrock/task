import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from '../components/ui/Button';
import { Badge, StatusBadge, PriorityBadge } from '../components/ui/Badge';
import { EmptyState } from '../components/feedback/EmptyState';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/layout/ThemeToggle';
import { FolderKanban } from 'lucide-react';

describe('Frontend Crisp UI Component Suite', () => {
  it('renders primary button with children text', () => {
    render(<Button variant="primary">Create Project</Button>);
    expect(screen.getByText('Create Project')).toBeInTheDocument();
  });

  it('renders button in loading state with disabled attribute', () => {
    render(<Button isLoading>Saving...</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('renders StatusBadge with correct text and styling', () => {
    render(<StatusBadge status="IN_PROGRESS" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('renders PriorityBadge with high priority', () => {
    render(<PriorityBadge priority="HIGH" />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders EmptyState with icon, title, and action button', () => {
    render(
      <EmptyState
        icon={FolderKanban}
        title="No Tasks Found"
        description="Get started by creating your first task"
        actionLabel="New Task"
        onAction={() => {}}
      />
    );
    expect(screen.getByText('No Tasks Found')).toBeInTheDocument();
    expect(screen.getByText('Get started by creating your first task')).toBeInTheDocument();
    expect(screen.getByText('New Task')).toBeInTheDocument();
  });

  it('toggles dark and light mode via ThemeToggle', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const toggleBtn = screen.getByRole('button', { name: /toggle theme/i });
    expect(toggleBtn).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    fireEvent.click(toggleBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});


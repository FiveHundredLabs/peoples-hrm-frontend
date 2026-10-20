export interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center p-8 text-center">
      <div className="h-9 w-9 animate-spin rounded-full border-[2.5px] border-primary border-t-transparent" />
      <p className="mt-4 text-sm font-medium text-body">{message}</p>
    </div>
  );
}

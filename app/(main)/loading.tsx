export default function MainLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        <p className="text-sm text-gray-500">Đang tải...</p>
      </div>
    </div>
  );
}

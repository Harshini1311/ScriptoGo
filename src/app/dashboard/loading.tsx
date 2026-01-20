export default function DashboardLoading() {
    return (
        <div className="min-h-screen text-foreground">
            <header className="border-b border-border bg-card p-4">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="h-8 w-32 bg-muted animate-pulse rounded-md" />
                        <nav className="flex items-center gap-4">
                            <div className="h-4 w-20 bg-muted animate-pulse rounded-md" />
                            <div className="h-4 w-28 bg-muted animate-pulse rounded-md" />
                        </nav>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-7xl p-8">
                <div className="mb-8 flex items-center justify-between">
                    <div className="h-10 w-48 bg-muted animate-pulse rounded-md" />
                    <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-48 rounded-md border border-border bg-card p-6 animate-pulse">
                            <div className="space-y-4">
                                <div className="h-4 w-1/4 bg-muted rounded-md" />
                                <div className="h-6 w-3/4 bg-muted rounded-md" />
                                <div className="space-y-2">
                                    <div className="h-3 w-full bg-muted rounded-md" />
                                    <div className="h-3 w-5/6 bg-muted rounded-md" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
